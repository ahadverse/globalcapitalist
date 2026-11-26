export const API_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api').replace(/\/$/, '');

export async function getPublishedPosts() {
  const response = await fetch(`${API_URL}/posts`, { cache: 'no-store' });
  if (!response.ok) {
    throw new Error(`The blog API returned ${response.status} while loading posts.`);
  }

  const posts = await response.json();
  if (!Array.isArray(posts)) {
    throw new Error('The blog API returned an invalid posts response.');
  }
  return posts.filter((post) => post.status === 'published');
}

export async function getPublishedPostBySlug(slug) {
  const response = await fetch(`${API_URL}/posts/slug/${encodeURIComponent(slug)}`, { cache: 'no-store' });
  if (response.status === 404) {
    return null;
  }
  if (!response.ok) {
    throw new Error(`The blog API returned ${response.status} while loading this post.`);
  }

  const post = await response.json();
  return post.status === 'published' ? post : null;
}
