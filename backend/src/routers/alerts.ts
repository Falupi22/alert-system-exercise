import express from 'express';
import asyncHandler from "express-async-handler"

const router = express.Router();

router.post('/alerts', asyncHandler(async (req, res) => {
    // Mock implementation
    const mockAlert = {
        id: 1,
        message: "This is a mock alert",
        timestamp: new Date().toISOString()
    };

    res.status(201).json(mockAlert);
}));

export default router;