import express from 'express';
import asyncHandler from 'express-async-handler';
import { postAlertHandler } from "../controllers";

const router = express.Router();

router.post(
    '/alerts', postAlertHandler
);

export default router;
