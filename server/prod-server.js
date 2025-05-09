// Production server script using the serve package
// This script serves the static build files on the specified port

// Fix for CommonJS module compatibility
// The serve-handler package is a CommonJS module which may not support all module.exports as named exports
// This fixes the "SyntaxError: Named export 'handler' not found" error
// AND ensures handler is the correct function (not undefined)
import pkg from 'serve-handler';
const handler = pkg.default || pkg;

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

// Debug directory contents
console.log('Looking for client files at:', clientDistPath);
console.log('Available directories:');
try {
  const dirs = fs.readdirSync(path.join(__dirname, '..'));
  console.log('Root dir:', dirs);
  if (fs.existsSync(path.join(__dirname, '../dist'))) {
    console.log('Dist dir:', fs.readdirSync(path.join(__dirname, '../dist')));
  }
} catch (err) {
  console.error('Error listing directories:', err);
}

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