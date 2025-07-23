# Deployment Guide

## Environment Variables Setup

### Required Environment Variables

1. **REDIS_URL**: Redis connection string
   ```
   REDIS_URL=redis://username:password@host:port
   ```

2. **VITE_PASSWORD_HASH**: Secure password hash for authentication
   
   **⚠️ IMPORTANT**: Never commit passwords or hashes to version control!

### Setting Up Secure Password

1. **Generate Password Hash**:
   ```bash
   node -e "
   const simpleHash = (str) => {
       let hash = 0;
       for (let i = 0; i < str.length; i++) {
           const char = str.charCodeAt(i);
           hash = ((hash << 5) - hash) + char;
           hash = hash & hash;
       }
       return Math.abs(hash).toString(16);
   };
   console.log('Hash for your_secure_password:', simpleHash('your_secure_password'));
   "
   ```

2. **Set Environment Variable**:
   
   **Local Development**:
   ```bash
   export VITE_PASSWORD_HASH=your_generated_hash
   ```
   
   **Vercel Deployment**:
   - Go to Vercel Project Settings → Environment Variables
   - Add: `VITE_PASSWORD_HASH` = `your_generated_hash`
   - Redeploy the application

### Security Best Practices

- Use a strong, unique password
- Never share the password hash publicly
- Rotate passwords regularly
- Use different passwords for different environments
- Consider implementing server-side authentication for production use

### Vercel Deployment Steps

1. **Fork/Clone Repository**
2. **Connect to Vercel**
3. **Set Environment Variables**:
   - `REDIS_URL`: Your Redis connection string
   - `VITE_PASSWORD_HASH`: Your secure password hash
4. **Deploy**

### Local Development

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Set Environment Variables**:
   ```bash
   export REDIS_URL=your_redis_url
   export VITE_PASSWORD_HASH=your_password_hash
   ```

3. **Start Development Server**:
   ```bash
   npm run dev
   ```

### Environment Variable Management

- **Never** commit `.env` files to version control
- Use `.env.local` for local development (automatically ignored by git)
- Use deployment platform's environment variable system for production
- Document required variables without exposing sensitive values 