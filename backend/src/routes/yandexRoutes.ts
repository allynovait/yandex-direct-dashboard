
import { Router } from 'express';
import { getStats, getAccounts, getStatus } from '../controllers/yandexController';

const router = Router();

router.post('/stats', getStats);
router.get('/accounts', getAccounts);
router.get('/status', getStatus);

export default router;
