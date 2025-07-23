// Lazy load Redis to avoid build-time issues
let redis = null;
let redisModule = null;

async function getRedisClient() {
  if (!process.env.REDIS_URL) {
    throw new Error('REDIS_URL environment variable is not set');
  }
  
  if (!redisModule) {
    // Dynamically import Redis only when needed
    redisModule = require('redis');
  }
  
  if (!redis) {
    redis = redisModule.createClient({ 
      url: process.env.REDIS_URL
    });
    redis.on('error', (err) => console.error('Redis Client Error', err));
  }
  return redis;
}

const MARKET_MAPS_KEY = 'market_maps';

// Simple in-memory rate limiting (for basic protection)
const rateLimitMap = new Map();
const RATE_LIMIT_WINDOW = 60000; // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 100; // Max requests per window

function checkRateLimit(clientId) {
  const now = Date.now();
  const clientData = rateLimitMap.get(clientId) || { count: 0, resetTime: now + RATE_LIMIT_WINDOW };
  
  if (now > clientData.resetTime) {
    // Reset the window
    clientData.count = 1;
    clientData.resetTime = now + RATE_LIMIT_WINDOW;
  } else {
    clientData.count++;
  }
  
  rateLimitMap.set(clientId, clientData);
  
  return clientData.count <= RATE_LIMIT_MAX_REQUESTS;
}

// Clean up old rate limit entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [clientId, data] of rateLimitMap.entries()) {
    if (now > data.resetTime) {
      rateLimitMap.delete(clientId);
    }
  }
}, RATE_LIMIT_WINDOW);

// Default data if Redis is empty
const initialMarketMapData = {
  'CUAS': {
    id: 'CUAS',
    name: 'CUAS',
    categories: ['Sensing', 'Deciding', 'Effecting'],
    firms: [
      // Sensing
      { id: 's1', name: 'Chaos Industries', category: 'Sensing', subcategory: 'Radar' },
      { id: 's2', name: 'Fortem Technologies', category: 'Sensing', subcategory: 'Radar' },
      { id: 's3', name: 'Hidden Level', category: 'Sensing', subcategory: 'Radar' },
      { id: 's4', name: 'MatrixSpace', category: 'Sensing', subcategory: 'Radar' },
      { id: 's5', name: 'BLUEiQ', category: 'Sensing', subcategory: 'Acoustic' },
      { id: 's6', name: 'Sky Fortress', category: 'Sensing', subcategory: 'Acoustic' },
      { id: 's7', name: 'Squarehead Technology', category: 'Sensing', subcategory: 'Acoustic' },
      { id: 's8', name: 'Enigma', category: 'Sensing', subcategory: 'Crowdsourcing' },
      // Deciding
      { id: 'd1', name: 'Project Jeff Maas (DZYNE)', category: 'Deciding', subcategory: 'Fire Control' },
      { id: 'd2', name: 'SmartShooter', category: 'Deciding', subcategory: 'Fire Control' },
      { id: 'd3', name: 'ZeroMark', category: 'Deciding', subcategory: 'Fire Control' },
      { id: 'd4', name: 'Anduril Lattice', category: 'Deciding', subcategory: 'C2' },
      { id: 'd5', name: 'Dedrone', category: 'Deciding', subcategory: 'C2' },
      { id: 'd6', name: 'Northrop Grumman', category: 'Deciding', subcategory: 'C2', product: 'FAAD C2' },
      { id: 'd7', name: 'Palantir Maven Smart System', category: 'Deciding', subcategory: 'C2' },
      // Effecting
      { id: 'e1', name: 'Thor Dynamics', category: 'Effecting', subcategory: 'Laser' },
      { id: 'e2', name: 'Anduril Pulsar', category: 'Effecting', subcategory: 'Electronic Attack (jamming)' },
      { id: 'e3', name: 'DZYNE', category: 'Effecting', subcategory: 'Electronic Attack (jamming)', product: 'Dronebuster' },
      { id: 'e4', name: 'Epirus', category: 'Effecting', subcategory: 'HPM (High Power Microwave)', product: 'Leonidas' },
      { id: 'e5', name: 'Project Brendan Nunan (PSI)', category: 'Effecting', subcategory: 'HPM (High Power Microwave)' },
      { id: 'e6', name: 'Hondoq', category: 'Effecting', subcategory: 'EMP (Electro-Magnetic Pulse)' },
      { id: 'e7', name: 'D-fend Solutions', category: 'Effecting', subcategory: 'Cyber' },
    ]
  }
};

// Get all market maps from Redis
async function getMarketMaps() {
  try {
    const redis = await getRedisClient();
    if (!redis.isOpen) {
      await redis.connect();
    }
    const data = await redis.get(MARKET_MAPS_KEY);
    if (data) {
      return JSON.parse(data);
    } else {
      // Initialize with default data if Redis is empty
      await setMarketMaps(initialMarketMapData);
      return initialMarketMapData;
    }
  } catch (error) {
    console.error('Error getting market maps from Redis:', error);
    return initialMarketMapData;
  }
}

// Set all market maps in Redis
async function setMarketMaps(marketMaps) {
  try {
    const redis = await getRedisClient();
    if (!redis.isOpen) {
      await redis.connect();
    }
    await redis.set(MARKET_MAPS_KEY, JSON.stringify(marketMaps));
    // Publish update notification for real-time sync
    await redis.publish('market_maps_updated', JSON.stringify(marketMaps));
  } catch (error) {
    console.error('Error setting market maps in Redis:', error);
    throw error;
  }
}

// Handle HTTP requests
module.exports = async function handler(req, res) {
  // Get client IP for rate limiting
  const clientId = req.headers['x-forwarded-for'] || req.connection.remoteAddress || 'unknown';
  
  // Check rate limit
  if (!checkRateLimit(clientId)) {
    res.status(429).json({ error: 'Too many requests. Please try again later.' });
    return;
  }

  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    if (req.method === 'GET') {
      const marketMaps = await getMarketMaps();
      res.status(200).json(marketMaps);
      return;
    }

    if (req.method === 'POST' || req.method === 'PUT') {
      const marketMaps = req.body;
      
      // Basic validation
      if (!marketMaps || typeof marketMaps !== 'object') {
        res.status(400).json({ error: 'Invalid data format' });
        return;
      }
      
      // Validate structure
      for (const [mapId, map] of Object.entries(marketMaps)) {
        if (!map.id || !map.name || !Array.isArray(map.categories) || !Array.isArray(map.firms)) {
          res.status(400).json({ error: 'Invalid market map structure' });
          return;
        }
        
        // Validate firms
        for (const firm of map.firms) {
          if (!firm.id || !firm.name || !firm.category || !firm.subcategory) {
            res.status(400).json({ error: 'Invalid firm structure' });
            return;
          }
          
          // Sanitize strings
          firm.name = firm.name.toString().trim().substring(0, 200);
          firm.category = firm.category.toString().trim().substring(0, 100);
          firm.subcategory = firm.subcategory.toString().trim().substring(0, 100);
          if (firm.product) {
            firm.product = firm.product.toString().trim().substring(0, 200);
          }
        }
        
        // Sanitize map data
        map.name = map.name.toString().trim().substring(0, 100);
        map.categories = map.categories.map(cat => cat.toString().trim().substring(0, 100));
      }
      
      await setMarketMaps(marketMaps);
      res.status(200).json({ success: true });
      return;
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
} 