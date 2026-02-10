import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';

function Recent() {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({});
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';

  useEffect(() => {
    fetchGlobalNotes();
  }, [page, query]);

  const fetchGlobalNotes = async () => {
    try {
      let url = `/api/notes/global/recent?page=${page}`;
      if (query) {
        url = `/api/notes?search=${encodeURIComponent(query)}&page=${page}`;
      }
      const res = await fetch(url);
      const data = await res.json();
      setNotes(data.notes || []);
      setPagination(data.pagination || {});
    } catch (error) {
      console.error('Error fetching notes:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="recent-page">
      <div className="recent-header">
        <h1>{query ? `Search Results: "${query}"` : 'Recent Global Notes'}</h1>
        <p>{query ? `Found ${pagination.total || 0} results` : 'Discover notes published globally by users'}</p>
      </div>

      {notes.length === 0 ? (
        <div className="empty-state">
          <p>{query ? `No notes found for "${query}"` : 'No global notes yet. Be the first to publish globally!'}</p>
          {query ? (
            <Link to="/recent" className="btn-primary">View All Notes</Link>
          ) : (
            <Link to="/select-category" className="btn-primary">Write a Note</Link>
          )}
        </div>
      ) : (
        <>
          <div className="notes-grid">
            {notes.map(note => (
              <div key={note._id} className="note-card">
                {note.coverImage && (
                  <img src={note.coverImage} alt={note.title} className="note-cover" />
                )}
                <div className="note-content">
                  <Link to={`/note/${note.slug}`} className="note-title">
                    <h3>{note.title}</h3>
                  </Link>
                  <p className="note-excerpt">{note.excerpt}...</p>
                  <div className="note-meta">
                    <span className="author">
                      <Link to={`/user/${note.author?.username}`} className="author">
                        {note.author?.displayName || note.author?.username}
                      </Link>
                    </span>
                    <span className="date">
                      {new Date(note.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  {note.tags && note.tags.length > 0 && (
                    <div className="note-tags">
                      {note.tags.slice(0, 3).map(tag => (
                        <span key={tag} className="tag">#{tag}</span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {pagination.pages > 1 && (
            <div className="pagination">
              <button 
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="btn-page"
              >
                Previous
              </button>
              <span className="page-info">
                Page {page} of {pagination.pages}
              </span>
              <button 
                onClick={() => setPage(p => Math.min(pagination.pages, p + 1))}
                disabled={page === pagination.pages}
                className="btn-page"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default Recent;
