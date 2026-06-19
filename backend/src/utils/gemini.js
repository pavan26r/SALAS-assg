const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

const analyzeCallTranscript = async (transcript) => {
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

  const prompt = `You are an expert sales call analyzer. Analyze the following sales call transcript and provide a detailed JSON analysis.

TRANSCRIPT:
${transcript}

Respond ONLY with a valid JSON object (no markdown, no explanation) with this exact structure:
{
  "summary": "2-3 sentence summary of what happened in the call",
  "sentiment": {
    "positive": <number 0-100>,
    "neutral": <number 0-100>,
    "negative": <number 0-100>
  },
  "objections": ["objection1", "objection2"],
  "followUpSuggestions": ["suggestion1", "suggestion2", "suggestion3"],
  "salesScore": <number 0-100>,
  "keyInsights": ["insight1", "insight2", "insight3"],
  "callOutcome": "<positive|neutral|negative>"
}

Rules for salesScore:
- 80-100: Excellent - customer clearly interested, objections handled, next steps set
- 60-79: Good - positive engagement, some objections remain
- 40-59: Average - mixed signals, significant objections
- 0-39: Poor - customer not interested or rep poorly handled the call

Sentiment percentages must sum to 100.`;

  const result = await model.generateContent(prompt);
  const text = result.response.text();

  // Clean and parse JSON
  const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
  const analysis = JSON.parse(cleaned);

  // Validate sentiment sums to 100
  const total = analysis.sentiment.positive + analysis.sentiment.neutral + analysis.sentiment.negative;
  if (Math.abs(total - 100) > 5) {
    // Normalize
    analysis.sentiment.positive = Math.round((analysis.sentiment.positive / total) * 100);
    analysis.sentiment.neutral = Math.round((analysis.sentiment.neutral / total) * 100);
    analysis.sentiment.negative = 100 - analysis.sentiment.positive - analysis.sentiment.neutral;
  }

  analysis.isAnalyzed = true;
  return analysis;
};

module.exports = { analyzeCallTranscript };
