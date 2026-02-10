import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { API } from '../api';

function ShareView() {
  const { shareLink } = useParams();
  const [note, setNote] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchSharedNote();
  }, [shareLink]);

  const fetchSharedNote = async () => {
    try {
      const res = await API.getSharedNote(shareLink);
      const data = await res.json();

      if (res.ok) {
        setNote(data.note);
      } else {
        setError(data.error || 'Note not found');
      }
    } catch (error) {
      setError('Error loading note');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (error) {
    return (
      <div className="error-page">
        <h2>Note Not Found</h2>
        <p>{error}</p>
        <Link to="/" className="btn-primary">Go Home</Link>
      </div>
    );
  }

  return (
    <div className="share-view-page">
      <div className="share-view-container">
        <div className="share-header">
          <Link to={`/user/${note.author?.username}`} className="author-info">
            {note.author?.avatar && (
              <img src={note.author.avatar} alt={note.author.username} className="author-avatar" />
            )}
            <span className="author-name">
              {note.author?.displayName || note.author?.username}
            </span>
          </Link>
          <span className="share-badge">Shared Note</span>
        </div>

        <h1 className="share-title">{note.title}</h1>
        
        <div className="share-content">
          {note.content}
        </div>

        {note.tags && note.tags.length > 0 && (
          <div className="share-tags">
            {note.tags.map(tag => (
              <span key={tag} className="tag">#{tag}</span>
            ))}
          </div>
        )}

        <div className="share-footer">
          <span className="share-views">{note.views} views</span>
          <span className="share-date">
            Shared on {new Date(note.createdAt).toLocaleDateString()}
          </span>
        </div>

        <div className="share-actions">
          <Link to="/" className="btn-secondary">Explore More Notes</Link>
          <Link to="/register" className="btn-primary">Join and Share Your Notes</Link>
        </div>
      </div>
    </div>
  );
}

export default ShareView;
