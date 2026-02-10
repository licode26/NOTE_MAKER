import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function CategorySelect({ onCreateNew }) {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newCategory, setNewCategory] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const { token } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchUserCategories();
  }, []);

  const fetchUserCategories = async () => {
    try {
      const res = await fetch('/api/categories/my-categories', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setCategories(data.categories || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (category) => {
    // Navigate to create note with this category
    navigate(`/new?category=${category.slug}`);
  };

  const handleCreateCategory = async (e) => {
    e.preventDefault();
    if (!newCategory.trim()) return;

    setIsCreating(true);

    try {
      const res = await fetch('/api/categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ name: newCategory.trim() })
      });

      const data = await res.json();

      if (res.ok) {
        // Add the new category to the list immediately
        setCategories(prev => [...prev, data.category]);
        setNewCategory('');
        setShowCreate(false);
        
        // Navigate to create note for the new category
        navigate(`/new?category=${data.category.slug}`);
      } else {
        alert(data.error || 'Error creating category');
      }
    } catch (error) {
      console.error('Error creating category:', error);
    } finally {
      setIsCreating(false);
    }
  };

  const getCategoryIcon = (slug) => {
    const icons = {
      technology: '💻',
      lifestyle: '🌟',
      education: '📚',
      business: '💼',
      health: '🏃',
      travel: '✈️',
      food: '🍕',
      music: '🎵',
      sports: '⚽',
      art: '🎨',
      science: '🔬',
      gaming: '🎮'
    };
    return icons[slug] || '📁';
  };

  if (loading) {
    return <div className="loading">Loading your categories...</div>;
  }

  return (
    <div className="category-select-page">
      <div className="category-select-container">
        <h2>Select a Category</h2>
        <p>Choose a category for your post</p>

        {categories.length === 0 ? (
          <div className="empty-state">
            <p>You haven't created any categories yet.</p>
            <p>Create your first category below!</p>
          </div>
        ) : (
          <div className="categories-grid">
            {categories.map(category => (
              <button
                key={category._id}
                className="category-card"
                onClick={() => handleSelect(category)}
              >
                <span className="category-icon">
                  {getCategoryIcon(category.slug)}
                </span>
                <span className="category-name">{category.name}</span>
                {category.description && (
                  <span className="category-desc">{category.description}</span>
                )}
              </button>
            ))}
          </div>
        )}

        <div className="create-category-section">
          {showCreate ? (
            <form onSubmit={handleCreateCategory} className="create-category-form">
              <input
                type="text"
                placeholder="Enter category name"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                className="category-input"
                autoFocus
              />
              <div className="form-actions">
                <button 
                  type="submit" 
                  className="btn-primary"
                  disabled={isCreating}
                >
                  {isCreating ? 'Creating...' : 'Create'}
                </button>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => {
                    setShowCreate(false);
                    setNewCategory('');
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <button
              className="btn-create-category"
              onClick={() => setShowCreate(true)}
            >
              + Create New Category
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default CategorySelect;
