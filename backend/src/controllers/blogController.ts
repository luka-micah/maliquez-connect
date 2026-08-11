import { Response, NextFunction } from 'express';
import { Prisma } from '@prisma/client';
import prisma from '../config/prisma.js';
import ApiError from '../utils/ApiError.js';
import ApiResponse from '../utils/ApiResponse.js';
import { slugify, calculatePagination, parsePagination } from '../utils/helpers.js';
import { uploadBlogCoverToCloudinary, deleteBlogCoverFromCloudinary, deleteBlogCoverFolder } from '../services/cloudinaryService.js';
import type { AuthRequest } from '../types/index.js';

const POST_STATUS = {
  DRAFT: 'DRAFT' as const,
  PUBLISHED: 'PUBLISHED' as const,
};

const authorSelect = {
  select: { firstName: true, lastName: true, avatar: true },
};

const parseTags = (tags: unknown): string[] => {
  if (Array.isArray(tags)) {
    return tags.map((t: unknown) => String(t).trim()).filter(Boolean);
  }
  if (typeof tags === 'string' && tags.trim()) {
    try {
      const parsed = JSON.parse(tags) as unknown;
      if (Array.isArray(parsed)) {
        return parsed.map((t: unknown) => String(t).trim()).filter(Boolean);
      }
    } catch {
      // not JSON, fall through to comma-separated
    }
    return tags.split(',').map((t) => t.trim()).filter(Boolean);
  }
  return [];
};

const makeUniqueSlug = async (base: string, excludeId?: string): Promise<string> => {
  let slug = slugify(base);
  let candidate = slug;
  let counter = 1;
  let existing = await prisma.blogPost.findUnique({
    where: { slug: candidate },
    select: { id: true },
  });
  while (existing && existing.id !== excludeId) {
    candidate = `${slug}-${counter}`;
    counter += 1;
    existing = await prisma.blogPost.findUnique({
      where: { slug: candidate },
      select: { id: true },
    });
  }
  return candidate;
};

export const getPublishedPosts = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { page, limit, skip } = parsePagination(req.query as { page?: string; limit?: string });

    const where: Prisma.BlogPostWhereInput = { status: POST_STATUS.PUBLISHED };

    const [posts, total] = await Promise.all([
      prisma.blogPost.findMany({
        where,
        select: {
          id: true,
          title: true,
          slug: true,
          excerpt: true,
          coverImage: true,
          tags: true,
          likeCount: true,
          viewCount: true,
          status: true,
          publishedAt: true,
          createdAt: true,
          updatedAt: true,
          author: authorSelect,
          _count: { select: { comments: true } },
        },
        orderBy: { publishedAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.blogPost.count({ where }),
    ]);

    const pagination = calculatePagination(page, limit, total);
    res.json(ApiResponse.paginated(posts, pagination));
  } catch (error) {
    next(error);
  }
};

export const getPublishedPostBySlug = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const post = await prisma.blogPost.findUnique({
      where: { slug: req.params.slug },
      select: {
        id: true,
        title: true,
        slug: true,
        excerpt: true,
        content: true,
        coverImage: true,
        tags: true,
        likeCount: true,
        viewCount: true,
        status: true,
        publishedAt: true,
        createdAt: true,
        updatedAt: true,
        author: authorSelect,
        _count: { select: { comments: true } },
      },
    });

    if (!post || post.status !== POST_STATUS.PUBLISHED) {
      throw ApiError.notFound('Post not found');
    }

    const updated = await prisma.blogPost.update({
      where: { id: post.id },
      data: { viewCount: { increment: 1 } },
      select: { viewCount: true },
    });

    const liked = req.userId
      ? await prisma.blogLike.findUnique({
          where: { postId_userId: { postId: post.id, userId: req.userId } },
          select: { id: true },
        })
      : null;

    res.json(ApiResponse.success({ ...post, viewCount: updated.viewCount, liked: Boolean(liked) }));
  } catch (error) {
    next(error);
  }
};

export const getAllPosts = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { page, limit, skip } = parsePagination(req.query as { page?: string; limit?: string });
    const status = req.query.status as string | undefined;
    const search = req.query.search as string | undefined;

    const where: Prisma.BlogPostWhereInput = {};
    if (status && (status === POST_STATUS.DRAFT || status === POST_STATUS.PUBLISHED)) {
      where.status = status;
    }
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { slug: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [posts, total] = await Promise.all([
      prisma.blogPost.findMany({
        where,
        include: { author: authorSelect, _count: { select: { comments: true } } },
        orderBy: { updatedAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.blogPost.count({ where }),
    ]);

    const pagination = calculatePagination(page, limit, total);
    res.json(ApiResponse.paginated(posts, pagination));
  } catch (error) {
    next(error);
  }
};

export const getPost = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const post = await prisma.blogPost.findUnique({
      where: { id: req.params.id },
      include: { author: authorSelect, _count: { select: { comments: true } } },
    });

    if (!post) {
      throw ApiError.notFound('Post not found');
    }

    res.json(ApiResponse.success(post));
  } catch (error) {
    next(error);
  }
};

export const createPost = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const data = req.body;
    const title = data.title?.trim();
    if (!title) {
      throw ApiError.badRequest('Title is required');
    }

    const slug = await makeUniqueSlug(data.slug?.trim() || title);
    const status = data.status === POST_STATUS.PUBLISHED ? POST_STATUS.PUBLISHED : POST_STATUS.DRAFT;

    const post = await prisma.blogPost.create({
      data: {
        title,
        slug,
        excerpt: data.excerpt || null,
        content: data.content || '',
        tags: parseTags(data.tags),
        authorId: req.userId!,
        status,
        publishedAt: status === POST_STATUS.PUBLISHED ? new Date() : null,
      },
      include: { author: authorSelect },
    });

    let coverImage: string | null = null;
    let coverImagePublicId: string | null = null;

    if (req.file) {
      try {
        const uploaded = await uploadBlogCoverToCloudinary(req.file, post.id);
        coverImage = uploaded.url;
        coverImagePublicId = uploaded.publicId;
      } catch (error) {
        await prisma.blogPost.delete({ where: { id: post.id } });
        return next(error);
      }
    }

    if (coverImage || coverImagePublicId) {
      await prisma.blogPost.update({
        where: { id: post.id },
        data: { coverImage, coverImagePublicId },
      });
    }

    const created = await prisma.blogPost.findUnique({
      where: { id: post.id },
      include: { author: authorSelect },
    });

    res.status(201).json(ApiResponse.created(created, 'Post created'));
  } catch (error) {
    next(error);
  }
};

export const updatePost = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const existing = await prisma.blogPost.findUnique({ where: { id: req.params.id } });
    if (!existing) {
      throw ApiError.notFound('Post not found');
    }

    const data = req.body;
    const updateData: Prisma.BlogPostUpdateInput = {};

    if (data.title !== undefined) {
      if (!String(data.title).trim()) {
        throw ApiError.badRequest('Title cannot be empty');
      }
      updateData.title = String(data.title).trim();
    }
    if (data.slug !== undefined && String(data.slug).trim() !== existing.slug) {
      updateData.slug = await makeUniqueSlug(String(data.slug).trim() || String(updateData.title || existing.title), existing.id);
    }
    if (data.excerpt !== undefined) updateData.excerpt = data.excerpt;
    if (data.content !== undefined) updateData.content = data.content;
    if (data.tags !== undefined) {
      updateData.tags = parseTags(data.tags);
    }

    if (data.status !== undefined) {
      const nextStatus = data.status === POST_STATUS.PUBLISHED ? POST_STATUS.PUBLISHED : POST_STATUS.DRAFT;
      updateData.status = nextStatus;
      if (nextStatus === POST_STATUS.PUBLISHED && existing.status !== POST_STATUS.PUBLISHED) {
        updateData.publishedAt = new Date();
      } else if (nextStatus === POST_STATUS.DRAFT) {
        updateData.publishedAt = null;
      }
    }

    if (req.file) {
      const uploaded = await uploadBlogCoverToCloudinary(req.file, existing.id);
      updateData.coverImage = uploaded.url;
      updateData.coverImagePublicId = uploaded.publicId;
      if (existing.coverImagePublicId) {
        await deleteBlogCoverFromCloudinary(existing.coverImagePublicId);
      }
    } else if (data.removeCoverImage === 'true' || data.removeCoverImage === true) {
      updateData.coverImage = null;
      updateData.coverImagePublicId = null;
      if (existing.coverImagePublicId) {
        await deleteBlogCoverFromCloudinary(existing.coverImagePublicId);
      }
    }

    const post = await prisma.blogPost.update({
      where: { id: existing.id },
      data: updateData,
      include: { author: authorSelect, _count: { select: { comments: true } } },
    });

    res.json(ApiResponse.success(post, 'Post updated'));
  } catch (error) {
    next(error);
  }
};

export const deletePost = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const existing = await prisma.blogPost.findUnique({
      where: { id: req.params.id },
      select: { id: true, coverImagePublicId: true },
    });

    if (!existing) {
      throw ApiError.notFound('Post not found');
    }

    await prisma.blogPost.delete({ where: { id: existing.id } });
    if (existing.coverImagePublicId) {
      await deleteBlogCoverFromCloudinary(existing.coverImagePublicId);
    } else {
      await deleteBlogCoverFolder(existing.id);
    }

    res.json(ApiResponse.success(null, 'Post deleted'));
  } catch (error: unknown) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      return next(ApiError.notFound('Post not found'));
    }
    next(error);
  }
};

export const toggleLike = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const post = await prisma.blogPost.findUnique({
      where: { id: req.params.id },
      select: { id: true, status: true },
    });

    if (!post || post.status !== POST_STATUS.PUBLISHED) {
      throw ApiError.notFound('Post not found');
    }

    const existingLike = await prisma.blogLike.findUnique({
      where: { postId_userId: { postId: post.id, userId: req.userId! } },
    });

    if (existingLike) {
      await prisma.blogLike.delete({ where: { id: existingLike.id } });
      const updated = await prisma.blogPost.update({
        where: { id: post.id },
        data: { likeCount: { decrement: 1 } },
        select: { likeCount: true },
      });
      return res.json(ApiResponse.success({ liked: false, likeCount: Math.max(0, updated.likeCount) }, 'Like removed'));
    }

    await prisma.blogLike.create({
      data: {
        postId: post.id,
        userId: req.userId!,
      },
    });
    const updated = await prisma.blogPost.update({
      where: { id: post.id },
      data: { likeCount: { increment: 1 } },
      select: { likeCount: true },
    });

    res.json(ApiResponse.success({ liked: true, likeCount: updated.likeCount }, 'Post liked'));
  } catch (error) {
    next(error);
  }
};

export const getComments = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const post = await prisma.blogPost.findUnique({
      where: { slug: req.params.slug },
      select: { id: true },
    });

    if (!post) {
      throw ApiError.notFound('Post not found');
    }

    const comments = await prisma.blogComment.findMany({
      where: { postId: post.id },
      include: {
        user: { select: { firstName: true, lastName: true, avatar: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(ApiResponse.success(comments));
  } catch (error) {
    next(error);
  }
};

export const addComment = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const post = await prisma.blogPost.findUnique({
      where: { id: req.params.id },
      select: { id: true, status: true },
    });

    if (!post || post.status !== POST_STATUS.PUBLISHED) {
      throw ApiError.notFound('Post not found');
    }

    const content = req.body.content?.trim();
    if (!content) {
      throw ApiError.badRequest('Comment content is required');
    }

    const comment = await prisma.blogComment.create({
      data: {
        postId: post.id,
        userId: req.userId!,
        content,
      },
      include: {
        user: { select: { firstName: true, lastName: true, avatar: true } },
      },
    });

    res.status(201).json(ApiResponse.created(comment, 'Comment added'));
  } catch (error) {
    next(error);
  }
};

export const deleteComment = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const comment = await prisma.blogComment.findUnique({ where: { id: req.params.id } });

    if (!comment) {
      throw ApiError.notFound('Comment not found');
    }

    if (comment.userId !== req.userId && req.userRole !== 'ADMIN') {
      throw ApiError.forbidden('You can only delete your own comments');
    }

    await prisma.blogComment.delete({ where: { id: comment.id } });
    res.json(ApiResponse.success(null, 'Comment deleted'));
  } catch (error) {
    next(error);
  }
};
