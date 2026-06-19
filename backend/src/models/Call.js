const mongoose = require('mongoose');

const callSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true, trim: true },
  customerName: { type: String, trim: true, default: 'Unknown Customer' },
  salesRepName: { type: String, trim: true, default: 'Unknown Rep' },
  transcript: { type: String, required: true },
  callDate: { type: Date, default: Date.now },

  // AI Analysis Results
  analysis: {
    summary: { type: String, default: '' },
    sentiment: {
      positive: { type: Number, default: 0 },
      neutral: { type: Number, default: 0 },
      negative: { type: Number, default: 0 },
    },
    objections: [{ type: String }],
    followUpSuggestions: [{ type: String }],
    salesScore: { type: Number, default: 0, min: 0, max: 100 },
    keyInsights: [{ type: String }],
    callOutcome: { type: String, enum: ['positive', 'neutral', 'negative'], default: 'neutral' },
    isAnalyzed: { type: Boolean, default: false },
  },

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

callSchema.pre('save', function (next) {
  this.updatedAt = new Date();
  next();
});

// Virtual for score label
callSchema.virtual('scoreLabel').get(function () {
  const score = this.analysis.salesScore;
  if (score >= 80) return 'Excellent';
  if (score >= 60) return 'Good';
  if (score >= 40) return 'Average';
  return 'Poor';
});

module.exports = mongoose.model('Call', callSchema);
