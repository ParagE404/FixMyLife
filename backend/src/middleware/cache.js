import redisService from '../services/redis.service.js';

// Generic cache middleware
export const cacheMiddleware = (keyGenerator, ttl = 3600) => {
  return async (req, res, next) => {
    try {
      // Generate cache key based on request
      const cacheKey = keyGenerator(req);
      
      // Try to get from cache
      const cached = await redisService.get(cacheKey);
      
      if (cached) {
        console.log(`📦 Cache hit for key: ${cacheKey}`);
        return res.json(cached);
      }
      
      // Store original res.json to intercept response
      const originalJson = res.json;
      
      res.json = function(data) {
        // Cache the response data
        redisService.set(cacheKey, data, ttl).catch(err => {
          console.error('Cache set error:', err);
        });
        
        console.log(`💾 Cached response for key: ${cacheKey}`);
        
        // Call original json method
        return originalJson.call(this, data);
      };
      
      next();
    } catch (error) {
      console.error('Cache middleware error:', error);
      // Continue without caching on error
      next();
    }
  };
};

// Specific cache key generators
export const analyticsKeyGenerator = (req) => {
  const userId = req.user?.id || req.params.userId;
  const endpoint = req.route.path;
  const query = JSON.stringify(req.query);
  return `analytics:${userId}:${endpoint}:${redisService.hashString(query)}`;
};

export const goalsKeyGenerator = (req) => {
  const userId = req.user?.id || req.params.userId;
  const query = JSON.stringify(req.query);
  return `goals:${userId}:${redisService.hashString(query)}`;
};

export const activitiesKeyGenerator = (req) => {
  const userId = req.user?.id || req.params.userId;
  const query = JSON.stringify(req.query);
  return `activities:${userId}:${redisService.hashString(query)}`;
};

// Cache invalidation middleware for POST/PUT/DELETE requests
export const invalidateUserCache = async (req, res, next) => {
  try {
    const userId = req.user?.id || req.params.userId;
    
    if (userId) {
      // Store original methods
      const originalJson = res.json;
      const originalSend = res.send;
      
      // Override response methods to invalidate cache after successful operations
      const invalidateAndRespond = (originalMethod) => {
        return function(data) {
          // Only invalidate on successful responses (2xx status codes)
          if (res.statusCode >= 200 && res.statusCode < 300) {
            redisService.invalidateUserCache(userId).catch(err => {
              console.error('Cache invalidation error:', err);
            });
            console.log(`🗑️ Cache invalidated for user: ${userId}`);
          }
          
          return originalMethod.call(this, data);
        };
      };
      
      res.json = invalidateAndRespond(originalJson);
      res.send = invalidateAndRespond(originalSend);
    }
    
    next();
  } catch (error) {
    console.error('Cache invalidation middleware error:', error);
    next();
  }
};