const sanitizeHtml = require('sanitize-html');

const sanitizeLessonContent = (content = '') =>
  sanitizeHtml(content, {
    allowedTags: [
      'p',
      'br',
      'strong',
      'em',
      'u',
      'ul',
      'ol',
      'li',
      'h1',
      'h2',
      'h3',
      'blockquote',
      'code',
      'pre',
      'a',
    ],
    allowedAttributes: {
      a: ['href', 'target', 'rel'],
    },
    allowedSchemes: ['http', 'https', 'mailto'],
    allowProtocolRelative: false,
  });

module.exports = sanitizeLessonContent;
