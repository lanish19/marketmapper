# Deployment Guide - Market Map Creator with Redis

## Overview
This guide covers deploying the Market Map Creator with Redis persistent storage to Vercel.

## Prerequisites
- Vercel account
- Redis instance (Redis Cloud recommended)
- GitHub repository with your code

## Step 1: Redis Setup

### Option A: Redis Cloud (Recommended)
1. Go to [Redis Cloud](https://redis.com/try-free/)
2. Sign up for a free account
3. Create a new database
4. Note down the connection string (format: `redis://username:password@host:port`)

### Option B: Other Redis Providers
- **AWS ElastiCache**: Follow AWS documentation to create a Redis cluster
- **Google Cloud Memorystore**: Create a Redis instance in GCP
- **Self-hosted**: Set up Redis on your own server

## Step 2: Vercel Deployment

### 2.1 Connect Repository
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "New Project"
3. Import your GitHub repository
4. Vercel will auto-detect it as a Vite project

### 2.2 Configure Environment Variables
1. In the Vercel project settings, go to "Environment Variables"
2. Add the following variable:
   - **Name**: `REDIS_URL`
   - **Value**: Your Redis connection string
   - **Environment**: Production, Preview, Development (select all)

### 2.3 Deploy
1. Click "Deploy"
2. Wait for the build to complete (~2-3 minutes)
3. Your app will be live at `https://your-project-name.vercel.app`

## Step 3: Verification

### 3.1 Test Basic Functionality
1. Visit your deployed URL
2. Create a new market map
3. Add some firms
4. Refresh the page to verify data persists

### 3.2 Test Multi-user Collaboration
1. Open the app in multiple browser windows/incognito tabs
2. Make changes in one window
3. Verify changes appear in other windows within ~30 seconds
4. Test with different devices/networks if possible

## Step 4: Domain Setup (Optional)

### Custom Domain
1. In Vercel project settings, go to "Domains"
2. Add your custom domain
3. Follow Vercel's DNS configuration instructions

## Configuration Files Explained

### `vercel.json`
```json
{
  "functions": {
    "api/data.js": { "maxDuration": 30 },
    "api/sync.js": { "maxDuration": 300 }
  },
  "env": {
    "REDIS_URL": "@redis_url"
  }
}
```
- Sets function timeouts for API endpoints
- References environment variables

### API Structure
```
/api/data.js    - CRUD operations for market maps
/api/sync.js    - Server-Sent Events for real-time sync
```

## Monitoring and Maintenance

### Vercel Analytics
- Enable Vercel Analytics in project settings
- Monitor usage and performance

### Redis Monitoring
- Check Redis Cloud dashboard for connection stats
- Monitor memory usage and performance

### Error Monitoring
- Check Vercel function logs for errors
- Monitor browser console for client-side issues

## Troubleshooting

### Common Deployment Issues

**Build Failures:**
```bash
# Test locally first
npm install
npm run build
```

**Redis Connection Issues:**
- Verify Redis URL format: `redis://username:password@host:port`
- Check Redis instance is running and accessible
- Verify environment variable is set correctly in Vercel

**API Timeouts:**
- Check Vercel function logs
- Verify Redis connection isn't timing out
- Consider increasing function timeout limits

**Real-time Sync Not Working:**
- Server-Sent Events may be blocked by some networks
- App falls back to polling automatically
- Check browser console for connection errors

### Performance Optimization

**Redis Optimization:**
- Use Redis connection pooling for high traffic
- Consider Redis Cluster for scalability
- Monitor memory usage and set appropriate limits

**Vercel Optimization:**
- Enable Edge Functions if needed
- Use Vercel Analytics to identify bottlenecks
- Consider upgrading Vercel plan for higher limits

## Security Considerations

### Rate Limiting
The app includes basic rate limiting (100 requests/minute per IP). For production:
- Consider implementing more sophisticated rate limiting
- Use Vercel's Edge Middleware for additional protection
- Monitor for abuse patterns

### Data Validation
- All input is validated and sanitized
- String lengths are limited to prevent abuse
- Consider adding authentication for sensitive data

### CORS Configuration
- Currently allows all origins (`*`)
- Consider restricting to specific domains in production

## Scaling Considerations

### High Traffic
- Redis Cloud scales automatically
- Vercel functions scale automatically
- Monitor usage and upgrade plans as needed

### Data Growth
- Monitor Redis memory usage
- Implement data archival if needed
- Consider data compression for large datasets

## Backup and Recovery

### Redis Backups
- Redis Cloud provides automatic backups
- Export data regularly using the app's export feature
- Store backup files in secure location

### Code Backups
- Keep GitHub repository updated
- Tag releases for easy rollback
- Document configuration changes

## Support

For issues:
1. Check Vercel function logs
2. Check Redis Cloud monitoring
3. Review browser console errors
4. Test with minimal data set
5. Contact support if needed

Your Market Map Creator should now be fully deployed with persistent Redis storage and real-time collaboration features! 