# Market Map Creator

A collaborative market mapping tool with persistent Redis storage and real-time synchronization.

## Features

- **Persistent Storage**: All data is stored in Redis and persists across sessions
- **Real-time Collaboration**: Multiple users can collaborate simultaneously with live updates
- **Multiple Views**: Switch between Kanban and Matrix views
- **Market Map Management**: Create, edit, and delete market maps with confirmation dialogs
- **Export/Import**: Export and import market map data as JSON or Excel files
- **Responsive Design**: Works on desktop and mobile devices

## Architecture

### Frontend
- React 19 with TypeScript
- Vite for development and building
- CSS with custom properties for theming

### Backend
- Vercel serverless functions
- Redis for persistent storage and pub/sub
- Server-Sent Events for real-time updates

### Storage Schema
```javascript
{
  "market_maps": {
    "map_id": {
      "id": "string",
      "name": "string", 
      "categories": ["string"],
      "firms": [
        {
          "id": "string",
          "name": "string",
          "category": "string",
          "subcategory": "string",
          "product": "string?" // optional
        }
      ]
    }
  }
}
```

## Environment Variables

The following environment variables are required:

- `REDIS_URL`: Redis connection string (format: `redis://username:password@host:port`)

## API Endpoints

### `/api/data`
- **GET**: Retrieve all market maps
- **POST/PUT**: Save market maps data

### `/api/sync`
- **GET**: Server-Sent Events endpoint for real-time updates

## Security Features

- Rate limiting (100 requests per minute per IP)
- Input validation and sanitization
- CORS headers configured
- String length limits to prevent abuse

## Development

### Prerequisites
- Node.js 18+
- Redis instance (local or hosted)

### Setup
1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set environment variables:
   ```bash
   export REDIS_URL="redis://username:password@host:port"
   ```
4. Start development server:
   ```bash
   npm run dev
   ```

### Building
```bash
npm run build
```

## Deployment

### Vercel Deployment
1. Connect your repository to Vercel
2. Set the `REDIS_URL` environment variable in Vercel dashboard
3. Deploy

The app is configured with `vercel.json` for optimal serverless function settings.

### Redis Setup
This app works with any Redis-compatible service:
- Redis Cloud
- AWS ElastiCache
- Google Cloud Memorystore
- Self-hosted Redis

## Usage

### Creating Market Maps
1. Click "Add Map" to create a new market map
2. Enter a name for your market map
3. Add categories (buckets) using the "+ Add Bucket" button
4. Add firms to categories using the "Add New Firm" form

### Managing Market Maps
- **Edit Map Name**: Click the ⋮ button on any map tab or right-click the tab, then select "Edit Name"
- **Delete Map**: Click the ⋮ button on any map tab or right-click the tab, then select "Delete Map"
  - You'll be prompted with a warning showing what will be deleted
  - Final confirmation requires typing the exact map name
  - This action cannot be undone

### Real-time Collaboration
- Changes made by any user are automatically synced to all other users
- The sync indicator shows when data is being saved
- Uses Server-Sent Events for live updates

### Data Persistence
- All changes are automatically saved to Redis
- Data persists across browser sessions and page refreshes
- Multiple users see the same shared dataset

### Excel Import
- **Supported Formats**: .xlsx and .xls files
- **Template Structure**: 
  - Column A: Firm Name (required)
  - Column B: Description (optional)
- **Import Process**:
  1. Click "Import Data" and select an Excel file
  2. Review the checklist of detected firms
  3. Select/deselect firms to import
  4. Edit each firm's details (Category, Subcategory, Product)
  5. Complete the import with validation

## Testing Multi-user Functionality

To test the collaborative features:

1. Open the app in multiple browser windows/tabs
2. Make changes in one window (add/edit/delete firms)
3. Observe real-time updates in other windows
4. Refresh pages to verify persistence

## Troubleshooting

### Common Issues

**Data not persisting:**
- Check Redis connection string
- Verify Redis server is running
- Check browser console for API errors

**Real-time sync not working:**
- Check if Server-Sent Events are supported
- Verify network connectivity
- Falls back to polling if SSE fails

**Rate limiting errors:**
- Wait a minute before making more requests
- Check if multiple users are sharing the same IP

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

Apache-2.0 License
