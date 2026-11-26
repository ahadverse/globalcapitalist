import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { apiRequest } from '../api';
import { useAdmin } from '../context/AdminContext';
import Icon from '../components/Icon';

export default function PostsPage() {
  const { token, signOut } = useAdmin();
  const location = useLocation();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState(location.state?.notice || '');
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

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

  const visiblePosts = useMemo(() => posts.filter((post) => {
    const matchesStatus = statusFilter === 'all' || post.status === statusFilter;
    const text = `${post.title} ${post.author || ''} ${post.excerpt || ''} ${(post.categories || []).join(' ')}`.toLowerCase();
    return matchesStatus && text.includes(query.trim().toLowerCase());
  }), [posts, query, statusFilter]);

  async function deletePost(post) {
    if (!window.confirm(`Delete “${post.title}”? This cannot be undone.`)) return;
    setError('');
    setNotice('');
    try {
      await apiRequest(`/posts/${post._id}`, { token, method: 'DELETE' });
      setPosts((current) => current.filter((item) => item._id !== post._id));
      setNotice('The post has been deleted.');
    } catch (requestError) {
      if (requestError.status === 401) signOut();
      else setError(requestError.message);
    }
  }

  return (
    <div className="content-wrap">
      <section className="page-heading">
        <div>
          <p className="eyebrow">CONTENT MANAGEMENT</p>
          <h1>All posts<span className="heading-period">.</span></h1>
          <p className="muted">Create, edit, and organize your publication.</p>
        </div>
        <Link className="button primary" to="/posts/new"><Icon name="plus" size={17} /> Add new post</Link>
      </section>
      {error && <div className="notice error-notice" role="alert">{error}</div>}
      {notice && <div className="notice success-notice" role="status">{notice}</div>}

      <section className="posts-section posts-page-section">
        <div className="section-heading posts-heading">
          <div>
            <p className="eyebrow">THE ARCHIVE</p>
            <h2>Posts <span className="count-pill">{loading ? '…' : visiblePosts.length}</span></h2>
          </div>
          <div className="table-controls">
            <label className="search-box">
              <Icon name="search" size={17} />
              <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search posts" aria-label="Search posts" />
            </label>
            <select className="filter-select" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} aria-label="Filter by status">
              <option value="all">All status</option>
              <option value="published">Published</option>
              <option value="draft">Drafts</option>
            </select>
          </div>
        </div>
        <div className="table-card">
          {loading ? (
            <div className="table-state">Loading posts…</div>
          ) : visiblePosts.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon"><Icon name="file" size={23} /></div>
              <h3>{posts.length ? 'No posts match your search' : 'Your first post starts here'}</h3>
              <p>{posts.length ? 'Try another search or status filter.' : 'Create a post to see it in your list.'}</p>
              {!posts.length && <Link className="button secondary" to="/posts/new"><Icon name="plus" size={16} /> Write a post</Link>}
            </div>
          ) : (
            <div className="table-scroll">
              <table>
                <thead><tr><th>POST</th><th>STATUS</th><th>AUTHOR</th><th>LAST UPDATED</th><th><span className="sr-only">Actions</span></th></tr></thead>
                <tbody>
                  {visiblePosts.map((post) => (
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
                      <td className="date-cell">{new Date(post.updatedAt || post.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</td>
                      <td>
                        <div className="row-actions">
                          <Link className="icon-button" to={`/posts/${post._id}/edit`} title="Edit post" aria-label={`Edit ${post.title}`}><Icon name="edit" size={17} /></Link>
                          <button className="icon-button danger-action" type="button" title="Delete post" aria-label={`Delete ${post.title}`} onClick={() => deletePost(post)}><Icon name="trash" size={17} /></button>
                        </div>
                      </td>
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
