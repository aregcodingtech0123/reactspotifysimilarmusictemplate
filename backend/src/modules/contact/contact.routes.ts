/**
 * Contact routes: POST /api/contact (public, optional Bearer token).
 */
import { Router } from 'express';
import { contactSubmit } from './contact.controller';

const router = Router();

router.post('/', contactSubmit);

export const contactRoutes = router;
