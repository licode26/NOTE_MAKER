const express = require('express');
const Category = require('../models/Category');
const auth = require('../middleware/auth');

const router = express.Router();

// Get all categories
router.get('/', async (req, res) => {
  try {
    const categories = await Category.find()
      .sort({ name: 1 });
    res.json({ categories });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get user's categories
router.get('/my-categories', auth, async (req, res) => {
  try {
    const categories = await Category.find({ createdBy: req.userId })
      .sort({ name: 1 });
    res.json({ categories });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create new category
router.post('/', auth, async (req, res) => {
  try {
    const { name, description } = req.body;

    // Check if category already exists
    const existing = await Category.findOne({ name: name.toLowerCase() });
    if (existing) {
      return res.status(400).json({ error: 'Category already exists' });
    }

    const category = new Category({
      name,
      description,
      createdBy: req.userId
    });

    await category.save();
    res.status(201).json({ category });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get category by slug
router.get('/:slug', async (req, res) => {
  try {
    const category = await Category.findOne({ slug: req.params.slug });
    
    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }

    res.json({ category });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
