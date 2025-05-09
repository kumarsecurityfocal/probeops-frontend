import { log } from './vite';
import fs from 'fs';
import path from 'path';
import { promisify } from 'util';

const writeFileAsync = promisify(fs.writeFile);
const appendFileAsync = promisify(fs.appendFile);
const mkdirAsync = promisify(fs.mkdir);

const LOG_DIR = 'logs';
const PROXY_LOG_FILE = path.join(LOG_DIR, 'proxy.log');

// Ensure the logs directory exists
async function ensureLogDir() {
  try {
    if (!fs.existsSync(LOG_DIR)) {
      await mkdirAsync(LOG_DIR, { recursive: true });
      log(`Created log directory: ${LOG_DIR}`, 'proxy-logger');
    }
  } catch (error) {
    log(`Failed to create log directory: ${(error as Error).message}`, 'proxy-logger');
  }
}

// Initialize the log file
export async function initProxyLog() {
  await ensureLogDir();
  
  try {
    const header = `=== ProbeOps API Proxy Log - Started at ${new Date().toISOString()} ===\n\n`;
    await writeFileAsync(PROXY_LOG_FILE, header);
    log(`Initialized proxy log at ${PROXY_LOG_FILE}`, 'proxy-logger');
  } catch (error) {
    log(`Failed to initialize proxy log: ${(error as Error).message}`, 'proxy-logger');
  }
}

// Log a proxy request
export async function logProxyRequest(method: string, path: string, target: string) {
  try {
    const logEntry = `[${new Date().toISOString()}] ${method} ${path} -> ${target}\n`;
    await appendFileAsync(PROXY_LOG_FILE, logEntry);
  } catch (error) {
    log(`Failed to write to proxy log: ${(error as Error).message}`, 'proxy-logger');
  }
}

// Log a proxy error
export async function logProxyError(message: string, error?: Error) {
  try {
    const errorMessage = error ? `${message}: ${error.message}` : message;
    const logEntry = `[${new Date().toISOString()}] ERROR: ${errorMessage}\n`;
    await appendFileAsync(PROXY_LOG_FILE, logEntry);
    log(`Proxy error: ${errorMessage}`, 'proxy-logger');
  } catch (error) {
    log(`Failed to write error to proxy log: ${(error as Error).message}`, 'proxy-logger');
  }
}

// Get recent proxy logs
export async function getRecentProxyLogs(lines: number = 50): Promise<string[]> {
  try {
    if (!fs.existsSync(PROXY_LOG_FILE)) {
      return ['No proxy logs available'];
    }
    
    // Read the log file
    const data = fs.readFileSync(PROXY_LOG_FILE, 'utf8');
    const allLines = data.split('\n');
    
    // Return the most recent lines
    return allLines.slice(-lines);
  } catch (error) {
    log(`Failed to read proxy logs: ${(error as Error).message}`, 'proxy-logger');
    return [`Error reading proxy logs: ${(error as Error).message}`];
  }
}