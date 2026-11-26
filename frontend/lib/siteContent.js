import { cache } from 'react';
import { API_URL } from './posts';

export const getSiteContent = cache(async function getSiteContent() {
  const response = await fetch(`${API_URL}/site-content`, { cache: 'no-store' });
  if (!response.ok) {
    throw new Error(`The site content API returned ${response.status}.`);
  }

  const content = await response.json();
  if (!content || typeof content !== 'object' || Array.isArray(content) || !content.brand?.name) {
    throw new Error('The site content API returned an invalid response.');
  }

  return content;
});
