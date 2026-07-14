import { Router } from 'express';
import { authenticate } from '../middlewares/auth.js';
import {
  createConversation,
  getConversations,
  getConversation,
  getMessages,
  markConversationRead,
} from '../controllers/chatController.js';

const router = Router();

router.post('/', authenticate, createConversation);
router.get('/', authenticate, getConversations);
router.get('/:id', authenticate, getConversation);
router.get('/:id/messages', authenticate, getMessages);
router.put('/:id/read', authenticate, markConversationRead);

export default router;
