// AgriNex AI Assistant Controller
const assistantService = require('../services/assistantService');

// POST /api/assistant/chat
exports.chat = async (req, res) => {
  try {
    const { message, lang = 'en' } = req.body;
    if (!message) {
      return res.status(400).json({ success: false, message: 'Message text is required' });
    }

    const response = await assistantService.generateResponse(req.user, message, lang);

    // Save conversation history for authenticated user
    if (req.user?.id) {
      assistantService.saveHistory(req.user.id, message, response);
    }

    res.json({
      success: true,
      data: {
        message: response.reply,
        action: response.action || null,
        quickActions: response.quickActions || [],
        voiceText: response.voiceText || response.reply
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/assistant/voice-context
exports.getVoiceContext = (req, res) => {
  try {
    const { lang = 'en' } = req.body;
    const context = assistantService.getVoiceWelcome(req.user, lang);
    res.json({
      success: true,
      data: context
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/assistant/history
exports.getHistory = (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.json({ success: true, data: [] });
    }
    const history = assistantService.getHistory(userId, 30);
    res.json({
      success: true,
      data: history
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// DELETE /api/assistant/history
exports.clearHistory = (req, res) => {
  try {
    const userId = req.user?.id;
    if (userId) {
      assistantService.clearHistory(userId);
    }
    res.json({
      success: true,
      message: 'Assistant conversation history cleared'
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
