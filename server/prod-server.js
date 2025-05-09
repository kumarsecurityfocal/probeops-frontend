// Production server script using the serve package
// This script serves the static build files on the specified port

import { handler } from 'serve-handler';
import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get directory name in ESM
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Get port from environment variables or use 3000 as default
const PORT = process.env.PORT || 3000;

// Path to the built client files
const clientDistPath = path.join(__dirname, '../dist/client');

// Make sure the directory exists
if (!fs.existsSync(clientDistPath)) {
  console.error(`Error: Build directory ${clientDistPath} does not exist!`);
  console.error('Please run "npm run build" before starting the production server.');
  process.exit(1);
}

// Create the server
const server = http.createServer((request, response) => {
  // You can define custom handlers here if needed
  return handler(request, response, {
    public: clientDistPath,
    rewrites: [
      { source: '/**', destination: '/index.html' }
    ]
  });
});

// Start the server
server.listen(PORT, () => {
  console.log(`Production server running at http://localhost:${PORT}`);
  console.log(`Serving static files from: ${clientDistPath}`);
  console.log(`To use a different port, set the PORT environment variable (e.g., PORT=4000 node server/prod-server.js)`);
});