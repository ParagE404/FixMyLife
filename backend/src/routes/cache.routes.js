import express from 'express';
import redisService from '../services/redis.service.js';
import { authenticateUser } from '../middleware/auth.js';

const router = express.Router();

// Get cache statistics (development only)
router.get('/stats', authenticateUser, async (req, res) => {
  try {
    if (process.env.NODE_ENV === 'production') {
      return res.status(403).json({ error: 'Not available in production' });
    }

    const isConnected = await redisService.ping();
    
    if (!isConnected) {
      return res.json({ connected: false });
    }

    // Get Redis info
    const info = await redisService.client.info();
    const keyCount = await redisService.client.dbSize();
    
    // Parse memory info
    const lines = info.split('\r\n');
    const stats = {};
    
    lines.forEach(line => {
      if (line.includes(':')) {
        const [key, value] = line.split(':');
        if (key.includes('memory') || key.includes('keyspace') || key.includes('stats')) {
          stats[key] = value;
        }
      }
    });

    res.json({
      connected: true,
      keyCount,
      stats,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Cache stats error:', error);
    res.status(500).json({ error: 'Failed to get cache stats' });
  }
});

// Clear user cache (development only)
router.delete('/user/:userId', authenticateUser, async (req, res) => {
  try {
    if (process.env.NODE_ENV === 'production') {
      return res.status(403).json({ error: 'Not available in production' });
    }

    const { userId } = req.params;
    
    // Only allow users to clear their own cache (no role checking for now)
    if (req.userId !== userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    await redisService.invalidateUserCache(userId);
    
    res.json({ 
      success: true, 
      message: `Cache cleared for user ${userId}`,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Cache clear error:', error);
    res.status(500).json({ error: 'Failed to clear cache' });
  }
});

// Clear all cache (development only)
router.delete('/all', authenticateUser, async (req, res) => {
  try {
    if (process.env.NODE_ENV === 'production') {
      return res.status(403).json({ error: 'Not available in production' });
    }

    // For development, allow any authenticated user to clear all cache
    // In production, this endpoint is disabled anyway

    await redisService.client.flushDb();
    
    res.json({ 
      success: true, 
      message: 'All cache cleared',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Cache flush error:', error);
    res.status(500).json({ error: 'Failed to clear all cache' });
  }
});

// Get cache keys by pattern (development only)
router.get('/keys/:pattern', authenticateUser, async (req, res) => {
  try {
    if (process.env.NODE_ENV === 'production') {
      return res.status(403).json({ error: 'Not available in production' });
    }

    const { pattern } = req.params;
    const keys = await redisService.client.keys(pattern);
    
    // Get values for first 10 keys to avoid overwhelming response
    const keyData = [];
    for (let i = 0; i < Math.min(keys.length, 10); i++) {
      const key = keys[i];
      try {
        const value = await redisService.get(key);
        const ttl = await redisService.client.ttl(key);
        keyData.push({
          key,
          ttl: ttl === -1 ? 'no expiry' : `${ttl}s`,
          size: JSON.stringify(value).length,
          preview: typeof value === 'object' ? Object.keys(value) : value
        });
      } catch (error) {
        keyData.push({
          key,
          error: 'Failed to read value'
        });
      }
    }
    
    res.json({
      pattern,
      totalKeys: keys.length,
      showing: keyData.length,
      keys: keyData,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Cache keys error:', error);
    res.status(500).json({ error: 'Failed to get cache keys' });
  }
});

export default router;