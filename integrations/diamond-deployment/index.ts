// Diamond Deployment Integration - Main Export

// Client and API
export { DiamondDeploymentClient, diamondClient, diamondApi, createDiamondClient } from './client';

// Hooks
export * from './hooks';

// Utils and types
export * from './utils/types';
export * from './utils/constants';
export * from './utils';

// Default export for convenience
export { useDiamondDeployment as default } from './hooks/use-diamond-deployment';