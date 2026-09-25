const db = require('../config/db');

// Get messages for conversation
exports.getMessages = (req, res) => {
  try {
    const { receiverId, orderId } = req.query;
    const currentUserId = req.user.id;

    let messages = db.find('messages');

    if (orderId) {
      messages = messages.filter(m => m.orderId === orderId);
    } else if (receiverId) {
      messages = messages.filter(m =>
        (m.senderId === currentUserId && m.receiverId === receiverId) ||
        (m.senderId === receiverId && m.receiverId === currentUserId)
      );
    } else {
      messages = messages.filter(m => m.senderId === currentUserId || m.receiverId === currentUserId);
    }

    messages.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

    res.json({
      success: true,
      data: messages
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Send message
exports.sendMessage = (req, res) => {
  try {
    const { receiverId, text, orderId, attachmentUrl } = req.body;
    if (!receiverId || (!text && !attachmentUrl)) {
      return res.status(400).json({
        success: false,
        message: 'Receiver ID and text or attachment are required'
      });
    }

    const receiver = db.findById('users', receiverId);
    const newMsg = db.insert('messages', {
      conversationId: `${[req.user.id, receiverId].sort().join('_')}`,
      senderId: req.user.id,
      senderName: req.user.name,
      receiverId,
      orderId: orderId || null,
      text: text || '',
      attachmentUrl: attachmentUrl || null,
      timestamp: new Date().toISOString(),
      read: false
    });

    res.status(201).json({
      success: true,
      data: newMsg
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
