import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { apiRequest } from '../api';
import { useAdmin } from '../context/AdminContext';
import Icon from '../components/Icon';

const EMPTY_FORM = {
  title: '',
  excerpt: '',
  content: '',
  author: '',
  categories: '',
  tags: '',
  featuredImage: '',
  featuredImageAlt: '',
  seoTitle: '',
  seoDescription: '',
  status: 'draft',
};

function slugPreview(title) {
  return title
    .toLowerCase()
    .trim()
    .normalize('NFKC')
    .replace(/[^\p{L}\p{M}\p{N}\s-]/gu, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

export default function PostEditorPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token, signOut } = useAdmin();
  const editing = Boolean(id);
  const [form, setForm] = useState(EMPTY_FORM);
  const [loading, setLoading] = useState(editing);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    if (!id) {
      setForm(EMPTY_FORM);
      setLoading(false);
      return () => { active = false; };
    }

    setLoading(true);
    apiRequest(`/posts/${id}`, { token })
      .then((post) => {
        if (!active) return;
        setForm({
          title: post.title || '',
          excerpt: post.excerpt || '',
          content: post.content || '',
          author: post.author || '',
          categories: (post.categories || []).join(', '),
          tags: (post.tags || []).join(', '),
          featuredImage: post.featuredImage || '',
          featuredImageAlt: post.featuredImageAlt || '',
          seoTitle: post.seoTitle || '',
          seoDescription: post.seoDescription || '',
          status: post.status || 'draft',
        });
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
  }, [id, token, signOut]);

  const previewSlug = useMemo(() => slugPreview(form.title), [form.title]);

  function updateField(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  async function savePost(event) {
    event.preventDefault();
    setSaving(true);
    setError('');
    const payload = {
      ...form,
      author: form.author.trim() || 'Anonymous',
      categories: form.categories.split(',').map((item) => item.trim()).filter(Boolean),
      tags: form.tags.split(',').map((item) => item.trim()).filter(Boolean),
      featuredImage: form.featuredImage.trim() || null,
    };

    try {
      await apiRequest(editing ? `/posts/${id}` : '/posts', {
        token,
        method: editing ? 'PUT' : 'POST',
        body: JSON.stringify(payload),
      });
      navigate('/posts', { state: { notice: editing ? 'Your changes have been saved.' : 'Your post has been created.' } });
    } catch (requestError) {
      if (requestError.status === 401) signOut();
      else setError(requestError.message);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <div className="content-wrap"><div className="table-state">Loading post…</div></div>;
  }

  return (
    <div className="content-wrap">
      <section className="page-heading">
        <div>
          <p className="eyebrow">{editing ? 'UPDATE YOUR STORY' : 'PUT IT INTO WORDS'}</p>
          <h1>{editing ? 'Edit post' : 'Add new post'}<span className="heading-period">.</span></h1>
          <p className="muted">Manage the post content, publishing details, and search preview.</p>
        </div>
        <Link className="button secondary" to="/posts">Back to posts</Link>
      </section>
      {error && <div className="notice error-notice" role="alert">{error}</div>}
      <section className="editor-card editor-page-card">
        <form className="post-form" onSubmit={savePost}>
          <div className="section-heading editor-section-heading">
            <div><p className="eyebrow">POST CONTENT</p><h2>Story details</h2></div>
          </div>
          <div className="form-grid">
            <label className="field field-wide">Title
              <input name="title" value={form.title} onChange={updateField} placeholder="Give your post a title" required maxLength={160} />
            </label>
            <label className="field field-wide">URL slug <span className="input-hint">Generated from the title</span>
              <input value={previewSlug || 'your-post-title'} readOnly />
            </label>
            <label className="field field-wide">Excerpt <span className="input-hint">A short summary shown in post previews · {form.excerpt.length}/320</span>
              <textarea name="excerpt" value={form.excerpt} onChange={updateField} placeholder="Summarize your post in a sentence or two" rows={3} maxLength={320} />
            </label>
            <label className="field field-wide">Content
              <textarea name="content" value={form.content} onChange={updateField} placeholder="Start writing here…" rows={12} required />
            </label>
            <label className="field">Author
              <input name="author" value={form.author} onChange={updateField} placeholder="Your name" />
            </label>
            <label className="field">Status
              <select name="status" value={form.status} onChange={updateField}>
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>
            </label>
            <label className="field">Categories
              <input name="categories" value={form.categories} onChange={updateField} placeholder="Design, Culture" />
            </label>
            <label className="field">Tags
              <input name="tags" value={form.tags} onChange={updateField} placeholder="Ideas, Notes" />
            </label>
          </div>

          <div className="section-heading editor-section-heading sub-section-heading">
            <div><p className="eyebrow">MEDIA</p><h2>Featured image</h2></div>
          </div>
          <div className="form-grid">
            <label className="field field-wide">Image URL
              <input name="featuredImage" type="url" value={form.featuredImage} onChange={updateField} placeholder="https://example.com/image.jpg" />
            </label>
            <label className="field field-wide">Image alt text <span className="input-hint">Describe the image for accessibility</span>
              <input name="featuredImageAlt" value={form.featuredImageAlt} onChange={updateField} placeholder="A short description of the image" maxLength={200} />
            </label>
          </div>

          <div className="section-heading editor-section-heading sub-section-heading">
            <div><p className="eyebrow">SEARCH PREVIEW</p><h2>SEO metadata</h2></div>
          </div>
          <div className="form-grid">
            <label className="field field-wide">SEO title <span className="input-hint">{form.seoTitle.length}/70</span>
              <input name="seoTitle" value={form.seoTitle} onChange={updateField} placeholder="Uses the post title when blank" maxLength={70} />
            </label>
            <label className="field field-wide">SEO description <span className="input-hint">{form.seoDescription.length}/160</span>
              <textarea name="seoDescription" value={form.seoDescription} onChange={updateField} placeholder="Uses the excerpt when blank" rows={3} maxLength={160} />
            </label>
          </div>
          <div className="form-footer">
            <span className="muted small-copy">Separate categories and tags with commas.</span>
            <button className="button primary" type="submit" disabled={saving}>
              {saving ? 'Saving…' : <><Icon name="file" size={16} /> {editing ? 'Save changes' : 'Create post'}</>}
            </button>
          </div>
        </form>
      </section>
      <footer className="page-footer">Made for thoughtful stories <span>·</span> globalcapitalist Admin</footer>
    </div>
  );
}
