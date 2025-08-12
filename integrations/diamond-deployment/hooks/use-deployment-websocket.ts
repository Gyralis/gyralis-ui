// Diamond Deployment WebSocket Hook

import { useState, useEffect, useCallback, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import type {
  WebSocketEvent,
  UseDeploymentWebSocketReturn
} from '../utils/types';
import { 
  DIAMOND_DEPLOYMENT_CONFIG, 
  WEBSOCKET_EVENTS, 
  ERROR_MESSAGES 
} from '../utils/constants';
import { createErrorMessage, parseWebSocketEvent, filterEventsByDeployment } from '../utils';

/**
 * Diamond Deployment WebSocket Hook
 * 
 * Manages real-time WebSocket connection for deployment updates.
 * Handles connection lifecycle, event subscription, and message parsing.
 * 
 * @example
 * ```tsx
 * const { 
 *   connected, 
 *   subscribeToDeployment, 
 *   deploymentEvents 
 * } = useDeploymentWebSocket();
 * 
 * useEffect(() => {
 *   if (deploymentId && connected) {
 *     subscribeToDeployment(deploymentId);
 *   }
 * }, [deploymentId, connected]);
 * 
 * // Filter events for specific deployment
 * const myDeploymentEvents = deploymentEvents.filter(
 *   event => event.deploymentId === myDeploymentId
 * );
 * ```
 */
export function useDeploymentWebSocket(
  autoConnect: boolean = true,
  customUrl?: string
): UseDeploymentWebSocketReturn {
  // State management
  const [connected, setConnected] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [deploymentEvents, setDeploymentEvents] = useState<WebSocketEvent[]>([]);
  const [activeDeployments, setActiveDeployments] = useState<string[]>([]);
  
  // Socket instance ref
  const socketRef = useRef<Socket | null>(null);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = DIAMOND_DEPLOYMENT_CONFIG.WEBSOCKET_RECONNECT_ATTEMPTS;
  
  /**
   * Initialize WebSocket connection
   */
  const connect = useCallback(() => {
    if (socketRef.current?.connected) {
      console.warn('WebSocket already connected');
      return;
    }
    
    const url = customUrl || DIAMOND_DEPLOYMENT_CONFIG.WEBSOCKET_URL;
    
    try {
      // Create socket connection
      const socket = io(url, {
        path: DIAMOND_DEPLOYMENT_CONFIG.WEBSOCKET_PATH,
        transports: ['websocket', 'polling'],
        upgrade: true,
        rememberUpgrade: true,
        reconnection: true,
        reconnectionAttempts: maxReconnectAttempts,
        reconnectionDelay: DIAMOND_DEPLOYMENT_CONFIG.WEBSOCKET_RECONNECT_DELAY,
      });
      
      // Connection event handlers
      socket.on(WEBSOCKET_EVENTS.CONNECT, () => {
        console.log('✅ WebSocket connected');
        setConnected(true);
        setConnectionError(null);
        reconnectAttempts.current = 0;
        
        // Emit frontend connection event
        socket.emit(WEBSOCKET_EVENTS.FRONTEND_CONNECT, {
          clientType: 'frontend',
          timestamp: new Date().toISOString(),
        });
      });
      
      socket.on(WEBSOCKET_EVENTS.DISCONNECT, (reason) => {
        console.log('🔌 WebSocket disconnected:', reason);
        setConnected(false);
        
        // Clear active deployments on disconnect
        setActiveDeployments([]);
      });
      
      socket.on(WEBSOCKET_EVENTS.CONNECT_ERROR, (error) => {
        console.error('❌ WebSocket connection error:', error);
        setConnected(false);
        setConnectionError(createErrorMessage(error));
        reconnectAttempts.current++;
      });
      
      // Deployment event handlers
      socket.on(WEBSOCKET_EVENTS.DEPLOYMENT_STARTED, (event) => {
        console.log('🚀 Deployment started:', event);
        const parsedEvent = parseWebSocketEvent(event);
        setDeploymentEvents(prev => [...prev, parsedEvent]);
        
        // Add to active deployments
        setActiveDeployments(prev => 
          prev.includes(event.deploymentId) 
            ? prev 
            : [...prev, event.deploymentId]
        );
      });
      
      socket.on(WEBSOCKET_EVENTS.DEPLOYMENT_PROGRESS, (event) => {
        console.log('📊 Deployment progress:', event);
        const parsedEvent = parseWebSocketEvent(event);
        setDeploymentEvents(prev => [...prev, parsedEvent]);
      });
      
      socket.on(WEBSOCKET_EVENTS.STEP_COMPLETED, (event) => {
        console.log('✅ Step completed:', event);
        const parsedEvent = parseWebSocketEvent(event);
        setDeploymentEvents(prev => [...prev, parsedEvent]);
      });
      
      socket.on(WEBSOCKET_EVENTS.DEPLOYMENT_COMPLETED, (event) => {
        console.log('🎉 Deployment completed:', event);
        const parsedEvent = parseWebSocketEvent(event);
        setDeploymentEvents(prev => [...prev, parsedEvent]);
        
        // Remove from active deployments
        setActiveDeployments(prev => 
          prev.filter(id => id !== event.deploymentId)
        );
      });
      
      socket.on(WEBSOCKET_EVENTS.DEPLOYMENT_FAILED, (event) => {
        console.error('💥 Deployment failed:', event);
        const parsedEvent = parseWebSocketEvent(event);
        setDeploymentEvents(prev => [...prev, parsedEvent]);
        
        // Remove from active deployments
        setActiveDeployments(prev => 
          prev.filter(id => id !== event.deploymentId)
        );
      });
      
      // Subscription confirmation handlers
      socket.on(WEBSOCKET_EVENTS.SUBSCRIPTION_CONFIRMED, (data) => {
        console.log('✅ Subscription confirmed for deployment:', data.deploymentId);
      });
      
      socket.on(WEBSOCKET_EVENTS.UNSUBSCRIPTION_CONFIRMED, (data) => {
        console.log('❌ Unsubscription confirmed for deployment:', data.deploymentId);
      });
      
      socket.on(WEBSOCKET_EVENTS.DEPLOYMENT_STATUS, (event) => {
        console.log('📋 Deployment status update:', event);
        const parsedEvent = parseWebSocketEvent(event);
        setDeploymentEvents(prev => [...prev, parsedEvent]);
      });
      
      socketRef.current = socket;
      
    } catch (error) {
      console.error('Failed to create WebSocket connection:', error);
      setConnectionError(createErrorMessage(error));
    }
  }, [customUrl, maxReconnectAttempts]);
  
  /**
   * Disconnect WebSocket
   */
  const disconnect = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }
    setConnected(false);
    setConnectionError(null);
    setActiveDeployments([]);
  }, []);
  
  /**
   * Subscribe to deployment updates
   */
  const subscribeToDeployment = useCallback((deploymentId: string) => {
    if (!socketRef.current || !connected) {
      console.warn('Cannot subscribe: WebSocket not connected');
      return;
    }
    
    console.log('📡 Subscribing to deployment:', deploymentId);
    socketRef.current.emit(WEBSOCKET_EVENTS.SUBSCRIBE_DEPLOYMENT, deploymentId);
  }, [connected]);
  
  /**
   * Unsubscribe from deployment updates
   */
  const unsubscribeFromDeployment = useCallback((deploymentId: string) => {
    if (!socketRef.current || !connected) {
      console.warn('Cannot unsubscribe: WebSocket not connected');
      return;
    }
    
    console.log('📡 Unsubscribing from deployment:', deploymentId);
    socketRef.current.emit(WEBSOCKET_EVENTS.UNSUBSCRIBE_DEPLOYMENT, deploymentId);
  }, [connected]);
  
  /**
   * Clear all deployment events
   */
  const clearEvents = useCallback(() => {
    setDeploymentEvents([]);
  }, []);
  
  /**
   * Get events for specific deployment
   */
  const getEventsForDeployment = useCallback((deploymentId: string): WebSocketEvent[] => {
    return filterEventsByDeployment(deploymentEvents, deploymentId);
  }, [deploymentEvents]);
  
  // Auto-connect on mount if enabled
  useEffect(() => {
    if (autoConnect) {
      connect();
    }
    
    // Cleanup on unmount
    return () => {
      disconnect();
    };
  }, [autoConnect, connect, disconnect]);
  
  // Reconnection logic
  useEffect(() => {
    if (connectionError && reconnectAttempts.current < maxReconnectAttempts) {
      const timeoutId = setTimeout(() => {
        console.log(`🔄 Attempting to reconnect (${reconnectAttempts.current + 1}/${maxReconnectAttempts})`);
        connect();
      }, DIAMOND_DEPLOYMENT_CONFIG.WEBSOCKET_RECONNECT_DELAY);
      
      return () => clearTimeout(timeoutId);
    }
  }, [connectionError, connect, maxReconnectAttempts]);
  
  return {
    // State
    connected,
    connectionError,
    deploymentEvents,
    activeDeployments,
    
    // Actions
    connect,
    disconnect,
    subscribeToDeployment,
    unsubscribeFromDeployment,
    
    // Utils
    clearEvents,
    getEventsForDeployment,
  };
}

/**
 * Hook for single deployment WebSocket tracking
 * 
 * Automatically subscribes/unsubscribes to a specific deployment
 * and filters events for that deployment only.
 */
export function useDeploymentWebSocketTracking(deploymentId: string | null) {
  const webSocket = useDeploymentWebSocket();
  
  // Auto-subscribe when deployment ID changes
  useEffect(() => {
    if (deploymentId && webSocket.connected) {
      webSocket.subscribeToDeployment(deploymentId);
      
      return () => {
        webSocket.unsubscribeFromDeployment(deploymentId);
      };
    }
  }, [deploymentId, webSocket.connected, webSocket.subscribeToDeployment, webSocket.unsubscribeFromDeployment]);
  
  // Filter events for this specific deployment
  const events = deploymentId 
    ? webSocket.getEventsForDeployment(deploymentId)
    : [];
  
  return {
    ...webSocket,
    events, // Only events for this deployment
    isTracking: deploymentId !== null && webSocket.connected,
  };
}