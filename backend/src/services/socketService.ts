import { Server as HTTPServer } from 'http';
import { Server, Socket } from 'socket.io';
import { verifyAccessToken } from '../utils/generateToken.js';
import prisma from '../config/prisma.js';

interface AuthenticatedSocket extends Socket {
  userId?: string;
  userRole?: string;
}

export const initializeSocket = (httpServer: HTTPServer) => {
  const io = new Server(httpServer, {
    cors: {
      origin: (process.env.CLIENT_URL || 'http://localhost:5173').split(',').map((o) => o.trim()),
      credentials: true,
    },
  });

  io.use(async (socket: AuthenticatedSocket, next) => {
    try {
      const token = socket.handshake.auth.token || socket.handshake.query.token;
      if (!token) {
        return next(new Error('Authentication required'));
      }
      const decoded = verifyAccessToken(token as string) as { id: string; role: string };
      const user = await prisma.user.findUnique({ where: { id: decoded.id } });
      if (!user || user.status !== 'ACTIVE') {
        return next(new Error('User not found or inactive'));
      }
      socket.userId = user.id;
      socket.userRole = user.role;
      next();
    } catch {
      next(new Error('Invalid or expired token'));
    }
  });

  io.on('connection', (socket: AuthenticatedSocket) => {
    const userId = socket.userId!;

    socket.join(`user:${userId}`);

    socket.on('join_conversation', (conversationId: string) => {
      socket.join(`conversation:${conversationId}`);
    });

    socket.on('leave_conversation', (conversationId: string) => {
      socket.leave(`conversation:${conversationId}`);
    });

    socket.on('send_message', async (data: { conversationId: string; content: string }) => {
      try {
        const { conversationId, content } = data;
        if (!content?.trim()) return;

        const conversation = await prisma.conversation.findUnique({
          where: { id: conversationId },
          include: { listing: { select: { ownerId: true } } },
        });

        if (!conversation) {
          socket.emit('error', { message: 'Conversation not found' });
          return;
        }

        const isUser = conversation.userId === userId;
        const isProvider = conversation.providerId === userId;

        if (!isUser && !isProvider) {
          socket.emit('error', { message: 'Access denied' });
          return;
        }

        if (socket.userRole === 'USER' && isProvider) {
          socket.emit('error', { message: 'Users cannot reply as provider' });
          return;
        }

        if (socket.userRole === 'PROVIDER' && !isProvider) {
          socket.emit('error', { message: 'You can only reply to conversations for your own listings' });
          return;
        }

        const message = await prisma.message.create({
          data: { conversationId, senderId: userId, content: content.trim() },
          include: { sender: { select: { id: true, firstName: true, lastName: true, avatar: true } } },
        });

        await prisma.conversation.update({
          where: { id: conversationId },
          data: { lastMessage: content.trim(), lastMessageAt: new Date() },
        });

        io.to(`conversation:${conversationId}`).emit('new_message', message);

        const recipientId = isUser ? conversation.providerId : conversation.userId;
        io.to(`user:${recipientId}`).emit('conversation_updated', { conversationId });
      } catch (error) {
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    socket.on('mark_read', async (conversationId: string) => {
      try {
        const conversation = await prisma.conversation.findUnique({ where: { id: conversationId } });
        if (!conversation) return;
        if (conversation.userId !== userId && conversation.providerId !== userId) return;

        await prisma.message.updateMany({
          where: { conversationId, senderId: { not: userId }, read: false },
          data: { read: true },
        });

        io.to(`conversation:${conversationId}`).emit('messages_read', { conversationId, readBy: userId });
      } catch {
        // silent
      }
    });

    socket.on('disconnect', () => {});
  });

  return io;
};
