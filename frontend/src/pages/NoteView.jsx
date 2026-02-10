import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { API, API_URL } from '../api';

function NoteView() {
  const { slug } = useParams();
  const { user, token } = useAuth();
  const [note, setNote] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNote();
  }, [slug]);

  const fetchNote = async () => {
    try {
      const res = await API.getNoteBySlug(slug);
      const data = await res.json();
      
      if (res.ok) {
        setNote(data.note);
      }
    } catch (error) {
      console.error('Error fetching note:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async () => {
    if (!user) {
      alert('Please login to like this post');
      return;
    }

    try {
      const res = await fetch(`${API_URL}/api/notes/${note._id}/like`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      
      if (res.ok) {
        setNote({
          ...note,
          likes: data.liked 
            ? [...(note.likes || []), user.id] 
            : (note.likes || []).filter(id => id !== user.id)
        });
      }
    } catch (error) {
      console.error('Error liking note:', error);
    }
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (!note) {
    return (
      <div className="not-found">
        <h1>Post not found</h1>
        <Link to="/" className="btn-primary">Go Home</Link>
      </div>
    );
  }

  return (
    <div className="note-view-page">
      <article className="note-full">
        {note.coverImage && (
          <img src={note.coverImage} alt={note.title} className="note-full-cover" />
        )}
        
        <header className="note-header">
          <h1>{note.title}</h1>
          <div className="author-info">
            <Link to={`/user/${note.author?.username}`} className="author-avatar">
              {note.author?.avatar ? (
                <img src={note.author.avatar} alt={note.author.username} />
              ) : (
                <div className="avatar-placeholder">
                  {note.author?.username?.[0]?.toUpperCase()}
                </div>
              )}
            </Link>
            <div className="author-details">
              <Link to={`/user/${note.author?.username}`} className="author-name">
                {note.author?.displayName || note.author?.username}
              </Link>
              <span className="post-date">
                {new Date(note.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </span>
            </div>
          </div>
        </header>

        <div 
          className="note-body"
          dangerouslySetInnerHTML={{ __html: note.content }}
        />

        <footer className="note-footer">
          <div className="tags">
            {note.tags?.map(tag => (
              <span key={tag} className="tag">#{tag}</span>
            ))}
          </div>
          
          <div className="engagement">
            <button onClick={handleLike} className="like-btn">
              ❤️ {note.likes?.length || 0} likes
            </button>
            <span className="views">
              👁️ {note.views} views
            </span>
          </div>
        </footer>
      </article>
    </div>
  );
}

export default NoteView;
