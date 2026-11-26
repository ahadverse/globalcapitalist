import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiRequest } from '../api';
import { useAdmin } from '../context/AdminContext';
import Icon from '../components/Icon';

export default function DashboardPage() {
  const { token, signOut } = useAdmin();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    apiRequest('/posts/admin', { token })
      .then((result) => {
        if (active) setPosts(result);
      })
      .catch((requestError) => {
        if (!active) return;
        if (requestError.status === 401) signOut();
        else setError(requestError.message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, [token, signOut]);

  const published = posts.filter((post) => post.status === 'published').length;
  const drafts = posts.length - published;
  const recentPosts = posts.slice(0, 5);

  return (
    <div className="content-wrap">
      <section className="page-heading">
        <div>
          <p className="eyebrow">YOUR PUBLICATION</p>
          <h1>Good morning<span className="heading-period">.</span></h1>
          <p className="muted">A little progress each day adds up to big results.</p>
        </div>
        <Link className="button primary" to="/posts/new"><Icon name="plus" size={17} /> New post</Link>
      </section>
      {error && <div className="notice error-notice" role="alert">{error}</div>}
      <section className="stats-grid" aria-label="Post statistics">
        <div className="stat-card">
          <div className="stat-icon lavender"><Icon name="file" /></div>
          <div><p>Total posts</p><strong>{loading ? '—' : posts.length}</strong></div>
          <span className="stat-caption">Across your journal</span>
        </div>
        <div className="stat-card">
          <div className="stat-icon green"><span className="status-dot" /></div>
          <div><p>Published</p><strong>{loading ? '—' : published}</strong></div>
          <span className="stat-caption">Live on your site</span>
        </div>
        <div className="stat-card">
          <div className="stat-icon amber"><Icon name="edit" /></div>
          <div><p>Drafts</p><strong>{loading ? '—' : drafts}</strong></div>
          <span className="stat-caption">Still in the works</span>
        </div>
      </section>

      <section className="posts-section">
        <div className="section-heading posts-heading">
          <div>
            <p className="eyebrow">THE ARCHIVE</p>
            <h2>Recent posts <span className="count-pill">{loading ? '…' : posts.length}</span></h2>
          </div>
          <Link className="text-button" to="/posts">View all posts <Icon name="arrow" size={14} /></Link>
        </div>
        <div className="table-card">
          {loading ? (
            <div className="table-state">Loading your posts…</div>
          ) : recentPosts.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon"><Icon name="file" size={23} /></div>
              <h3>No posts yet</h3>
              <p>Create your first post to get started.</p>
              <Link className="button secondary" to="/posts/new"><Icon name="plus" size={16} /> Write a post</Link>
            </div>
          ) : (
            <div className="table-scroll">
              <table>
                <thead><tr><th>POST</th><th>STATUS</th><th>AUTHOR</th><th>LAST UPDATED</th><th /></tr></thead>
                <tbody>
                  {recentPosts.map((post) => (
                    <tr key={post._id}>
                      <td>
                        <div className="story-cell">
                          <div className="story-thumbnail">{post.featuredImage ? <img src={post.featuredImage} alt="" /> : <Icon name="file" size={17} />}</div>
                          <div className="story-copy">
                            <strong>{post.title}</strong>
                            <span>{post.excerpt || (post.categories || []).join(' · ') || 'No excerpt'}</span>
                          </div>
                        </div>
                      </td>
                      <td><span className={`badge ${post.status === 'published' ? 'badge-published' : 'badge-draft'}`}><span />{post.status}</span></td>
                      <td className="author-cell">{post.author || 'Anonymous'}</td>
                      <td className="date-cell">{new Date(post.updatedAt || post.createdAt).toLocaleDateString()}</td>
                      <td><Link className="icon-button" to={`/posts/${post._id}/edit`} title="Edit post" aria-label={`Edit ${post.title}`}><Icon name="edit" size={17} /></Link></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>
      <footer className="page-footer">Made for thoughtful stories <span>·</span> globalcapitalist Admin</footer>
    </div>
  );
}
