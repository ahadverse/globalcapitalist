import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getPublishedPostBySlug } from '../../../lib/posts';
import { getSiteContent } from '../../../lib/siteContent';
import sanitizePostContent from '../../../lib/sanitizePostContent.mjs';

function getDescription(post) {
  return post.seoDescription || post.excerpt || (post.content || '').replace(/<[^>]*>/g, '').slice(0, 160);
}

function getReadingTime(content = '') {
  return Math.max(1, Math.ceil(content.trim().split(/\s+/).length / 220));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const [post, siteContent] = await Promise.all([
    getPublishedPostBySlug(slug),
    getSiteContent(),
  ]);
  if (!post) {
    return { title: siteContent.post.notFoundTitle };
  }

  return {
    title: post.seoTitle || post.title,
    description: getDescription(post),
    openGraph: {
      title: post.seoTitle || post.title,
      description: getDescription(post),
      images: post.featuredImage ? [post.featuredImage] : [],
      type: 'article',
    },
  };
}

export default async function PostPage({ params }) {
  const { slug } = await params;
  let siteContent;
  try {
    siteContent = await getSiteContent();
  } catch (error) {
    return (
      <main className="container post-unavailable" role="alert">
        <h1>Site content is temporarily unavailable.</h1>
        <p>{error instanceof Error ? error.message : 'The site content API request failed.'}</p>
      </main>
    );
  }

  let post;
  try {
    post = await getPublishedPostBySlug(slug);
  } catch (error) {
    return (
      <main className="container post-unavailable" role="alert">
        <h1>{siteContent.post.unavailableTitle}</h1>
        <p>{error instanceof Error ? error.message : 'The post API request failed.'}</p>
        <Link className="btn btn-primary" href="/">{siteContent.post.returnAction}</Link>
      </main>
    );
  }

  if (!post) notFound();

  const date = post.createdAt
    ? new Date(post.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    : '';
  const categories = post.categories || [];
  const content = post.content || '';
  const hasHtmlContent = /<\/?[a-z][\s\S]*>/i.test(content);
  const contentParagraphs = content.replace(/<[^>]*>/g, '').split(/\n{2,}/).filter(Boolean);
  const postLabels = siteContent.post;

  return (
    <main className="main blog-details-page">
      <div className="page-title">
        <div className="breadcrumbs">
          <nav aria-label={postLabels.breadcrumbAriaLabel}>
            <ol className="breadcrumb">
              <li className="breadcrumb-item"><Link href="/"><i className="bi bi-house" /> {postLabels.homeLabel}</Link></li>
              <li className="breadcrumb-item"><a href="/#category-section">{categories[0] || postLabels.fallbackCategory}</a></li>
              <li className="breadcrumb-item active current" aria-current="page">{postLabels.storyLabel}</li>
            </ol>
          </nav>
        </div>
        <div className="title-wrapper">
          <h1>{categories[0] || postLabels.pageTitleFallback}</h1>
          <p>{post.excerpt || getDescription(post)}</p>
        </div>
      </div>

      <div className="container">
        <div className="row">
          <div className="col-lg-8">
            <section id="blog-details" className="blog-details section">
              <div className="container">
                <article className="article">
                  <div className="hero-img">
                    <img
                      src={post.featuredImage || siteContent.home.fallbackImages[2]}
                      alt={post.featuredImage ? (post.featuredImageAlt || post.title) : ''}
                      className="img-fluid"
                    />
                    <div className="meta-overlay">
                      <div className="meta-categories">
                        {categories.map((category, index) => (
                          <span key={category}>
                            {index > 0 && <span className="divider">•</span>}
                            <a className="category" href="/#category-section">{category}</a>
                          </span>
                        ))}
                        <span className="divider">•</span>
                        <span className="reading-time"><i className="bi bi-clock" /> {getReadingTime(content)} {postLabels.readingTimeSuffix}</span>
                      </div>
                    </div>
                  </div>

                  <div className="article-content">
                    <div className="content-header">
                      <h1 className="title">{post.title}</h1>
                      <div className="author-info">
                        <div className="author-details">
                          <span className="author-img brand-avatar" aria-hidden="true">{siteContent.brand.monogram}</span>
                          <div className="info">
                          <h4>{post.author || postLabels.authorFallback}</h4>
                          <span className="role">{postLabels.contributorRole}</span>
                          </div>
                        </div>
                        <div className="post-meta">
                          {date && <span className="date"><i className="bi bi-calendar3" /> {date}</span>}
                          <span className="divider">•</span>
                          <span>{getReadingTime(content)} {postLabels.readingTimeSuffix}</span>
                        </div>
                      </div>
                    </div>

                    <div className="content">
                      {post.excerpt && <p className="lead">{post.excerpt}</p>}
                      {hasHtmlContent ? (
                        <div dangerouslySetInnerHTML={{ __html: sanitizePostContent(content) }} />
                      ) : (
                        contentParagraphs.map((paragraph, index) => <p key={`${index}-${paragraph.slice(0, 20)}`}>{paragraph}</p>)
                      )}
                      {(post.tags || []).length > 0 && (
                        <div className="meta-bottom">
                          <div className="tags-section">
                            <h4>{postLabels.relatedTopicsTitle}</h4>
                            <div className="tags">
                              {post.tags.map((tag) => <a className="tag" href="/#category-section" key={tag}>{tag}</a>)}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </article>
              </div>
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}
