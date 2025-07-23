// Simple test function to verify Vercel deployment
module.exports = async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'GET') {
    return res.status(200).json({ 
      message: 'Test API is working!', 
      timestamp: new Date().toISOString(),
      env: process.env.NODE_ENV 
    });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}; 