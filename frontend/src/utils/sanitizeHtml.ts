import DOMPurify from 'dompurify';

export const sanitizeHtml = (html: string): string => DOMPurify.sanitize(html);

export const hasHtmlTags = (text: string): boolean => /<\/?[a-z][\s\S]*>/i.test(text);

export const plainTextToHtml = (text: string): string => {
  if (hasHtmlTags(text)) return text;
  return text
    .split(/\n{2,}/)
    .map((paragraph) => `<p>${paragraph.replace(/\n/g, '<br>')}</p>`)
    .join('');
};

export const htmlToPlainText = (html: string): string => {
  if (!html) return '';
  const doc = new DOMParser().parseFromString(html, 'text/html');
  return (doc.body.textContent || '').replace(/\s+/g, ' ').trim();
};
