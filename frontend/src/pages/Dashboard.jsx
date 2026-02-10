import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ShareModal from '../components/ShareModal';

function Dashboard() {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user, token } = useAuth();
  const [shareNoteId, setShareNoteId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchMyNotes();
  }, []);

  const fetchMyNotes = async () => {
    try {
      let url = '/api/notes/my-notes';
      if (searchQuery) {
        url += `?search=${encodeURIComponent(searchQuery)}`;
      }
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setNotes(data.notes || []);
    } catch (error) {
      console.error('Error fetching notes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setLoading(true);
    fetchMyNotes();
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this note?')) return;

    try {
      await fetch(`/api/notes/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotes(notes.filter(note => note._id !== id));
    } catch (error) {
      console.error('Error deleting note:', error);
    }
  };

  const toggleGlobal = async (id) => {
    try {
      const res = await fetch(`/api/notes/${id}/toggle-global`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      
      if (res.ok) {
        setNotes(notes.map(note => 
          note._id === id ? { ...note, isGlobal: data.isGlobal } : note
        ));
      }
    } catch (error) {
      console.error('Error toggling global:', error);
    }
  };

  return (
    <div className="dashboard-page">
      <div className="dashboard-header">
        <h1>Welcome, {user?.displayName || user?.username}!</h1>
        <Link to="/select-category" className="btn-primary">Write a Post</Link>
      </div>

      <div className="dashboard-search">
        <form onSubmit={handleSearch} className="dashboard-search-form">
          <input
            type="text"
            placeholder="Search your posts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
          <button type="submit" className="btn-primary">Search</button>
        </form>
      </div>

      <div className="dashboard-content">
        <h2>Your Posts {searchQuery && `("${searchQuery}")`}</h2>
        
        {loading ? (
          <div className="loading">Loading...</div>
        ) : notes.length === 0 ? (
          <div className="empty-state">
            <p>{searchQuery ? `No posts found for "${searchQuery}"` : "You haven't written any posts yet."}</p>
            {searchQuery ? (
              <button onClick={() => { setSearchQuery(''); fetchMyNotes(); }} className="btn-primary">
                View All Posts
              </button>
            ) : (
              <Link to="/select-category" className="btn-primary">Write your first post</Link>
            )}
          </div>
        ) : (
          <div className="notes-list">
            {notes.map(note => (
              <div key={note._id} className="note-item">
                <div className="note-info">
                  <Link to={`/note/${note.slug}`} className="note-title">
                    <h3>{note.title}</h3>
                  </Link>
                  <p className="note-excerpt">{note.excerpt}...</p>
                  <div className="note-meta">
                    {note.category && (
                      <span className="category-badge">
                        {note.category.name}
                      </span>
                    )}
                    <span className={`status ${note.isPublished ? 'published' : 'draft'}`}>
                      {note.isPublished ? 'Published' : 'Draft'}
                    </span>
                    {note.isPublished && (
                      <span className={`status ${note.isGlobal ? 'global' : 'private'}`}>
                        {note.isGlobal ? '🌍 Global' : '🔒 Private'}
                      </span>
                    )}
                    <span className="date">
                      {new Date(note.createdAt).toLocaleDateString()}
                    </span>
                    <span className="views">{note.views} views</span>
                  </div>
                </div>
                <div className="note-actions">
                  <Link to={`/edit/${note._id}`} className="btn-edit">Edit</Link>
                  {note.isPublished && (
                    <>
                      <button 
                        onClick={() => toggleGlobal(note._id)} 
                        className={`btn-global ${note.isGlobal ? 'active' : ''}`}
                      >
                        {note.isGlobal ? '🌍 Unpublish Global' : '🌍 Publish Global'}
                      </button>
                      <button 
                        onClick={() => setShareNoteId(note._id)} 
                        className="btn-share"
                      >
                        📤 Share
                      </button>
                    </>
                  )}
                  <button onClick={() => handleDelete(note._id)} className="btn-delete">
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {shareNoteId && (
        <ShareModal 
          noteId={shareNoteId} 
          onClose={() => setShareNoteId(null)} 
        />
      )}
    </div>
  );
}

export default Dashboard;
