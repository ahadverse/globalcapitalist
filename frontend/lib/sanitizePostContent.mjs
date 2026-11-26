import sanitizeHtml from 'sanitize-html';

export default function sanitizePostContent(content) {
  return sanitizeHtml(content, {
    allowedTags: [...new Set([
      ...sanitizeHtml.defaults.allowedTags,
      'figure',
      'figcaption',
      'img',
      'u',
      's',
      'hr',
      'pre',
      'code',
      'table',
      'thead',
      'tbody',
      'tr',
      'th',
      'td',
    ])],
    allowedAttributes: {
      a: ['href', 'name', 'target', 'rel'],
      img: ['src', 'alt', 'title', 'width', 'height', 'loading'],
    },
    allowedSchemes: ['http', 'https', 'mailto', 'tel'],
    allowedSchemesByTag: { img: ['http', 'https'] },
    transformTags: {
      a: sanitizeHtml.simpleTransform('a', { rel: 'noopener noreferrer' }, true),
    },
  });
}
