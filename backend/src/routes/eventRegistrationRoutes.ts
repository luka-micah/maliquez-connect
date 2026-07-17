import { Router } from 'express';
import {
  registerForEvent,
  getEventRegistrations,
  getAllRegistrations,
} from '../controllers/eventRegistrationController.js';
import { authenticate, authorize } from '../middlewares/auth.js';
import { ROLES } from '../constants/roles.js';

const router = Router();

router.post('/', registerForEvent);
router.get('/', authenticate, authorize(ROLES.ADMIN), getAllRegistrations);
router.get('/:eventId', authenticate, authorize(ROLES.ADMIN), getEventRegistrations);

export default router;
