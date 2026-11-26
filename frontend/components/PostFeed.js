'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { API_URL } from '../lib/posts';
import PostCard from './PostCard';

function imageFor(post, index, fallbackImages) {
  return post.featuredImage || fallbackImages[index % fallbackImages.length];
}

function formatDate(value, options = { month: 'short', day: 'numeric', year: 'numeric' }) {
  return value ? new Date(value).toLocaleDateString('en-US', options) : '';
}

function readingTime(content = '') {
  return Math.max(1, Math.ceil(content.trim().split(/\s+/).length / 220));
}

function BlogHeroTile({ post, index, siteContent }) {
  const featured = index === 0;
  const Title = featured ? 'h2' : 'h3';

  return (
    <article className={`blog-item${featured ? ' featured' : ''}`}>
      <img
        src={imageFor(post, index, siteContent.home.fallbackImages)}
        alt={post.featuredImageAlt || post.title}
        className="img-fluid"
        loading={index < 2 ? 'eager' : 'lazy'}
      />
      <div className="blog-content">
        <div className="post-meta">
          {post.createdAt && <span className="date">{formatDate(post.createdAt, { month: 'short', day: 'numeric', year: 'numeric' })}</span>}
          <span className="category">{post.categories?.[0] || siteContent.post.fallbackCategory}</span>
        </div>
        <Title className="post-title">
          <Link href={`/post/${post.slug}`}>{post.title}</Link>
        </Title>
      </div>
    </article>
  );
}

function FeaturedPostCard({ post, index, siteContent }) {
  const { home, post: postContent } = siteContent;

  return (
    <div className="col-lg-4" key={post._id}>
      <article className="blog-post-item">
        <img
          src={imageFor(post, index + 1, home.fallbackImages)}
          alt={post.featuredImageAlt || post.title}
          loading="lazy"
        />
        <div className="blog-post-content">
          <div className="post-meta">
            <span><i className="bi bi-person" />{post.author || postContent.authorFallback}</span>
            {post.createdAt && <span><i className="bi bi-clock" />{formatDate(post.createdAt, { month: 'short', day: 'numeric', year: 'numeric' })}</span>}
          </div>
          <h2><Link href={`/post/${post.slug}`}>{post.title}</Link></h2>
          <p>{post.excerpt || (post.content || '').replace(/<[^>]*>/g, '').slice(0, 170)}</p>
          <Link href={`/post/${post.slug}`} className="read-more">
            {home.featured.readMoreLabel} <i className="bi bi-arrow-right" />
          </Link>
        </div>
      </article>
    </div>
  );
}

function CategoryFeature({ post, index, siteContent }) {
  const category = post.categories?.[0] || siteContent.post.fallbackCategory;

  return (
    <div className="col-lg-4" key={post._id}>
      <article className="featured-post">
        <div className="post-img">
          <Link href={`/post/${post.slug}`}>
            <img
              src={imageFor(post, index, siteContent.home.fallbackImages)}
              alt={post.featuredImageAlt || post.title}
              className="img-fluid"
              loading="lazy"
            />
          </Link>
        </div>
        <div className="post-content">
          <div className="category-meta">
            <span className="post-category">{category}</span>
            <div className="author-meta">
              <span className="author-img" aria-hidden="true">{siteContent.brand.monogram}</span>
              <span className="author-name">{post.author || siteContent.post.authorFallback}</span>
              {post.createdAt && <span className="post-date">{formatDate(post.createdAt, { day: 'numeric', month: 'short', year: 'numeric' })}</span>}
            </div>
          </div>
          <h2 className="title"><Link href={`/post/${post.slug}`}>{post.title}</Link></h2>
        </div>
      </article>
    </div>
  );
}

function CategoryListPost({ post, index, siteContent }) {
  const category = post.categories?.[0] || siteContent.post.fallbackCategory;

  return (
    <div className="col-xl-4 col-lg-6" key={post._id}>
      <article className="list-post">
        <Link className="post-img" href={`/post/${post.slug}`} aria-label={`${post.title}`}>
          <img
            src={imageFor(post, index, siteContent.home.fallbackImages)}
            alt={post.featuredImageAlt || post.title}
            className="img-fluid"
            loading="lazy"
          />
        </Link>
        <div className="post-content">
          <span className="post-category">{category}</span>
          <h3 className="title"><Link href={`/post/${post.slug}`}>{post.title}</Link></h3>
          <div className="post-meta">
            <span className="read-time">{readingTime(post.content)} {siteContent.home.latest.readTimeSuffix}</span>
            <span className="post-date">{formatDate(post.createdAt, { day: 'numeric', month: 'short', year: 'numeric' })}</span>
          </div>
        </div>
      </article>
    </div>
  );
}

export default function PostFeed({ posts, siteContent }) {
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(siteContent.home.latest.allPostsLabel);
  const [searchedPosts, setSearchedPosts] = useState(posts);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState('');
  const categories = useMemo(
    () => [siteContent.home.latest.allPostsLabel, ...new Set(posts.flatMap((post) => post.categories || []))],
    [posts, siteContent.home.latest.allPostsLabel]
  );
  useEffect(() => {
    let active = true;
    const search = query.trim();
    if (!search) {
      setSearchedPosts(posts);
      setSearchLoading(false);
      setSearchError('');
      return () => { active = false; };
    }

    setSearchLoading(true);
    setSearchError('');
    const timer = setTimeout(async () => {
      try {
        const response = await fetch(`${API_URL}/posts?search=${encodeURIComponent(search)}`, { cache: 'no-store' });
        const result = await response.json();
        if (!response.ok) {
          throw new Error(result.error || siteContent.errors.searchUnavailableHelp);
        }
        if (!Array.isArray(result)) {
          throw new Error(siteContent.errors.searchUnavailableHelp);
        }
        if (active) setSearchedPosts(result.filter((post) => post.status === 'published'));
      } catch (error) {
        if (active) {
          setSearchError(error instanceof TypeError
            ? siteContent.errors.searchUnavailableHelp
            : error instanceof Error ? error.message : siteContent.errors.searchUnavailableHelp);
        }
      } finally {
        if (active) setSearchLoading(false);
      }
    }, 250);

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [query, posts, siteContent.errors.searchUnavailableHelp]);

  const visiblePosts = useMemo(() => {
    return searchedPosts.filter((post) => {
      const matchesCategory = selectedCategory === siteContent.home.latest.allPostsLabel
        || (post.categories || []).includes(selectedCategory);
      return matchesCategory;
    });
  }, [searchedPosts, selectedCategory, siteContent.home.latest.allPostsLabel]);

  const featuredPick = posts[3] || posts[0];
  const categoryFeatures = posts.slice(0, 3);
  const categoryList = posts.slice(3, 9);
  const { home, post: postContent } = siteContent;

  return (
    <main className="main">
      <section id="blog-hero" className="blog-hero section" aria-label={home.hero.ariaLabel}>
        <div className="container" data-aos="fade-up" data-aos-delay="100">
          {posts.length ? (
            <div className="blog-grid">
              {posts.slice(0, 5).map((post, index) => (
                <BlogHeroTile post={post} index={index} siteContent={siteContent} key={post._id} />
              ))}
            </div>
          ) : (
            <div className="empty-state">{home.hero.emptyMessage}</div>
          )}
        </div>
      </section>

      <section id="featured-posts" className="featured-posts section">
        <div className="container section-title" data-aos="fade-up">
          <h2>{home.featured.sectionTitle}</h2>
          <div><span>{home.featured.titlePrefix}</span> <span className="description-title">{home.featured.titleEmphasis}</span></div>
        </div>
        <div className="container" data-aos="fade-up" data-aos-delay="100">
          <div className="row gy-4">
            {posts.slice(0, 5).map((post, index) => (
              <FeaturedPostCard post={post} index={index} siteContent={siteContent} key={post._id} />
            ))}
          </div>
        </div>
      </section>

      <section id="category-section" className="category-section section">
        <div className="container section-title" data-aos="fade-up">
          <h2>{home.categories.sectionTitle}</h2>
          <div><span className="description-title">{home.categories.titleEmphasis}</span></div>
        </div>
        <div className="container" data-aos="fade-up" data-aos-delay="100">
          {categoryFeatures.length ? (
            <>
              <div className="row gy-4 mb-4">
                {categoryFeatures.map((post, index) => (
                  <CategoryFeature post={post} index={index + 2} siteContent={siteContent} key={post._id} />
                ))}
              </div>
              <div className="row">
                {categoryList.map((post, index) => (
                  <CategoryListPost post={post} index={index + 4} siteContent={siteContent} key={post._id} />
                ))}
              </div>
            </>
          ) : (
            <p className="empty-state">{home.categories.emptyMessage}</p>
          )}
        </div>
      </section>

      {featuredPick && (
        <section id="call-to-action-2" className="call-to-action-2 section">
          <div className="container" data-aos="fade-up" data-aos-delay="100">
            <div className="advertise-1 d-flex flex-column flex-lg-row gap-4 align-items-center position-relative">
              <div className="content-left flex-grow-1" data-aos="fade-right" data-aos-delay="200">
                <span className="badge text-uppercase mb-2">{home.editorPick.badge}</span>
                <h2>{featuredPick.title}</h2>
                <p className="my-4">{featuredPick.excerpt || (featuredPick.content || '').replace(/<[^>]*>/g, '').slice(0, 180)}</p>
                <div className="features d-flex flex-wrap gap-3 mb-4">
                  {(featuredPick.tags || []).slice(0, 3).map((tag) => (
                    <div className="feature-item" key={tag}>
                      <i className="bi bi-check-circle-fill" aria-hidden="true" />
                      <span>{tag}</span>
                    </div>
                  ))}
                </div>
                <div className="cta-buttons d-flex flex-wrap gap-3">
                  <Link href={`/post/${featuredPick.slug}`} className="btn btn-primary">{home.editorPick.primaryAction}</Link>
                  <a href="#latest-posts" className="btn btn-outline">{home.editorPick.secondaryAction}</a>
                </div>
              </div>
              <div className="content-right position-relative" data-aos="fade-left" data-aos-delay="300">
                <img src={home.editorPick.image} alt="" className="img-fluid rounded-4" />
                <div className="floating-card">
                  <div className="card-icon"><i className="bi bi-clock" aria-hidden="true" /></div>
                  <div className="card-content">
                    <span className="stats-number">{readingTime(featuredPick.content)} {home.latest.readTimeSuffix}</span>
                    <span className="stats-text">{home.editorPick.readingTimeLabel}</span>
                  </div>
                </div>
              </div>
              <div className="decoration" aria-hidden="true"><div className="circle-1" /><div className="circle-2" /></div>
            </div>
          </div>
        </section>
      )}

      <section id="latest-posts" className="latest-posts section" aria-label={home.latest.listAriaLabel}>
        <div className="container section-title" data-aos="fade-up">
          <h2>{home.latest.sectionTitle}</h2>
          <div><span>{home.latest.titlePrefix}</span> <span className="description-title">{home.latest.titleEmphasis}</span></div>
        </div>
        <div className="container" data-aos="fade-up" data-aos-delay="100">
          <div className="latest-toolbar">
            <div className="category-filters" aria-label={home.latest.filterAriaLabel}>
              {categories.map((category) => (
                <button
                  className={`filter-chip${selectedCategory === category ? ' filter-chip-active' : ''}`}
                  key={category}
                  type="button"
                  aria-pressed={selectedCategory === category}
                  onClick={() => setSelectedCategory(category)}
                >
                  {category}
                </button>
              ))}
            </div>
            <label className="story-search" id="post-search">
              <svg aria-hidden="true" viewBox="0 0 24 24"><circle cx="11" cy="11" r="7" /><path d="m20 20-4-4" /></svg>
              <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={home.latest.searchPlaceholder} aria-label={home.latest.searchAriaLabel} />
            </label>
          </div>
          {searchError ? (
            <div className="empty-state" role="alert">
              <strong>{home.latest.searchUnavailableTitle}</strong>
              <p>{searchError}</p>
            </div>
          ) : searchLoading ? (
            <div className="empty-state" role="status">{home.latest.searchingLabel}</div>
          ) : (
            <>
              {query.trim() && (
                <p className="search-result-count" aria-live="polite">
                  {visiblePosts.length} {visiblePosts.length === 1 ? home.latest.searchResultSingularLabel : home.latest.searchResultPluralLabel} “{query.trim()}”
                </p>
              )}
              {visiblePosts.length ? (
                <div className="row gy-4">
                  {visiblePosts.slice(0, 9).map((currentPost, index) => (
                    <div className="col-lg-4" key={currentPost._id}>
                      <PostCard
                        post={currentPost}
                        index={index}
                        authorFallback={postContent.authorFallback}
                        categoryFallback={postContent.fallbackCategory}
                        fallbackImages={home.fallbackImages}
                        brandMonogram={siteContent.brand.monogram}
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-state">
                  <strong>{query.trim() || posts.length ? home.latest.noMatchesTitle : home.latest.noPostsTitle}</strong>
                  <p>{query.trim() || posts.length ? home.latest.noMatchesMessage : home.latest.noPostsMessage}</p>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      <section id="about" className="call-to-action section">
        <div className="container" data-aos="fade-up">
          <div className="row gy-4 justify-content-between align-items-center">
            <div className="col-lg-6">
              <div className="cta-content">
                <h2>{home.journal.title}</h2>
                <p>{home.journal.description}</p>
                <a className="btn btn-primary" href="#latest-posts">{home.journal.actionLabel} <i className="bi bi-arrow-right" /></a>
              </div>
            </div>
            <div className="col-lg-4">
              <div className="cta-image">
                <img src={home.journal.image} alt="" className="img-fluid" loading="lazy" />
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
