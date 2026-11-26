import Link from 'next/link';
import PostCard from '../../components/PostCard';
import { getPublishedPosts } from '../../lib/posts';
import { getSiteContent } from '../../lib/siteContent';

export async function generateMetadata() {
  const { brand, pages } = await getSiteContent();
  return {
    title: pages.category.title,
    description: pages.category.description || brand.description,
  };
}

export default async function CategoryPage() {
  const siteContent = await getSiteContent();
  const { pages, home, post, brand } = siteContent;
  const categoryContent = pages.category;
  let posts = [];
  let postsError = '';

  try {
    posts = await getPublishedPosts();
  } catch (error) {
    postsError = error instanceof Error ? error.message : siteContent.errors.postsUnavailableHelp;
  }

  const groupedPosts = new Map();
  for (const currentPost of posts) {
    const categories = currentPost.categories?.length ? currentPost.categories : [post.fallbackCategory];
    for (const category of categories) {
      if (!groupedPosts.has(category)) groupedPosts.set(category, []);
      groupedPosts.get(category).push(currentPost);
    }
  }
  const groups = [...groupedPosts.entries()];

  return (
    <main className="main separate-page category-page">
      <div className="page-title">
        <div className="title-wrapper">
          <p className="page-eyebrow">{categoryContent.eyebrow}</p>
          <h1>{categoryContent.title}</h1>
          <p>{categoryContent.description}</p>
        </div>
      </div>
      <section className="section">
        <div className="container">
          {postsError ? (
            <div className="feed-error" role="alert">
              <h2>{siteContent.errors.postsUnavailableTitle}</h2>
              <p>{postsError}</p>
            </div>
          ) : groups.length ? (
            <>
              <nav className="category-index" aria-label={categoryContent.indexAriaLabel}>
                {groups.map(([category], index) => (
                  <a href={`#category-${index}`} key={category}>{category}</a>
                ))}
              </nav>
              {groups.map(([category, categoryPosts], groupIndex) => (
                <section className="category-group" id={`category-${groupIndex}`} key={category}>
                  <div className="section-title">
                    <h2>{category}</h2>
                    <div><span className="description-title">{categoryPosts.length} {categoryContent.storiesLabel}</span></div>
                  </div>
                  <div className="row gy-4">
                    {categoryPosts.map((currentPost, index) => (
                      <div className="col-lg-4 col-md-6" key={currentPost._id}>
                        <PostCard
                          className="category-post-card"
                          post={currentPost}
                          index={index}
                          authorFallback={post.authorFallback}
                          categoryFallback={category}
                          fallbackImages={home.fallbackImages}
                          brandMonogram={brand.monogram}
                        />
                      </div>
                    ))}
                  </div>
                </section>
              ))}
            </>
          ) : (
            <div className="empty-state">
              <h2>{categoryContent.emptyTitle}</h2>
              <p>{categoryContent.emptyMessage}</p>
              <Link className="btn btn-primary" href="/">{home.latest.allPostsLabel}</Link>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
