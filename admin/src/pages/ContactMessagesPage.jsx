import { useEffect, useState } from 'react';
import { apiRequest } from '../api';
import { useAdmin } from '../context/AdminContext';
import Icon from '../components/Icon';

const pageSize = 25;

export default function ContactMessagesPage() {
  const { token, signOut } = useAdmin();
  const [result, setResult] = useState({ inquiries: [], total: 0, page: 1, pages: 0 });
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError('');
    apiRequest(`/contact/admin?page=${page}&limit=${pageSize}`, { token })
      .then((response) => {
        if (active) setResult(response);
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
  }, [token, signOut, page]);

  return (
    <div className="content-wrap">
      <section className="page-heading">
        <div>
          <p className="eyebrow">INBOX</p>
          <h1>Contact messages<span className="heading-period">.</span></h1>
          <p className="muted">Messages submitted through the public contact page.</p>
        </div>
      </section>
      {error && <div className="notice error-notice" role="alert">{error}</div>}

      <section className="posts-section posts-page-section">
        <div className="section-heading posts-heading">
          <div>
            <p className="eyebrow">INCOMING</p>
            <h2>Messages <span className="count-pill">{loading ? '…' : result.total}</span></h2>
          </div>
        </div>
        <div className="table-card">
          {loading ? (
            <div className="table-state">Loading messages…</div>
          ) : error ? null : result.inquiries.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon"><Icon name="mail" size={23} /></div>
              <h3>No messages yet</h3>
              <p>New contact form submissions will appear here.</p>
            </div>
          ) : (
            <div className="table-scroll">
              <table>
                <thead><tr><th>FROM</th><th>SUBJECT</th><th>MESSAGE</th><th>RECEIVED</th></tr></thead>
                <tbody>
                  {result.inquiries.map((inquiry) => (
                    <tr key={inquiry._id}>
                      <td>
                        <div className="inquiry-sender">
                          <strong>{inquiry.name}</strong>
                          <a href={`mailto:${inquiry.email}`}>{inquiry.email}</a>
                        </div>
                      </td>
                      <td>{inquiry.subject}</td>
                      <td className="message-cell">
                        <details>
                          <summary>Read message</summary>
                          <p>{inquiry.message}</p>
                        </details>
                      </td>
                      <td className="date-cell">{new Date(inquiry.createdAt).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
        {result.pages > 1 && (
          <div className="inquiry-pagination">
            <button className="button secondary" type="button" disabled={loading || page <= 1} onClick={() => setPage((current) => current - 1)}>
              Previous
            </button>
            <span>Page {result.page} of {result.pages}</span>
            <button className="button secondary" type="button" disabled={loading || page >= result.pages} onClick={() => setPage((current) => current + 1)}>
              Next
            </button>
          </div>
        )}
      </section>
      <footer className="page-footer">Private messages are visible to signed-in administrators only.</footer>
    </div>
  );
}
