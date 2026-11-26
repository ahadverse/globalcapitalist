import PostFeed from '../components/PostFeed';
import { getPublishedPosts } from '../lib/posts';
import { getSiteContent } from '../lib/siteContent';

export default async function HomePage() {
  let posts = [];
  let siteContent;
  let postsError = '';
  let siteContentError = '';

  const [postsResult, siteContentResult] = await Promise.allSettled([
    getPublishedPosts(),
    getSiteContent(),
  ]);
  if (postsResult.status === 'fulfilled') {
    posts = postsResult.value;
  } else {
    postsError = postsResult.reason instanceof Error ? postsResult.reason.message : 'The posts API request failed.';
  }
  if (siteContentResult.status === 'fulfilled') {
    siteContent = siteContentResult.value;
  } else {
    siteContentError = siteContentResult.reason instanceof Error
      ? siteContentResult.reason.message
      : 'The site content API request failed.';
  }

  return (
    siteContentError ? (
      <main className="main">
        <section className="container feed-error" role="alert">
          <h1>Site content is unavailable.</h1>
          <p>{siteContentError}</p>
        </section>
      </main>
    ) : postsError ? (
      <main className="main">
        <section className="container feed-error" id="latest-posts" role="alert">
          <h1>{siteContent.errors.postsUnavailableTitle}</h1>
          <p>{postsError}</p>
          <p>{siteContent.errors.postsUnavailableHelp}</p>
        </section>
      </main>
    ) : <PostFeed posts={posts} siteContent={siteContent} />
  );
}
