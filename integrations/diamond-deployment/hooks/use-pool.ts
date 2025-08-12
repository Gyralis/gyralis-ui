// Pool/Loop Management Hook

import React, { useState, useCallback, useRef } from 'react';
import type {
  Pool,
  CreatePoolRequest,
  UpdatePoolRequest,
  UsePoolReturn
} from '../utils/types';
import { diamondApi } from '../client';
import { createErrorMessage } from '../utils';

/**
 * Pool/Loop Management Hook
 * 
 * Manages CRUD operations for blockchain pools (also known as loops).
 * Handles creation, reading, updating, and deletion of pool entities.
 * 
 * @example
 * ```tsx
 * const { 
 *   pools, 
 *   createPool, 
 *   loading 
 * } = usePool();
 * 
 * const handleCreate = async () => {
 *   try {
 *     await createPool({
 *       organization_id: 'org-123',
 *       contract_address: '0x5678...',
 *       metadata: { name: 'My Pool', description: 'A funding pool' }
 *     });
 *     console.log('Pool created!');
 *   } catch (error) {
 *     console.error('Failed to create pool:', error);
 *   }
 * };
 * ```
 */
export function usePool(): UsePoolReturn {
  // State management
  const [pools, setPools] = useState<Pool[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Keep track of component mount for cleanup
  const mountedRef = useRef(true);
  
  /**
   * Reset all pool state
   */
  const reset = useCallback(() => {
    setPools([]);
    setLoading(false);
    setError(null);
  }, []);
  
  /**
   * Create a new pool
   */
  const createPool = useCallback(async (data: CreatePoolRequest): Promise<Pool> => {
    try {
      setLoading(true);
      setError(null);
      
      const newPool = await diamondApi.createPool(data);
      
      if (mountedRef.current) {
        // Add to local state
        setPools(prev => [newPool, ...prev]);
      }
      
      return newPool;
    } catch (err) {
      const errorMessage = createErrorMessage(err);
      
      if (mountedRef.current) {
        setError(errorMessage);
      }
      
      throw new Error(errorMessage);
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  }, []);
  
  /**
   * Update an existing pool
   */
  const updatePool = useCallback(async (
    id: string, 
    data: UpdatePoolRequest
  ): Promise<Pool> => {
    try {
      setLoading(true);
      setError(null);
      
      const updatedPool = await diamondApi.updatePool(id, data);
      
      if (mountedRef.current) {
        // Update in local state
        setPools(prev =>
          prev.map(pool => pool.id === id ? updatedPool : pool)
        );
      }
      
      return updatedPool;
    } catch (err) {
      const errorMessage = createErrorMessage(err);
      
      if (mountedRef.current) {
        setError(errorMessage);
      }
      
      throw new Error(errorMessage);
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  }, []);
  
  /**
   * Delete a pool
   */
  const deletePool = useCallback(async (id: string): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      
      await diamondApi.deletePool(id);
      
      if (mountedRef.current) {
        // Remove from local state
        setPools(prev => prev.filter(pool => pool.id !== id));
      }
    } catch (err) {
      const errorMessage = createErrorMessage(err);
      
      if (mountedRef.current) {
        setError(errorMessage);
      }
      
      throw new Error(errorMessage);
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  }, []);
  
  /**
   * Get a specific pool by ID
   */
  const getPool = useCallback(async (id: string): Promise<Pool> => {
    try {
      setLoading(true);
      setError(null);
      
      const pool = await diamondApi.getPool(id);
      
      if (mountedRef.current) {
        // Update in local state if exists, otherwise add it
        setPools(prev => {
          const exists = prev.find(p => p.id === id);
          if (exists) {
            return prev.map(p => p.id === id ? pool : p);
          } else {
            return [pool, ...prev];
          }
        });
      }
      
      return pool;
    } catch (err) {
      const errorMessage = createErrorMessage(err);
      
      if (mountedRef.current) {
        setError(errorMessage);
      }
      
      throw new Error(errorMessage);
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  }, []);
  
  /**
   * List pools (optionally filtered by organization)
   */
  const listPools = useCallback(async (organizationId?: string): Promise<Pool[]> => {
    try {
      setLoading(true);
      setError(null);
      
      const poolsList = organizationId 
        ? await diamondApi.listOrganizationPools(organizationId)
        : await diamondApi.listPools();
      
      if (mountedRef.current) {
        setPools(poolsList);
      }
      
      return poolsList;
    } catch (err) {
      const errorMessage = createErrorMessage(err);
      
      if (mountedRef.current) {
        setError(errorMessage);
        setPools([]);
      }
      
      throw new Error(errorMessage);
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  }, []);
  
  /**
   * Refresh pools list
   */
  const refresh = useCallback(async (): Promise<void> => {
    await listPools();
  }, [listPools]);
  
  // Cleanup on unmount
  React.useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);
  
  return {
    // State
    pools,
    loading,
    error,
    
    // Actions
    createPool,
    updatePool,
    deletePool,
    getPool,
    listPools,
    
    // Utils
    refresh,
    reset,
  };
}

/**
 * Hook for pool selection and management
 * 
 * Provides utilities for selecting pools and managing selection state
 */
export function usePoolSelection(pools: Pool[]) {
  const [selectedPool, setSelectedPool] = useState<Pool | null>(null);
  
  const selectPool = useCallback((pool: Pool | null) => {
    setSelectedPool(pool);
  }, []);
  
  const selectById = useCallback((id: string) => {
    const pool = pools.find(p => p.id === id);
    setSelectedPool(pool || null);
  }, [pools]);
  
  const clearSelection = useCallback(() => {
    setSelectedPool(null);
  }, []);
  
  const isSelected = useCallback((id: string): boolean => {
    return selectedPool?.id === id;
  }, [selectedPool]);
  
  return {
    selectedPool,
    selectPool,
    selectById,
    clearSelection,
    isSelected,
  };
}

/**
 * Hook for organization-specific pools
 * 
 * Automatically filters and manages pools for a specific organization
 */
export function useOrganizationPools(organizationId: string | null) {
  const pool = usePool();
  
  // Auto-load organization pools when organization changes
  React.useEffect(() => {
    if (organizationId && !pool.loading) {
      pool.listPools(organizationId).catch(console.error);
    }
  }, [organizationId, pool.listPools, pool.loading]);
  
  // Filter pools for the current organization
  const organizationPools = React.useMemo(() => {
    if (!organizationId) return pool.pools;
    return pool.pools.filter(p => p.organization_id === organizationId);
  }, [pool.pools, organizationId]);
  
  return {
    ...pool,
    pools: organizationPools,
  };
}

/**
 * Hook with auto-loading pools on mount
 */
export function useAutoPools() {
  const pool = usePool();
  
  // Auto-load pools on mount
  React.useEffect(() => {
    if (!pool.loading && pool.pools.length === 0) {
      pool.listPools().catch(console.error);
    }
  }, [pool.loading, pool.pools.length, pool.listPools]);
  
  return pool;
}

/**
 * Combined hook for organizations and their pools
 * 
 * Provides a complete interface for managing organizations and their associated pools
 */
export function useOrganizationWithPools(organizationId: string | null) {
  const pools = useOrganizationPools(organizationId);
  
  // Create pool with automatic organization assignment
  const createPoolForOrganization = useCallback(async (
    poolData: Omit<CreatePoolRequest, 'organization_id'>
  ): Promise<Pool> => {
    if (!organizationId) {
      throw new Error('No organization selected');
    }
    
    return pools.createPool({
      ...poolData,
      organization_id: organizationId,
    });
  }, [organizationId, pools.createPool]);
  
  return {
    ...pools,
    createPoolForOrganization,
  };
}