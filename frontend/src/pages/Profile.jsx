import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Profile() {
  const { username } = useParams();
  const { user, token } = useAuth();
  const [profile, setProfile] = useState(null);
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    displayName: '',
    bio: '',
    blogTitle: ''
  });

  useEffect(() => {
    if (username) {
      fetchUserProfile();
    }
  }, [username]);

  const fetchUserProfile = async () => {
    try {
      // If viewing own profile
      if (user && user.username === username) {
        setProfile(user);
        setFormData({
          displayName: user.displayName || '',
          bio: user.bio || '',
          blogTitle: user.blogTitle || ''
        });
        await fetchUserNotes(user._id);
      } else {
        // View another user's profile - fetch from backend
        const res = await fetch(`/api/auth/users/${username}`);
        const data = await res.json();
        if (res.ok) {
          setProfile(data.user);
          await fetchUserNotes(data.user._id);
        }
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserNotes = async (userId) => {
    try {
      const res = await fetch(`/api/notes/user/${userId}`);
      const data = await res.json();
      if (res.ok) {
        setNotes(data.notes || []);
      }
    } catch (error) {
      console.error('Error fetching notes:', error);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    
    try {
      const res = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      const data = await res.json();

      if (res.ok) {
        setProfile(data.user);
        setEditing(false);
      } else {
        alert(data.error || 'Error updating profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (!profile) {
    return (
      <div className="not-found">
        <h1>User Not Found</h1>
        <p>The user "{username}" does not exist.</p>
        <Link to="/" className="btn-primary">Go Home</Link>
      </div>
    );
  }

  const isOwnProfile = user && user.username === username;

  return (
    <div className="profile-page">
      <div className="profile-header">
        <div className="profile-avatar">
          {profile.avatar ? (
            <img src={profile.avatar} alt={profile.username} />
          ) : (
            <div className="avatar-placeholder large">
              {profile.displayName?.[0] || profile.username[0].toUpperCase()}
            </div>
          )}
        </div>
        
        {editing ? (
          <form onSubmit={handleUpdateProfile} className="profile-form">
            <div className="form-group">
              <label>Display Name</label>
              <input
                type="text"
                value={formData.displayName}
                onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Bio</label>
              <textarea
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                rows={3}
              />
            </div>
            <div className="form-group">
              <label>Blog Title</label>
              <input
                type="text"
                value={formData.blogTitle}
                onChange={(e) => setFormData({ ...formData, blogTitle: e.target.value })}
              />
            </div>
            <div className="form-actions">
              <button type="submit" className="btn-primary">Save</button>
              <button type="button" className="btn-secondary" onClick={() => setEditing(false)}>
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <>
            <h1>{profile.displayName || profile.username}</h1>
            <p className="profile-username">@{profile.username}</p>
            {profile.blogTitle && <p className="blog-title">{profile.blogTitle}</p>}
            {profile.bio && <p className="profile-bio">{profile.bio}</p>}
            
            {isOwnProfile && (
              <button onClick={() => setEditing(true)} className="btn-edit">
                Edit Profile
              </button>
            )}
          </>
        )}
      </div>

      <div className="profile-posts">
        <h2>
          {isOwnProfile ? 'My Posts' : `${profile.displayName || profile.username}'s Posts`}
        </h2>
        
        {notes.length === 0 ? (
          <div className="no-posts">
            <p>No posts yet.</p>
            {isOwnProfile && (
              <Link to="/select-category" className="btn-primary">Write your first post</Link>
            )}
          </div>
        ) : (
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
                    <span className="date">
                      {new Date(note.createdAt).toLocaleDateString()}
                    </span>
                    <span className="views">{note.views} views</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Profile;
