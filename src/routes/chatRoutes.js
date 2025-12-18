import express from 'express';
import { protect } from '../middleware/auth.js';
import { createOrUpdateChat, getChats, getChatById, deleteChat } from '../controllers/chatController.js';
const router = express.Router();

router.use(protect);

router.post('/', createOrUpdateChat);     // send message
router.get('/', getChats);                // get all chats (policeman) or own chat (user)
router.get('/:id', getChatById);          // get chat by ID
router.delete('/:id', deleteChat);        // delete chat (only policeman)

export default router;
