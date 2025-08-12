// Diamond Deployment Integration Constants

export const DIAMOND_DEPLOYMENT_CONFIG = {
  // Backend API Configuration
  API_BASE_URL: process.env.NEXT_PUBLIC_DIAMOND_BACKEND_URL || 'http://localhost:3000/api',
  
  // WebSocket Configuration
  WEBSOCKET_URL: process.env.NEXT_PUBLIC_DIAMOND_WEBSOCKET_URL || 'http://localhost:3000',
  WEBSOCKET_PATH: '/deployment-socket/',
  
  // Request Configuration
  REQUEST_TIMEOUT: 30000, // 30 seconds
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000, // 1 second
  
  // WebSocket Configuration
  WEBSOCKET_RECONNECT_ATTEMPTS: 5,
  WEBSOCKET_RECONNECT_DELAY: 2000, // 2 seconds
  
  // Polling intervals
  STATUS_POLL_INTERVAL: 2000, // 2 seconds
  CONNECTION_CHECK_INTERVAL: 30000, // 30 seconds
} as const;

export const API_ENDPOINTS = {
  // Deployment endpoints
  VALIDATE: '/deploy/validate',
  SIMULATE: '/deploy/simulate', 
  EXECUTE: '/deploy/execute',
  REALTIME: '/deploy/realtime',
  STATUS: (id: string) => `/deploy/${id}/status`,
  
  // Configuration endpoints
  NETWORKS: '/deploy/networks',
  WEBSOCKET_STATUS: '/websocket/status',
  
  // Health check
  HEALTH: '/deploy/test',
  
  // Organization endpoints
  ORGANIZATIONS: '/organizations',
  ORGANIZATION: (id: string) => `/organizations/${id}`,
  
  // Pool endpoints (renamed from Loops for clarity)
  POOLS: '/pools',
  POOL: (id: string) => `/pools/${id}`,
  ORGANIZATION_POOLS: (orgId: string) => `/organizations/${orgId}/pools`,
} as const;

export const WEBSOCKET_EVENTS = {
  // Connection events
  CONNECT: 'connect',
  DISCONNECT: 'disconnect',
  CONNECT_ERROR: 'connect_error',
  
  // Client events (emit)
  SUBSCRIBE_DEPLOYMENT: 'subscribe-deployment',
  UNSUBSCRIBE_DEPLOYMENT: 'unsubscribe-deployment',
  CLI_CONNECT: 'cli-connect',
  FRONTEND_CONNECT: 'frontend-connect',
  
  // Server events (listen)
  DEPLOYMENT_STARTED: 'deployment-started',
  DEPLOYMENT_PROGRESS: 'deployment-progress',
  STEP_COMPLETED: 'step-completed',
  DEPLOYMENT_COMPLETED: 'deployment-completed',
  DEPLOYMENT_FAILED: 'deployment-failed',
  SUBSCRIPTION_CONFIRMED: 'subscription-confirmed',
  UNSUBSCRIPTION_CONFIRMED: 'unsubscription-confirmed',
  DEPLOYMENT_STATUS: 'deployment-status',
} as const;

export const DEPLOYMENT_STATUSES = {
  PENDING: 'pending',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  FAILED: 'failed',
} as const;

export const FACET_CATEGORIES = {
  CORE: 'core',
  ACCESS: 'access', 
  BUSINESS: 'business',
  OTHER: 'other',
} as const;

export const NETWORK_NAMES = {
  LOCALHOST: 'localhost',
  SEPOLIA: 'sepolia',
  MAINNET: 'mainnet',
  POLYGON: 'polygon',
  ARBITRUM: 'arbitrum',
  OPTIMISM: 'optimism',
} as const;

export const ERROR_MESSAGES = {
  CONNECTION_FAILED: 'Failed to connect to backend',
  WEBSOCKET_FAILED: 'WebSocket connection failed',
  VALIDATION_FAILED: 'Configuration validation failed',
  SIMULATION_FAILED: 'Deployment simulation failed',
  DEPLOYMENT_FAILED: 'Deployment execution failed',
  NETWORK_ERROR: 'Network request failed',
  TIMEOUT_ERROR: 'Request timeout',
  UNKNOWN_ERROR: 'An unexpected error occurred',
} as const;

export const SUCCESS_MESSAGES = {
  CONNECTION_SUCCESS: 'Backend connection established',
  WEBSOCKET_CONNECTED: 'Real-time updates connected',
  VALIDATION_SUCCESS: 'Configuration validated successfully',
  SIMULATION_SUCCESS: 'Deployment simulation completed',
  DEPLOYMENT_SUCCESS: 'Diamond deployment completed successfully',
} as const;

// Default configurations
export const DEFAULT_DEPLOYMENT_CONFIG = {
  network: NETWORK_NAMES.LOCALHOST,
  gasLimit: 15000000,
  dryRun: true,
} as const;

export const DEFAULT_FACET_ORDER = [
  'DiamondCutFacet',
  'DiamondLoupeFacet',
  'OwnableFacet',
  'AccessControlFacet',
] as const;

// UI Configuration
export const PROGRESS_COLORS = {
  PENDING: '#6b7280', // gray-500
  IN_PROGRESS: '#3b82f6', // blue-500
  COMPLETED: '#10b981', // emerald-500
  FAILED: '#ef4444', // red-500
} as const;

export const STEP_ICONS = {
  DEPLOY_DIAMOND: '💎',
  DEPLOY_FACET: '🔧',
  DIAMOND_CUT: '✂️',
  VALIDATION: '✅',
  SIMULATION: '🧪',
} as const;