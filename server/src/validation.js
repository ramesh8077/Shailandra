import { z } from 'zod';
import sanitizeHtml from 'sanitize-html';
import { readFileSync } from 'node:fs';
const manifest = JSON.parse(readFileSync(new URL('../content-manifest.json', import.meta.url), 'utf8'));
const text = z.string().max(20000);
export const mediaUrl = z.string().regex(/^\/api\/media\/[a-f\d]{24}$/);
export const safeLink = z.string().max(2000).refine(v => /^(\/(?!\/)|#|https:\/\/|mailto:|tel:)/.test(v), 'Use a local path, HTTPS, mailto or tel URL');
export function cleanBody(html) {
  return sanitizeHtml(html, {
    allowedTags: ['p', 'br', 'strong', 'em', 'u', 'h2', 'h3', 'ul', 'ol', 'li', 'blockquote', 'a', 'img'],
    allowedAttributes: {
      a: ['href'],
      img: ['src', 'alt']
    },
    allowedSchemes: ['https', 'mailto'],
    allowProtocolRelative: false,
    transformTags: {
      img: (_tag, attrs) => ({
        tagName: 'img',
        attribs: /^\/api\/media\/[a-f\d]{24}$/.test(attrs.src || '') ? {
          src: attrs.src,
          alt: attrs.alt || ''
        } : {}
      })
    }
  });
}
export const video = z.string().max(300).refine(v => !v || /^https:\/\/(www\.youtube-nocookie\.com\/embed\/[\w-]{11}|player\.vimeo\.com\/video\/\d+)$/.test(v), 'Use https://www.youtube-nocookie.com/embed/VIDEO_ID or https://player.vimeo.com/video/ID');
const post = z.object({
  type: z.enum(['article', 'news', 'video']),
  title: z.string().min(1).max(200),
  slug: z.string().min(1).max(180).regex(/^[\p{L}\p{N}]+(?:-[\p{L}\p{N}]+)*$/u),
  locale: z.enum(['en', 'hi']),
  excerpt: z.string().max(1000),
  body: z.string().max(200000).transform(cleanBody),
  cover: z.union([mediaUrl, z.literal('')]),
  category: z.string().max(100),
  tags: z.array(z.string().max(50)).max(20),
  author: z.string().min(1).max(120),
  seoTitle: z.string().max(200),
  seoDescription: z.string().max(400),
  videoUrl: video
}).strict();
const journey = z.object({
  year: z.string().min(1).max(50),
  title: z.string().min(1).max(200),
  text,
  order: z.number().int().min(0).max(10000),
  locale: z.enum(['en', 'hi'])
}).strict();
export function validateContent(kind, key, value) {
  if (kind === 'post') return post.parse(value);
  if (kind === 'journey') return journey.parse(value);
  const section = manifest.sections[key];
  if (!section || section.kind !== kind) throw Object.assign(new Error('Unsupported page section'), {
    status: 400
  });
  const shape = Object.fromEntries(Object.entries(section.fields).map(([k, f]) => [k, f.type === 'image' ? mediaUrl : f.type === 'link' ? safeLink : f.type === 'videoId' ? z.string().regex(/^[\w-]{11}$/) : text]));
  return z.object({
    en: z.object(shape).strict(),
    hi: z.object(shape).strict()
  }).strict().parse(value);
}
export { manifest };
export const credentials = z.object({
  email: z.string().email().max(254).transform(v => v.toLowerCase()),
  password: z.string().min(12).max(128)
}).strict();
export const userInput = credentials.extend({
  name: z.string().min(1).max(120),
  role: z.enum(['administrator', 'editor'])
});
