import { Router } from 'express';
import {
  getPublishedEvents, getAllEvents, getEvent,
  createEvent, updateEvent, deleteEvent,
} from '../controllers/eventController.js';
import { authenticate, authorize } from '../middlewares/auth.js';
import { ROLES } from '../constants/roles.js';

const router = Router();

router.get('/published', getPublishedEvents);
router.get('/', authenticate, authorize(ROLES.ADMIN), getAllEvents);
router.get('/:id', authenticate, authorize(ROLES.ADMIN), getEvent);
router.post('/', authenticate, authorize(ROLES.ADMIN), createEvent);
router.put('/:id', authenticate, authorize(ROLES.ADMIN), updateEvent);
router.delete('/:id', authenticate, authorize(ROLES.ADMIN), deleteEvent);

export default router;
