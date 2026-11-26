import Link from 'next/link';

export default function PostCard({ post, index = 0, authorFallback, categoryFallback, fallbackImages, brandMonogram, className = '' }) {
  const image = post.featuredImage || fallbackImages[index % fallbackImages.length];
  const date = post.createdAt
    ? new Date(post.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : '';

  return (
    <article className={className}>
      <div className="post-img">
        <Link href={`/post/${post.slug}`}>
          <img src={image} alt={post.featuredImage ? (post.featuredImageAlt || post.title) : ''} className="img-fluid" loading="lazy" />
        </Link>
      </div>
      <p className="post-category">{post.categories?.[0] || categoryFallback}</p>
      <h2 className="title"><Link href={`/post/${post.slug}`}>{post.title}</Link></h2>
      <div className="post-author-block">
        <span className="post-author-img brand-avatar" aria-hidden="true">{brandMonogram}</span>
        <div className="post-author-copy">
          <p className="post-author">{post.author || authorFallback}</p>
          {date && <p className="post-date"><time dateTime={post.createdAt}>{date}</time></p>}
        </div>
      </div>
    </article>
  );
}
