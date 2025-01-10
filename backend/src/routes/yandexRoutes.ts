import { Router } from 'express';
import { getStats, getAccounts } from '../controllers/yandexController';

const router = Router();

router.post('/stats', getStats);
router.get('/accounts', getAccounts);

export default router;