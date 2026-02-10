import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';

function CategoryPage() {
  const { slug } = useParams();
  const [category, setCategory] = useState(null);
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategoryNotes();
  }, [slug]);

  const fetchCategoryNotes = async () => {
    try {
      // Fetch category info
      const catRes = await fetch(`/api/categories/${slug}`);
      const catData = await catRes.json();
      
      if (catRes.ok) {
        setCategory(catData.category);
      }

      // Fetch notes by category
      const notesRes = await fetch(`/api/notes?category=${slug}`);
      const notesData = await notesRes.json();
      
      if (notesRes.ok) {
        setNotes(notesData.notes || []);
      }
    } catch (error) {
      console.error('Error fetching category:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (!category) {
    return (
      <div className="error-page">
        <h2>Category Not Found</h2>
        <p>This category doesn't exist.</p>
        <Link to="/select-category" className="btn-primary">Browse Categories</Link>
      </div>
    );
  }

  return (
    <div className="category-page">
      <div className="category-header">
        <div className="category-info">
          <span className="category-icon-large">
            {category.slug === 'technology' ? '💻' : 
             category.slug === 'lifestyle' ? '🌟' :
             category.slug === 'education' ? '📚' :
             category.slug === 'business' ? '💼' :
             category.slug === 'health' ? '🏃' : '📝'}
          </span>
          <div>
            <h1>{category.name}</h1>
            {category.description && <p className="category-description">{category.description}</p>}
          </div>
        </div>
        <Link to={`/new?category=${category.slug}`} className="btn-primary">
          + Write in this Category
        </Link>
      </div>

      {notes.length === 0 ? (
        <div className="empty-state">
          <p>No notes in this category yet.</p>
          <Link to={`/new?category=${category.slug}`} className="btn-primary">
            Be the first to write!
          </Link>
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
                  <span className="author">
                    {note.author?.displayName || note.author?.username}
                  </span>
                  <span className="date">
                    {new Date(note.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default CategoryPage;
