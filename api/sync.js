const { createClient } = require('redis');

// Redis clients for pub/sub
let publisher = null;
let subscriber = null;

function getRedisClients() {
  if (!process.env.REDIS_URL) {
    throw new Error('REDIS_URL environment variable is not set');
  }
  
  if (!publisher) {
    publisher = createClient({ url: process.env.REDIS_URL });
    publisher.on('error', (err) => console.error('Redis Publisher Error', err));
  }
  
  if (!subscriber) {
    subscriber = createClient({ url: process.env.REDIS_URL });
    subscriber.on('error', (err) => console.error('Redis Subscriber Error', err));
  }
  
  return { publisher, subscriber };
}

// Store active WebSocket connections
const activeConnections = new Set();

// Initialize Redis connections
async function initializeRedis() {
  const { publisher, subscriber } = getRedisClients();
  if (!publisher.isOpen) {
    await publisher.connect();
  }
  if (!subscriber.isOpen) {
    await subscriber.connect();
  }
  return { publisher, subscriber };
}

// Subscribe to market map updates
async function subscribeToUpdates() {
  const { subscriber } = await initializeRedis();
  
  await subscriber.subscribe('market_maps_updated', (message) => {
    // Broadcast to all connected WebSocket clients
    const data = JSON.parse(message);
    activeConnections.forEach(ws => {
      if (ws.readyState === 1) { // WebSocket.OPEN
        ws.send(JSON.stringify({
          type: 'market_maps_updated',
          data: data
        }));
      }
    });
  });
}

// Initialize subscription when module loads
subscribeToUpdates().catch(console.error);

// WebSocket handler for Vercel
module.exports = async function handler(req, res) {
  if (req.method === 'GET') {
    // For development/testing - return connection info
    res.status(200).json({ 
      message: 'WebSocket sync endpoint ready',
      connections: activeConnections.size 
    });
    return;
  }

  // Handle WebSocket upgrade (this would work with a proper WebSocket server)
  if (req.headers.upgrade === 'websocket') {
    // Note: Vercel doesn't support WebSockets directly
    // This would need to be implemented with a separate WebSocket server
    // For now, we'll use Server-Sent Events as a fallback
    
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Cache-Control'
    });

    // Send initial connection message
    res.write('data: {"type":"connected"}\n\n');

    // Add to active connections (simulated)
    const connectionId = Date.now();
    
    // Set up Redis subscription for this connection
    if (!process.env.REDIS_URL) {
      res.writeHead(500, headers);
      res.end('data: {"error":"Redis not configured"}\n\n');
      return;
    }
    
    const connectionSubscriber = createClient({ 
      url: process.env.REDIS_URL
    });
    
    await connectionSubscriber.connect();
    
    await connectionSubscriber.subscribe('market_maps_updated', (message) => {
      try {
        const data = JSON.parse(message);
        res.write(`data: ${JSON.stringify({
          type: 'market_maps_updated',
          data: data
        })}\n\n`);
      } catch (error) {
        console.error('Error sending SSE message:', error);
      }
    });

    // Handle client disconnect
    req.on('close', async () => {
      try {
        await connectionSubscriber.unsubscribe();
        await connectionSubscriber.quit();
      } catch (error) {
        console.error('Error cleaning up connection:', error);
      }
    });

    // Keep connection alive
    const keepAlive = setInterval(() => {
      res.write('data: {"type":"ping"}\n\n');
    }, 30000);

    req.on('close', () => {
      clearInterval(keepAlive);
    });

    return;
  }

  res.status(405).json({ error: 'Method not allowed' });
} 