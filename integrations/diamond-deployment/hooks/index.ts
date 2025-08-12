// Diamond Deployment Hooks - Main Export

// Main deployment management
export { 
  useDiamondDeployment, 
  useDiamondDeploymentWithWebSocket 
} from './use-diamond-deployment';

// Real-time WebSocket integration
export { 
  useDeploymentWebSocket,
  useDeploymentWebSocketTracking 
} from './use-deployment-websocket';

// Contract discovery and scanning  
export { 
  useContractDiscovery,
  useAutoContractDiscovery,
  useFacetSelection 
} from './use-contract-discovery';

// Backend connection and health
export { 
  useBackendConnection,
  useNetworkSelection,
  useBackendHealth 
} from './use-backend-connection';

// Organization management
export {
  useOrganization,
  useOrganizationSelection,
  useAutoOrganization
} from './use-organization';

// Pool/Loop management
export {
  usePool,
  usePoolSelection,
  useOrganizationPools,
  useAutoPools,
  useOrganizationWithPools
} from './use-pool';

// Re-export types for convenience
export type {
  UseDiamondDeploymentReturn,
  UseDeploymentWebSocketReturn,
  UseContractDiscoveryReturn,
  UseBackendConnectionReturn,
  UseOrganizationReturn,
  UsePoolReturn
} from '../utils/types';