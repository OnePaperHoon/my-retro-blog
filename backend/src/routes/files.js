const express = require('express');
const router = express.Router();
const File = require('../models/File');
const { protect } = require('../middleware/auth');

// GET /api/files - Get file tree or files in folder
router.get('/', async (req, res) => {
  try {
    const { parentId, path } = req.query;

    let query = {};

    if (parentId) {
      query.parentId = parentId === 'null' ? null : parentId;
    } else if (path) {
      query.path = path;
    } else {
      query.parentId = null; // Root level
    }

    const files = await File.find(query).sort({ type: -1, name: 1 });

    res.json({
      success: true,
      data: files
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// GET /api/files/tree - Get complete file tree
router.get('/tree', async (req, res) => {
  try {
    const files = await File.find().sort({ path: 1 });

    // Build tree structure
    const buildTree = (files, parentId = null) => {
      return files
        .filter(f => String(f.parentId) === String(parentId))
        .map(file => ({
          ...file.toObject(),
          children: file.type === 'folder' ? buildTree(files, file._id) : undefined
        }));
    };

    const tree = buildTree(files);

    res.json({
      success: true,
      data: tree
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// GET /api/files/:id - Get single file
router.get('/:id', async (req, res) => {
  try {
    const file = await File.findById(req.params.id);

    if (!file) {
      return res.status(404).json({
        success: false,
        message: 'File not found'
      });
    }

    res.json({
      success: true,
      data: file
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// POST /api/files - Create file/folder (protected)
router.post('/', protect, async (req, res) => {
  try {
    const { name, type, content, parentId, icon } = req.body;

    // Determine path
    let path = '/';
    if (parentId) {
      const parent = await File.findById(parentId);
      if (parent) {
        path = `${parent.path}${parent.name}/`;
      }
    }

    const file = await File.create({
      name,
      type,
      content: content || '',
      parentId: parentId || null,
      path,
      icon,
      size: content ? content.length : 0
    });

    res.status(201).json({
      success: true,
      data: file
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// PUT /api/files/:id - Update file/folder (protected)
router.put('/:id', protect, async (req, res) => {
  try {
    const { name, content, icon } = req.body;

    const updateData = {};
    if (name) updateData.name = name;
    if (content !== undefined) {
      updateData.content = content;
      updateData.size = content.length;
    }
    if (icon) updateData.icon = icon;

    const file = await File.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!file) {
      return res.status(404).json({
        success: false,
        message: 'File not found'
      });
    }

    res.json({
      success: true,
      data: file
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// DELETE /api/files/:id - Delete file/folder (protected)
router.delete('/:id', protect, async (req, res) => {
  try {
    const file = await File.findById(req.params.id);

    if (!file) {
      return res.status(404).json({
        success: false,
        message: 'File not found'
      });
    }

    // If it's a folder, delete all children
    if (file.type === 'folder') {
      await File.deleteMany({ path: { $regex: `^${file.path}${file.name}/` } });
    }

    await File.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'File deleted'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

module.exports = router;
