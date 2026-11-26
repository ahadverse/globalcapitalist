import assert from 'node:assert/strict';
import test from 'node:test';
import sanitizePostContent from '../lib/sanitizePostContent.mjs';

test('preserves common markup and removes active content', () => {
  const result = sanitizePostContent(
    '<p>Safe <strong>text</strong></p><script>window.alert(1)</script><img src="photo.jpg" onerror="alert(1)"><a href="javascript:alert(1)">unsafe</a>'
  );

  assert.match(result, /<p>Safe <strong>text<\/strong><\/p>/);
  assert.match(result, /<img src="photo\.jpg" \/>/);
  assert.doesNotMatch(result, /script|onerror|javascript:/i);
});

test('adds safe rel attributes to links', () => {
  const result = sanitizePostContent('<a href="https://example.com" target="_blank">external</a>');

  assert.match(result, /rel="noopener noreferrer"/);
});
