const express = require('express');
const Call = require('../models/Call');
const { protect } = require('../middleware/auth');
const { analyzeCallTranscript } = require('../utils/gemini');

const router = express.Router();

// All routes protected
router.use(protect);

// POST /api/calls - Create new call and analyze
router.post('/', async (req, res) => {
  try {
    const { title, customerName, salesRepName, transcript, callDate } = req.body;

    if (!title || !transcript) {
      return res.status(400).json({ success: false, message: 'Title and transcript are required.' });
    }

    // Create call first
    const call = await Call.create({
      userId: req.user._id,
      title,
      customerName: customerName || 'Unknown Customer',
      salesRepName: salesRepName || req.user.name,
      transcript,
      callDate: callDate || new Date(),
    });

    // Analyze with Gemini
    try {
      const analysis = await analyzeCallTranscript(transcript);
      call.analysis = analysis;
      await call.save();
    } catch (aiError) {
      console.error('AI Analysis error:', aiError.message);
      // Return call even if AI fails
      return res.status(201).json({
        success: true,
        message: 'Call saved but AI analysis failed. Try re-analyzing.',
        call,
        aiError: aiError.message,
      });
    }

    res.status(201).json({ success: true, message: 'Call analyzed successfully.', call });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/calls - Get all calls for user
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10, outcome } = req.query;
    const filter = { userId: req.user._id };
    if (outcome) filter['analysis.callOutcome'] = outcome;

    const total = await Call.countDocuments(filter);
    const calls = await Call.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .select('-transcript'); // Don't send full transcript in list

    res.json({
      success: true,
      calls,
      pagination: { total, page: parseInt(page), limit: parseInt(limit), pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/calls/:id - Get single call with transcript
router.get('/:id', async (req, res) => {
  try {
    const call = await Call.findOne({ _id: req.params.id, userId: req.user._id });
    if (!call) return res.status(404).json({ success: false, message: 'Call not found.' });
    res.json({ success: true, call });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/calls/:id/reanalyze - Re-run AI analysis
router.post('/:id/reanalyze', async (req, res) => {
  try {
    const call = await Call.findOne({ _id: req.params.id, userId: req.user._id });
    if (!call) return res.status(404).json({ success: false, message: 'Call not found.' });

    const analysis = await analyzeCallTranscript(call.transcript);
    call.analysis = analysis;
    await call.save();

    res.json({ success: true, message: 'Re-analysis complete.', call });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// DELETE /api/calls/:id
router.delete('/:id', async (req, res) => {
  try {
    const call = await Call.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!call) return res.status(404).json({ success: false, message: 'Call not found.' });
    res.json({ success: true, message: 'Call deleted.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
