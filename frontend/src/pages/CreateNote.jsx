import { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { useAuth } from '../context/AuthContext';

function CreateNote() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const categorySlug = searchParams.get('category');
  const navigate = useNavigate();
  const { token } = useAuth();
  
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [isPublished, setIsPublished] = useState(true);
  const [category, setCategory] = useState(categorySlug || '');
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(!!id);

  useEffect(() => {
    if (id) {
      fetchNote();
    }
  }, [id]);

  const fetchNote = async () => {
    try {
      const res = await fetch('/api/notes/my-notes', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      const note = data.notes?.find(n => n._id === id);
      
      if (note) {
        setTitle(note.title);
        setContent(note.content);
        setTags(note.tags?.join(', ') || '');
        setCoverImage(note.coverImage || '');
        setIsPublished(note.isPublished);
        if (note.category) {
          setCategory(note.category._id || note.category);
        }
      }
    } catch (error) {
      console.error('Error fetching note:', error);
    } finally {
      setFetching(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      alert('Please enter a title and content');
      return;
    }

    setLoading(true);

    const noteData = {
      title,
      content,
      tags: tags.split(',').map(tag => tag.trim()).filter(Boolean),
      coverImage: coverImage || undefined,
      isPublished,
      category: category || undefined
    };

    try {
      const url = id ? `/api/notes/${id}` : '/api/notes';
      const method = id ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(noteData)
      });

      const data = await res.json();

      if (res.ok) {
        navigate('/dashboard');
      } else {
        alert(data.error || 'Error saving note');
      }
    } catch (error) {
      console.error('Error saving note:', error);
      alert('Error saving note');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="create-note-page">
      <form onSubmit={handleSubmit} className="create-form">
        <div className="form-header">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter your post title..."
            className="title-input"
          />
          <div className="form-actions">
            <label className="publish-toggle">
              <input
                type="checkbox"
                checked={isPublished}
                onChange={(e) => setIsPublished(e.target.checked)}
              />
              {isPublished ? 'Published' : 'Draft'}
            </label>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>

        <div className="editor-container">
          <ReactQuill
            theme="snow"
            value={content}
            onChange={setContent}
            placeholder="Write your story..."
            modules={{
              toolbar: [
                [{ header: [1, 2, 3, false] }],
                ['bold', 'italic', 'underline', 'strike'],
                [{ list: 'ordered' }, { list: 'bullet' }],
                ['blockquote', 'code-block'],
                ['link'],
                ['clean']
              ]
            }}
          />
        </div>

        <div className="sidebar-section">
          <h3>Category</h3>
          <input
            type="text"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            placeholder="Category..."
            disabled={!!categorySlug}
          />
          {categorySlug && (
            <small>Category selected from: {categorySlug}</small>
          )}
        </div>

        <div className="sidebar-section">
          <h3>Cover Image</h3>
          <input
            type="text"
            value={coverImage}
            onChange={(e) => setCoverImage(e.target.value)}
            placeholder="Enter image URL..."
          />
        </div>

        <div className="sidebar-section">
          <h3>Tags</h3>
          <input
            type="text"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="react, javascript, css..."
          />
          <small>Separate tags with commas</small>
        </div>
      </form>
    </div>
  );
}

export default CreateNote;
