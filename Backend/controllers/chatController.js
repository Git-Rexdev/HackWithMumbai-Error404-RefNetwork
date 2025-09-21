const Message = require('../models/Chat');

exports.sendMessage = async (req, res, next) => {
  try {
    const { receiverId, message } = req.body;

    if (!receiverId || !message) {
      return res.status(400).json({ message: 'Receiver and message are required' });
    }

    const newMessage = await Message.create({
      sender: req.userId,
      receiver: receiverId,
      message
    });

    res.status(201).json({ success: true, newMessage });
  } catch (err) {
    next(err);
  }
};

/**
 * Get chat history between logged-in user and another user
 */
exports.getChatHistory = async (req, res, next) => {
  try {
    const { userId } = req.params;

    const messages = await Message.find({
      $or: [
        { sender: req.userId, receiver: userId },
        { sender: userId, receiver: req.userId }
      ]
    })
      .populate('sender', 'name role email')
      .populate('receiver', 'name role email')
      .sort({ createdAt: 1 });

    res.json({ success: true, count: messages.length, messages });
  } catch (err) {
    next(err);
  }
};

/**
 * Get all chats for logged-in user (all their conversations)
 */
exports.getMyChats = async (req, res, next) => {
  try {
    const messages = await Message.find({
      $or: [
        { sender: req.userId },
        { receiver: req.userId }
      ]
    })
      .populate('sender', 'name role email')
      .populate('receiver', 'name role email')
      .sort({ createdAt: 1 });

    res.json({ success: true, count: messages.length, messages });
  } catch (err) {
    next(err);
  }
};

/**
 * Admin: view all chats (monitoring)
 */
exports.getAllChats = async (req, res, next) => {
  try {
    if (req.userRole !== 'admin') {
      return res.status(403).json({ message: 'Admin access only' });
    }

    const messages = await Message.find()
      .populate('sender', 'name role email')
      .populate('receiver', 'name role email')
      .sort({ createdAt: 1 });

    res.json({ success: true, count: messages.length, messages });
  } catch (err) {
    next(err);
  }
};
