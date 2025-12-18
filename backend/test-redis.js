import redisService from './src/services/redis.service.js';

async function testRedis() {
  console.log('🔄 Testing Redis connection...');
  
  try {
    // Connect to Redis
    await redisService.connect();
    
    // Test ping
    const pingResult = await redisService.ping();
    console.log('📡 Ping result:', pingResult);
    
    // Test set/get
    const testKey = 'test:redis:connection';
    const testValue = { message: 'Hello Redis!', timestamp: new Date().toISOString() };
    
    console.log('💾 Setting test value...');
    await redisService.set(testKey, testValue, 60);
    
    console.log('📦 Getting test value...');
    const retrieved = await redisService.get(testKey);
    console.log('Retrieved:', retrieved);
    
    // Test cache key generation
    console.log('🔑 Testing cache key generation...');
    const analyticsKey = redisService.getAnalyticsKey('user123', 'weekly');
    console.log('Analytics key:', analyticsKey);
    
    const llmKey = redisService.getLLMKey('test input', ['category1', 'category2']);
    console.log('LLM key:', llmKey);
    
    // Test pattern deletion
    console.log('🗑️ Testing pattern deletion...');
    await redisService.set('test:user123:data1', { data: 1 }, 60);
    await redisService.set('test:user123:data2', { data: 2 }, 60);
    await redisService.set('test:user456:data1', { data: 3 }, 60);
    
    console.log('Deleting test:user123:* pattern...');
    await redisService.deletePattern('test:user123:*');
    
    const data1 = await redisService.get('test:user123:data1');
    const data2 = await redisService.get('test:user123:data2');
    const data3 = await redisService.get('test:user456:data1');
    
    console.log('After pattern deletion:');
    console.log('- test:user123:data1:', data1); // Should be null
    console.log('- test:user123:data2:', data2); // Should be null
    console.log('- test:user456:data1:', data3); // Should still exist
    
    // Cleanup
    await redisService.del(testKey);
    await redisService.del('test:user456:data1');
    
    console.log('✅ Redis test completed successfully!');
    
  } catch (error) {
    console.error('❌ Redis test failed:', error);
  } finally {
    await redisService.disconnect();
    process.exit(0);
  }
}

testRedis();