const express = require('express');
const router = express.Router();
const Project = require('../models/Project');
const { protect } = require('../middleware/auth');

// GET /api/projects - Get all projects
router.get('/', async (req, res) => {
  try {
    const { featured } = req.query;

    const query = {};

    if (featured === 'true') {
      query.featured = true;
    }

    const projects = await Project.find(query).sort({ order: 1, createdAt: -1 });

    res.json({
      success: true,
      data: projects
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// GET /api/projects/:id - Get single project
router.get('/:id', async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    res.json({
      success: true,
      data: project
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// POST /api/projects - Create project (protected)
router.post('/', protect, async (req, res) => {
  try {
    const { title, description, techStack, imageUrl, githubUrl, demoUrl, featured, order } = req.body;

    const project = await Project.create({
      title,
      description,
      techStack,
      imageUrl,
      githubUrl,
      demoUrl,
      featured,
      order
    });

    res.status(201).json({
      success: true,
      data: project
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// PUT /api/projects/:id - Update project (protected)
router.put('/:id', protect, async (req, res) => {
  try {
    const { title, description, techStack, imageUrl, githubUrl, demoUrl, featured, order } = req.body;

    const project = await Project.findByIdAndUpdate(
      req.params.id,
      { title, description, techStack, imageUrl, githubUrl, demoUrl, featured, order },
      { new: true, runValidators: true }
    );

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    res.json({
      success: true,
      data: project
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// DELETE /api/projects/:id - Delete project (protected)
router.delete('/:id', protect, async (req, res) => {
  try {
    const project = await Project.findByIdAndDelete(req.params.id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    res.json({
      success: true,
      message: 'Project deleted'
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
