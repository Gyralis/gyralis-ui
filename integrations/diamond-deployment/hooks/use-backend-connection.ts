// Backend Connection Hook

import { useState, useCallback, useEffect, useRef } from 'react';
import type {
  NetworkInfo,
  UseBackendConnectionReturn
} from '../utils/types';
import { diamondApi } from '../client';
import { createErrorMessage } from '../utils';
import { DIAMOND_DEPLOYMENT_CONFIG } from '../utils/constants';

/**
 * Backend Connection Hook
 * 
 * Manages connection status and communication with the Diamond Deployment backend.
 * Provides connection testing, network configuration, and health monitoring.
 * 
 * @example
 * ```tsx
 * const { connected, networks, testConnection } = useBackendConnection();
 * 
 * useEffect(() => {
 *   if (!connected) {
 *     testConnection();
 *   }
 * }, [connected]);
 * 
 * return (
 *   <div>
 *     Status: {connected ? '🟢 Connected' : '🔴 Disconnected'}
 *     Networks: {Object.keys(networks).length}
 *   </div>
 * );
 * ```
 */
export function useBackendConnection(
  autoConnect: boolean = true,
  pollInterval: number = DIAMOND_DEPLOYMENT_CONFIG.CONNECTION_CHECK_INTERVAL
): UseBackendConnectionReturn {
  // State management
  const [connected, setConnected] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [networks, setNetworks] = useState<Record<string, NetworkInfo>>({});
  
  // Polling ref for cleanup
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const mountedRef = useRef(true);
  
  /**
   * Test backend connection
   */
  const testConnection = useCallback(async (): Promise<boolean> => {
    if (connecting) {
      return connected;
    }
    
    try {
      setConnecting(true);
      setError(null);
      
      const isConnected = await diamondApi.testConnection();
      
      if (mountedRef.current) {
        setConnected(isConnected);
        
        if (isConnected) {
          console.log('✅ Backend connection successful');
        } else {
          console.warn('❌ Backend connection failed');
          setError('Backend connection test failed');
        }
      }
      
      return isConnected;
    } catch (err) {
      const errorMessage = createErrorMessage(err);
      
      if (mountedRef.current) {
        setConnected(false);
        setError(errorMessage);
        console.error('❌ Backend connection error:', errorMessage);
      }
      
      return false;
    } finally {
      if (mountedRef.current) {
        setConnecting(false);
      }
    }
  }, [connecting, connected]);
  
  /**
   * Get supported networks from backend
   */
  const getNetworks = useCallback(async (): Promise<Record<string, NetworkInfo>> => {
    try {
      setError(null);
      
      const networksData = await diamondApi.getNetworks();
      
      if (mountedRef.current) {
        setNetworks(networksData);
        console.log('📡 Networks loaded:', Object.keys(networksData).length);
      }
      
      return networksData;
    } catch (err) {
      const errorMessage = createErrorMessage(err);
      
      if (mountedRef.current) {
        setError(errorMessage);
        console.error('❌ Failed to load networks:', errorMessage);
      }
      
      throw new Error(errorMessage);
    }
  }, []);
  
  /**
   * Refresh connection status and networks
   */
  const refresh = useCallback(async (): Promise<void> => {
    const isConnected = await testConnection();
    
    if (isConnected) {
      try {
        await getNetworks();
      } catch (error) {
        console.warn('Failed to refresh networks:', error);
      }
    }
  }, [testConnection, getNetworks]);
  
  /**
   * Start connection polling
   */
  const startPolling = useCallback(() => {
    if (pollIntervalRef.current || pollInterval <= 0) {
      return;
    }
    
    console.log('🔄 Starting connection polling:', pollInterval + 'ms');
    
    pollIntervalRef.current = setInterval(() => {
      if (mountedRef.current) {
        testConnection().catch(console.warn);
      }
    }, pollInterval);
  }, [pollInterval, testConnection]);
  
  /**
   * Stop connection polling
   */
  const stopPolling = useCallback(() => {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
      console.log('⏹️  Connection polling stopped');
    }
  }, []);
  
  // Auto-connect on mount
  useEffect(() => {
    if (autoConnect) {
      refresh().then(() => {
        if (pollInterval > 0) {
          startPolling();
        }
      });
    }
    
    // Cleanup on unmount
    return () => {
      mountedRef.current = false;
      stopPolling();
    };
  }, [autoConnect, pollInterval, refresh, startPolling, stopPolling]);
  
  // Restart polling when connected status changes
  useEffect(() => {
    if (connected && pollInterval > 0) {
      startPolling();
    } else {
      stopPolling();
    }
  }, [connected, pollInterval, startPolling, stopPolling]);
  
  return {
    // State
    connected,
    connecting,
    error,
    networks,
    
    // Actions
    testConnection,
    getNetworks,
    
    // Utils
    refresh,
  };
}

/**
 * Hook for network selection and validation
 * 
 * Provides utilities for selecting and validating deployment networks
 */
export function useNetworkSelection(networks: Record<string, NetworkInfo>) {
  const [selectedNetwork, setSelectedNetwork] = useState<string>('localhost');
  const [networkError, setNetworkError] = useState<string | null>(null);
  
  /**
   * Validate selected network
   */
  const validateNetwork = useCallback((networkName: string): boolean => {
    const network = networks[networkName];
    
    if (!network) {
      setNetworkError(`Network '${networkName}' not found`);
      return false;
    }
    
    if (!network.supported) {
      setNetworkError(`Network '${networkName}' is not supported`);
      return false;
    }
    
    setNetworkError(null);
    return true;
  }, [networks]);
  
  /**
   * Select network with validation
   */
  const selectNetwork = useCallback((networkName: string): boolean => {
    const isValid = validateNetwork(networkName);
    
    if (isValid) {
      setSelectedNetwork(networkName);
    }
    
    return isValid;
  }, [validateNetwork]);
  
  /**
   * Get network information
   */
  const getNetworkInfo = useCallback((networkName?: string): NetworkInfo | null => {
    const name = networkName || selectedNetwork;
    return networks[name] || null;
  }, [networks, selectedNetwork]);
  
  /**
   * Get supported networks only
   */
  const getSupportedNetworks = useCallback((): Record<string, NetworkInfo> => {
    return Object.fromEntries(
      Object.entries(networks).filter(([_, info]) => info.supported)
    );
  }, [networks]);
  
  return {
    selectedNetwork,
    networkError,
    selectNetwork,
    validateNetwork,
    getNetworkInfo,
    getSupportedNetworks,
    isNetworkSupported: (networkName: string) => networks[networkName]?.supported || false,
  };
}

/**
 * Hook for backend service health monitoring
 * 
 * Monitors various backend services including WebSocket status
 */
export function useBackendHealth() {
  const [webSocketStatus, setWebSocketStatus] = useState<{
    connected: number;
    activeDeployments: number;
    deploymentRooms: Record<string, string[]>;
  } | null>(null);
  const [lastCheck, setLastCheck] = useState<Date | null>(null);
  const [healthError, setHealthError] = useState<string | null>(null);
  
  /**
   * Check WebSocket service health
   */
  const checkWebSocketHealth = useCallback(async () => {
    try {
      setHealthError(null);
      const status = await diamondApi.getWebSocketStatus();
      setWebSocketStatus(status);
      setLastCheck(new Date());
      return status;
    } catch (error) {
      const errorMessage = createErrorMessage(error);
      setHealthError(errorMessage);
      console.error('❌ WebSocket health check failed:', errorMessage);
      throw error;
    }
  }, []);
  
  /**
   * Get overall health summary
   */
  const getHealthSummary = useCallback(() => {
    if (!webSocketStatus) {
      return {
        status: 'unknown',
        message: 'Health status not available'
      };
    }
    
    if (healthError) {
      return {
        status: 'unhealthy',
        message: healthError
      };
    }
    
    return {
      status: 'healthy',
      message: `WebSocket: ${webSocketStatus.connected} connections, ${webSocketStatus.activeDeployments} active deployments`,
      details: webSocketStatus
    };
  }, [webSocketStatus, healthError]);
  
  return {
    webSocketStatus,
    lastCheck,
    healthError,
    checkWebSocketHealth,
    getHealthSummary,
  };
}