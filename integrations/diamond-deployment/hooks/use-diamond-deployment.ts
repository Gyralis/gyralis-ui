// Diamond Deployment Hook

import { useState, useCallback, useRef } from 'react';
import type {
  DeploymentConfig,
  ValidationResult,
  SimulationResult,
  DeploymentStatus,
  DeploymentProgress,
  UseDiamondDeploymentReturn
} from '../utils/types';
import { diamondApi } from '../client';
import { createErrorMessage, generateDeploymentId, calculateProgress } from '../utils';
import { DEPLOYMENT_STATUSES } from '../utils/constants';

/**
 * Diamond Deployment Management Hook
 * 
 * Manages deployment lifecycle including validation, simulation, and execution.
 * Provides real-time progress tracking and error handling.
 * 
 * @example
 * ```tsx
 * const { deploy, isDeploying, progress, error } = useDiamondDeployment();
 * 
 * const handleDeploy = async () => {
 *   try {
 *     await deploy({
 *       network: 'localhost',
 *       facets: [...],
 *       dryRun: false
 *     });
 *     console.log('Deployment completed!');
 *   } catch (error) {
 *     console.error('Deployment failed:', error);
 *   }
 * };
 * ```
 */
export function useDiamondDeployment(): UseDiamondDeploymentReturn {
  // State management
  const [isDeploying, setIsDeploying] = useState(false);
  const [deploymentId, setDeploymentId] = useState<string | null>(null);
  const [progress, setProgress] = useState<DeploymentProgress | null>(null);
  const [status, setStatus] = useState<DeploymentStatus | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Keep track of current deployment for cleanup
  const currentDeploymentRef = useRef<string | null>(null);
  
  /**
   * Reset all deployment state
   */
  const reset = useCallback(() => {
    setIsDeploying(false);
    setDeploymentId(null);
    setProgress(null);
    setStatus(null);
    setError(null);
    currentDeploymentRef.current = null;
  }, []);
  
  /**
   * Validate deployment configuration
   */
  const validateConfig = useCallback(async (config: DeploymentConfig): Promise<ValidationResult> => {
    try {
      setError(null);
      const result = await diamondApi.validate(config);
      return result;
    } catch (err) {
      const errorMessage = createErrorMessage(err);
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, []);
  
  /**
   * Simulate deployment without executing
   */
  const simulateDeployment = useCallback(async (config: DeploymentConfig): Promise<SimulationResult> => {
    try {
      setError(null);
      const result = await diamondApi.simulate(config);
      return result;
    } catch (err) {
      const errorMessage = createErrorMessage(err);
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, []);
  
  /**
   * Execute standard deployment
   */
  const deploy = useCallback(async (config: DeploymentConfig): Promise<void> => {
    if (isDeploying) {
      throw new Error('Deployment already in progress');
    }
    
    try {
      setIsDeploying(true);
      setError(null);
      
      // Generate deployment ID
      const id = generateDeploymentId();
      setDeploymentId(id);
      currentDeploymentRef.current = id;
      
      // Initial status
      setStatus({
        deploymentId: id,
        status: DEPLOYMENT_STATUSES.PENDING,
        progress: 0,
        message: 'Starting deployment...'
      });
      
      setProgress({
        progress: 0,
        currentStep: 'Initializing deployment...',
        stepsCompleted: 0,
        totalSteps: 0
      });
      
      // Execute deployment
      const result = await diamondApi.deploy(config);
      
      // Update final status
      if (result.success) {
        setStatus({
          deploymentId: id,
          status: DEPLOYMENT_STATUSES.COMPLETED,
          progress: 100,
          message: result.message,
          results: result
        });
        
        setProgress({
          progress: 100,
          currentStep: 'Deployment completed successfully',
          stepsCompleted: 1,
          totalSteps: 1,
        });
      } else {
        throw new Error(result.message || 'Deployment failed');
      }
    } catch (err) {
      const errorMessage = createErrorMessage(err);
      setError(errorMessage);
      
      if (currentDeploymentRef.current) {
        setStatus({
          deploymentId: currentDeploymentRef.current,
          status: DEPLOYMENT_STATUSES.FAILED,
          progress: 0,
          error: errorMessage
        });
      }
      
      throw new Error(errorMessage);
    } finally {
      setIsDeploying(false);
    }
  }, [isDeploying]);
  
  /**
   * Execute real-time deployment with WebSocket updates
   */
  const deployRealtime = useCallback(async (config: DeploymentConfig): Promise<void> => {
    if (isDeploying) {
      throw new Error('Deployment already in progress');
    }
    
    try {
      setIsDeploying(true);
      setError(null);
      
      // Generate deployment ID
      const id = generateDeploymentId();
      setDeploymentId(id);
      currentDeploymentRef.current = id;
      
      // Initial status
      setStatus({
        deploymentId: id,
        status: DEPLOYMENT_STATUSES.PENDING,
        progress: 0,
        message: 'Starting real-time deployment...'
      });
      
      setProgress({
        progress: 0,
        currentStep: 'Connecting to deployment service...',
        stepsCompleted: 0,
        totalSteps: 0
      });
      
      // Execute real-time deployment
      const result = await diamondApi.deployRealtime(config);
      
      if (!result.success) {
        throw new Error(result.message || 'Real-time deployment failed');
      }
      
      // Update deployment ID from backend response
      if (result.deploymentId && result.deploymentId !== id) {
        setDeploymentId(result.deploymentId);
        currentDeploymentRef.current = result.deploymentId;
      }
      
      // Note: Real-time updates will be handled by WebSocket hook
      // This function only initiates the deployment
      setStatus(prev => prev ? {
        ...prev,
        status: DEPLOYMENT_STATUSES.IN_PROGRESS,
        message: 'Real-time deployment initiated. Connect to WebSocket for live updates.'
      } : null);
      
    } catch (err) {
      const errorMessage = createErrorMessage(err);
      setError(errorMessage);
      
      if (currentDeploymentRef.current) {
        setStatus({
          deploymentId: currentDeploymentRef.current,
          status: DEPLOYMENT_STATUSES.FAILED,
          progress: 0,
          error: errorMessage
        });
      }
      
      setIsDeploying(false);
      throw new Error(errorMessage);
    }
  }, [isDeploying]);
  
  /**
   * Get deployment status by ID
   */
  const getStatus = useCallback(async (deploymentId: string): Promise<DeploymentStatus> => {
    try {
      const statusResult = await diamondApi.getStatus(deploymentId);
      setStatus(statusResult);
      return statusResult;
    } catch (err) {
      const errorMessage = createErrorMessage(err);
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, []);
  
  return {
    // State
    isDeploying,
    deploymentId,
    progress,
    status,
    error,
    
    // Actions
    validateConfig,
    simulateDeployment,
    deploy,
    deployRealtime,
    getStatus,
    
    // Utils
    reset,
  };
}

/**
 * Diamond Deployment Hook with automatic WebSocket integration
 * 
 * This variant automatically connects to WebSocket for real-time updates
 * when using deployRealtime(). Requires useDeploymentWebSocket to be used
 * at a higher level in the component tree.
 */
export function useDiamondDeploymentWithWebSocket(): UseDiamondDeploymentReturn {
  const deployment = useDiamondDeployment();
  
  // TODO: Integrate with WebSocket hook when deployRealtime is called
  // This would require context or custom event system to communicate
  // between hooks without tight coupling
  
  return deployment;
}