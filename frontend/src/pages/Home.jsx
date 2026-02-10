import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { API } from '../api';

function Home() {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotes();
  }, []);

  const fetchNotes = async () => {
    try {
      const res = await API.getPublicNotes();
      const data = await res.json();
      setNotes(data.notes || []);
    } catch (error) {
      console.error('Error fetching notes:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="home-page">
      <section className="hero">
        <h1>Share your knowledge with the world</h1>
        <p>Start your own blog and build your audience today</p>
        <Link to="/register" className="btn-primary btn-large">Get Started</Link>
      </section>

      <section className="notes-feed">
        <h2>Recent Posts</h2>
        {loading ? (
          <div className="loading">Loading...</div>
        ) : notes.length === 0 ? (
          <p className="no-notes">No posts yet. Be the first to share!</p>
        ) : (
          <div className="notes-grid">
            {notes.map(note => (
              <article key={note._id} className="note-card">
                {note.coverImage && (
                  <img src={note.coverImage} alt={note.title} className="note-cover" />
                )}
                <div className="note-content">
                  <Link to={`/note/${note.slug}`} className="note-title">
                    <h3>{note.title}</h3>
                  </Link>
                  <p className="note-excerpt">{note.excerpt}...</p>
                  <div className="note-meta">
                    <Link to={`/user/${note.author?.username}`} className="note-author">
                        {note.author?.displayName || note.author?.username}
                      </Link>
                    <span className="note-date">
                      {new Date(note.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default Home;
