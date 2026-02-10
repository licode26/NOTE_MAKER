const express = require('express');
const crypto = require('crypto');
const Note = require('../models/Note');
const auth = require('../middleware/auth');

const router = express.Router();

// Create note
router.post('/', auth, async (req, res) => {
  try {
    const { title, content, tags, coverImage, isPublished, category } = req.body;

    // Create excerpt from content
    const excerpt = content.replace(/<[^>]+>/g, '').slice(0, 200);

    // Find category by slug if provided
    let categoryId = undefined;
    if (category) {
      const Category = require('../models/Category');
      const cat = await Category.findOne({ slug: category });
      if (cat) {
        categoryId = cat._id;
      }
    }

    const note = new Note({
      title,
      content,
      excerpt,
      tags: tags || [],
      coverImage: coverImage || '',
      isPublished: isPublished !== false,
      author: req.userId,
      category: categoryId
    });

    await note.save();
    await note.populate('author', 'username displayName avatar');
    await note.populate('category', 'name slug');

    res.status(201).json({ note });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all notes (public feed)
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const search = req.query.search || '';
    const categorySlug = req.query.category || '';

    let query = { isPublished: true };

    // Add category filter
    if (categorySlug) {
      const Category = require('../models/Category');
      const category = await Category.findOne({ slug: categorySlug });
      if (category) {
        query.category = category._id;
      }
    }

    // Add search functionality - prioritize exact matches
    if (search) {
      const Category = require('../models/Category');
      const User = require('../models/Category');
      
      // Find matching categories (exact match)
      const matchingCategories = await Category.find({
        name: { $regex: `^${search}$`, $options: 'i' }
      }).select('_id');
      
      // Find matching users (exact username match)
      const matchingUsers = await User.find({
        $or: [
          { username: { $regex: `^${search}$`, $options: 'i' } },
          { displayName: { $regex: `^${search}$`, $options: 'i' } }
        ]
      }).select('_id');
      
      const categoryIds = matchingCategories.map(c => c._id);
      const userIds = matchingUsers.map(u => u._id);
      
      // Use word boundary regex for content to be more strict
      const searchRegex = new RegExp(`\\b${search}\\b`, 'i');
      
      query.$or = [
        // Title matches with word boundary (highest priority)
        { title: { $regex: searchRegex } },
        // Exact tag matches
        { tags: { $in: [new RegExp(`^${search}$`, 'i')] } },
        // Category match (exact)
        { category: { $in: categoryIds } },
        // Author match (exact)
        { author: { $in: userIds } },
        // Content with word boundary (only matches whole words)
        { content: { $regex: searchRegex } }
      ];
    }

    const notes = await Note.find(query)
      .populate('author', 'username displayName avatar')
      .populate('category', 'name slug')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Note.countDocuments(query);

    res.json({
      notes,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get user's notes
router.get('/my-notes', auth, async (req, res) => {
  try {
    const search = req.query.search || '';
    
    let query = { author: req.userId };
    
    if (search) {
      const Category = require('../models/Category');
      
      // Find matching categories
      const matchingCategories = await Category.find({
        name: { $regex: `\\b${search}\\b`, $options: 'i' },
        createdBy: req.userId
      }).select('_id');
      
      const categoryIds = matchingCategories.map(c => c._id);
      
      // Word boundary regex for stricter search
      const searchRegex = new RegExp(`\\b${search}\\b`, 'i');
      
      query.$or = [
        { title: { $regex: searchRegex } },
        { content: { $regex: searchRegex } },
        { tags: { $in: [new RegExp(`^${search}$`, 'i')] } },
        { category: { $in: categoryIds } }
      ];
    }

    const notes = await Note.find(query)
      .populate('category', 'name slug')
      .sort({ createdAt: -1 });

    res.json({ notes });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single note
router.get('/:slug', async (req, res) => {
  try {
    const note = await Note.findOne({ slug: req.params.slug })
      .populate('author', 'username displayName avatar bio blogTitle');

    if (!note) {
      return res.status(404).json({ error: 'Note not found' });
    }

    // Increment views
    note.views += 1;
    await note.save();

    res.json({ note });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get notes by user ID (public)
router.get('/user/:userId', async (req, res) => {
  try {
    const notes = await Note.find({ 
      author: req.params.userId,
      isPublished: true
    })
      .populate('category', 'name slug')
      .sort({ createdAt: -1 });

    res.json({ notes });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update note
router.put('/:id', auth, async (req, res) => {
  try {
    const { title, content, tags, coverImage, isPublished, category } = req.body;

    const note = await Note.findOne({ _id: req.params.id, author: req.userId });
    if (!note) {
      return res.status(404).json({ error: 'Note not found or unauthorized' });
    }

    if (title) {
      note.title = title;
      note.excerpt = content.replace(/<[^>]+>/g, '').slice(0, 200);
    }
    if (content) note.content = content;
    if (tags) note.tags = tags;
    if (coverImage !== undefined) note.coverImage = coverImage;
    if (isPublished !== undefined) note.isPublished = isPublished;
    
    // Handle category as slug
    if (category !== undefined) {
      if (category) {
        const Category = require('../models/Category');
        const cat = await Category.findOne({ slug: category });
        note.category = cat ? cat._id : null;
      } else {
        note.category = null;
      }
    }

    await note.save();
    await note.populate('author', 'username displayName avatar');
    await note.populate('category', 'name slug');

    res.json({ note });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete note
router.delete('/:id', auth, async (req, res) => {
  try {
    const note = await Note.findOneAndDelete({ _id: req.params.id, author: req.userId });
    
    if (!note) {
      return res.status(404).json({ error: 'Note not found or unauthorized' });
    }

    res.json({ message: 'Note deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Like/unlike note
router.post('/:id/like', auth, async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);
    
    if (!note) {
      return res.status(404).json({ error: 'Note not found' });
    }

    const likeIndex = note.likes.indexOf(req.userId);
    
    if (likeIndex > -1) {
      // Unlike
      note.likes.splice(likeIndex, 1);
    } else {
      // Like
      note.likes.push(req.userId);
    }

    await note.save();
    res.json({ likes: note.likes.length, liked: likeIndex === -1 });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get global/recent notes (published to global feed)
router.get('/global/recent', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const notes = await Note.find({ isGlobal: true, isPublished: true })
      .populate('author', 'username displayName avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Note.countDocuments({ isGlobal: true, isPublished: true });

    res.json({
      notes,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Toggle global publish
router.post('/:id/toggle-global', auth, async (req, res) => {
  try {
    const note = await Note.findOne({ _id: req.params.id, author: req.userId });
    
    if (!note) {
      return res.status(404).json({ error: 'Note not found or unauthorized' });
    }

    note.isGlobal = !note.isGlobal;
    await note.save();

    res.json({ note, isGlobal: note.isGlobal });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Generate share link
router.post('/:id/share', auth, async (req, res) => {
  try {
    const note = await Note.findOne({ _id: req.params.id, author: req.userId });
    
    if (!note) {
      return res.status(404).json({ error: 'Note not found or unauthorized' });
    }

    // Generate unique share link if not exists
    if (!note.shareLink) {
      note.shareLink = crypto.randomBytes(8).toString('hex');
      await note.save();
    }

    const shareUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/share/${note.shareLink}`;
    
    res.json({ 
      shareUrl, 
      shareLink: note.shareLink,
      shareQrCode: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/api/notes/qr/${note.shareLink}`
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get note by share link (public)
router.get('/share/:shareLink', async (req, res) => {
  try {
    const note = await Note.findOne({ shareLink: req.params.shareLink })
      .populate('author', 'username displayName avatar bio');

    if (!note) {
      return res.status(404).json({ error: 'Note not found' });
    }

    // Increment views
    note.views += 1;
    await note.save();

    res.json({ note });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Generate QR code for share link
router.get('/qr/:shareLink', async (req, res) => {
  try {
    const QRCode = require('qrcode');
    const shareUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/share/${req.params.shareLink}`;
    
    const qrCodeDataUrl = await QRCode.toDataURL(shareUrl, {
      width: 256,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#ffffff'
      }
    });

    res.json({ qrCode: qrCodeDataUrl });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
