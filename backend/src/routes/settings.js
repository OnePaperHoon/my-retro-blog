const express = require('express');
const router = express.Router();
const Settings = require('../models/Settings');
const { protect } = require('../middleware/auth');

// GET /api/settings - Get all settings
router.get('/', async (req, res) => {
  try {
    const settings = await Settings.find();

    // Convert to object
    const settingsObj = {};
    settings.forEach(s => {
      settingsObj[s.key] = s.value;
    });

    res.json({
      success: true,
      data: settingsObj
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// GET /api/settings/:key - Get single setting
router.get('/:key', async (req, res) => {
  try {
    const setting = await Settings.findOne({ key: req.params.key });

    if (!setting) {
      return res.status(404).json({
        success: false,
        message: 'Setting not found'
      });
    }

    res.json({
      success: true,
      data: setting.value
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// PUT /api/settings - Update settings (protected)
router.put('/', protect, async (req, res) => {
  try {
    const settings = req.body;

    // Update or create each setting
    for (const [key, value] of Object.entries(settings)) {
      await Settings.findOneAndUpdate(
        { key },
        { key, value },
        { upsert: true, new: true }
      );
    }

    res.json({
      success: true,
      message: 'Settings updated'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// PUT /api/settings/:key - Update single setting (protected)
router.put('/:key', protect, async (req, res) => {
  try {
    const { value } = req.body;

    const setting = await Settings.findOneAndUpdate(
      { key: req.params.key },
      { key: req.params.key, value },
      { upsert: true, new: true }
    );

    res.json({
      success: true,
      data: setting
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
