const express = require('express');
const router = express.Router();
const Visitor = require('../models/Visitor');
const { protect } = require('../middleware/auth');

// POST /api/stats/visit - Record a visit
router.post('/visit', async (req, res) => {
  try {
    const { page, referrer } = req.body;

    const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    const userAgent = req.headers['user-agent'];

    await Visitor.create({
      ip,
      userAgent,
      page: page || '/',
      referrer
    });

    res.json({
      success: true,
      message: 'Visit recorded'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// GET /api/stats - Get statistics (protected)
router.get('/', protect, async (req, res) => {
  try {
    const { period = '7d' } = req.query;

    // Calculate date range
    let startDate = new Date();
    switch (period) {
      case '24h':
        startDate.setHours(startDate.getHours() - 24);
        break;
      case '7d':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(startDate.getDate() - 30);
        break;
      case 'all':
        startDate = new Date(0);
        break;
    }

    // Total visitors
    const totalVisitors = await Visitor.countDocuments({
      createdAt: { $gte: startDate }
    });

    // Unique visitors (by IP)
    const uniqueVisitors = await Visitor.distinct('ip', {
      createdAt: { $gte: startDate }
    });

    // Page views
    const pageViews = await Visitor.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      { $group: { _id: '$page', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    // Daily visitors
    const dailyVisitors = await Visitor.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json({
      success: true,
      data: {
        period,
        totalVisitors,
        uniqueVisitors: uniqueVisitors.length,
        pageViews,
        dailyVisitors
      }
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
