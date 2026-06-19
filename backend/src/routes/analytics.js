const express = require('express');
const Call = require('../models/Call');
const { protect } = require('../middleware/auth');

const router = express.Router();
router.use(protect);

// GET /api/analytics/overview
router.get('/overview', async (req, res) => {
  try {
    const userId = req.user._id;

    const [total, positive, negative, neutral] = await Promise.all([
      Call.countDocuments({ userId }),
      Call.countDocuments({ userId, 'analysis.callOutcome': 'positive' }),
      Call.countDocuments({ userId, 'analysis.callOutcome': 'negative' }),
      Call.countDocuments({ userId, 'analysis.callOutcome': 'neutral' }),
    ]);

    // Average score
    const scoreAgg = await Call.aggregate([
      { $match: { userId, 'analysis.isAnalyzed': true } },
      { $group: { _id: null, avgScore: { $avg: '$analysis.salesScore' } } },
    ]);
    const avgScore = scoreAgg.length ? Math.round(scoreAgg[0].avgScore) : 0;

    // Last 7 days trend
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const trendData = await Call.aggregate([
      { $match: { userId, createdAt: { $gte: sevenDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 },
          avgScore: { $avg: '$analysis.salesScore' },
          positive: { $sum: { $cond: [{ $eq: ['$analysis.callOutcome', 'positive'] }, 1, 0] } },
          negative: { $sum: { $cond: [{ $eq: ['$analysis.callOutcome', 'negative'] }, 1, 0] } },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Top objections
    const objectionAgg = await Call.aggregate([
      { $match: { userId, 'analysis.isAnalyzed': true } },
      { $unwind: '$analysis.objections' },
      { $group: { _id: '$analysis.objections', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
    ]);

    res.json({
      success: true,
      overview: { total, positive, negative, neutral, avgScore },
      trend: trendData,
      topObjections: objectionAgg,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
