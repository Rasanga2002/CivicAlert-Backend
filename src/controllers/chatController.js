import asyncHandler from 'express-async-handler';
import Chat from '../models/Chat.js';
import User from '../models/User.js';




// @desc Create or update a chat message
// @route POST /api/chat
// @access Private (user or policeman)
export const createOrUpdateChat = asyncHandler(async (req, res) => {
  const { text, chatId, userId } = req.body;

  if (!text) {
    res.status(400);
    throw new Error('Message text is required');
  }

  let chat;

  if (req.user.role === 'user') {
    // Users can only send messages to their own chat
    chat = await Chat.findOne({ user: req.user._id });

    const message = { sender: 'user', text };

    if (!chat) {
      chat = await Chat.create({ user: req.user._id, messages: [message] });
    } else {
      chat.messages.push(message);
      await chat.save();
    }
  } else if (req.user.role === 'policeman') {
    // Policemen must provide chatId to reply
    if (!chatId) {
      res.status(400);
      throw new Error('chatId is required for policeman to send message');
    }

    chat = await Chat.findById(chatId);
    if (!chat) {
      res.status(404);
      throw new Error('Chat not found');
    }

    const message = { sender: 'policeman', text };
    chat.messages.push(message);
    await chat.save();
  }

  res.status(201).json({ success: true, data: chat });
});

// @desc Get all chats (for policeman) or user's chat (for user)
// @route GET /api/chat
// @access Private
export const getChats = asyncHandler(async (req, res) => {
  if (req.user.role === 'policeman') {
    const chats = await Chat.find()
      .populate('user', 'name email role')
      .sort({ createdAt: -1 });
    res.json({ success: true, data: chats });
  } else {
    const chat = await Chat.findOne({ user: req.user._id });
    res.json({ success: true, data: chat ? [chat] : [] });
  }
});

// @desc Get chat by ID
// @route GET /api/chat/:id
// @access Private
export const getChatById = asyncHandler(async (req, res) => {
  const chat = await Chat.findById(req.params.id).populate('user', 'name email role');

  if (!chat) {
    res.status(404);
    throw new Error('Chat not found');
  }

  res.json({ success: true, data: chat });
});

// @desc Delete a chat by ID (policeman only)
// @route DELETE /api/chat/:id
// @access Private (policeman)
export const deleteChat = asyncHandler(async (req, res) => {
  if (req.user.role !== 'policeman') {
    res.status(403);
    throw new Error('Only policemen can delete chats');
  }

  const chat = await Chat.findById(req.params.id);
  if (!chat) {
    res.status(404);
    throw new Error('Chat not found');
  }

  await chat.deleteOne();
  res.json({ success: true, message: 'Chat deleted successfully' });
});

