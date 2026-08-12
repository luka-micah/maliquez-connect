import { Router } from 'express';
import {
  getPublishedEvents, getAllEvents, getEvent,
  createEvent, updateEvent, deleteEvent,
} from '../controllers/eventController.js';
import { authenticate, authorize } from '../middlewares/auth.js';
import { uploadSingleImage } from '../middlewares/upload.js';
import { ROLES } from '../constants/roles.js';

const router = Router();

router.get('/published', getPublishedEvents);
router.get('/', authenticate, authorize(ROLES.ADMIN, ROLES.SUPER_ADMIN), getAllEvents);
router.get('/:id', authenticate, authorize(ROLES.ADMIN, ROLES.SUPER_ADMIN), getEvent);
router.post('/', authenticate, authorize(ROLES.ADMIN, ROLES.SUPER_ADMIN), uploadSingleImage, createEvent);
router.put('/:id', authenticate, authorize(ROLES.ADMIN, ROLES.SUPER_ADMIN), uploadSingleImage, updateEvent);
router.delete('/:id', authenticate, authorize(ROLES.ADMIN, ROLES.SUPER_ADMIN), deleteEvent);

export default router;
