// Organization Management Hook

import React, { useState, useCallback, useRef } from 'react';
import type {
  Organization,
  CreateOrganizationRequest,
  UpdateOrganizationRequest,
  UseOrganizationReturn
} from '../utils/types';
import { diamondApi } from '../client';
import { createErrorMessage } from '../utils';

/**
 * Organization Management Hook
 * 
 * Manages CRUD operations for blockchain organizations.
 * Handles creation, reading, updating, and deletion of organization entities.
 * 
 * @example
 * ```tsx
 * const { 
 *   organizations, 
 *   createOrganization, 
 *   loading 
 * } = useOrganization();
 * 
 * const handleCreate = async () => {
 *   try {
 *     await createOrganization({
 *       contract_address: '0x1234...',
 *       metadata: { name: 'My Organization' }
 *     });
 *     console.log('Organization created!');
 *   } catch (error) {
 *     console.error('Failed to create organization:', error);
 *   }
 * };
 * ```
 */
export function useOrganization(): UseOrganizationReturn {
  // State management
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Keep track of component mount for cleanup
  const mountedRef = useRef(true);
  
  /**
   * Reset all organization state
   */
  const reset = useCallback(() => {
    setOrganizations([]);
    setLoading(false);
    setError(null);
  }, []);
  
  /**
   * Create a new organization
   */
  const createOrganization = useCallback(async (data: CreateOrganizationRequest): Promise<Organization> => {
    try {
      setLoading(true);
      setError(null);
      
      const newOrganization = await diamondApi.createOrganization(data);
      
      if (mountedRef.current) {
        // Add to local state
        setOrganizations(prev => [newOrganization, ...prev]);
      }
      
      return newOrganization;
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
   * Update an existing organization
   */
  const updateOrganization = useCallback(async (
    id: string, 
    data: UpdateOrganizationRequest
  ): Promise<Organization> => {
    try {
      setLoading(true);
      setError(null);
      
      const updatedOrganization = await diamondApi.updateOrganization(id, data);
      
      if (mountedRef.current) {
        // Update in local state
        setOrganizations(prev =>
          prev.map(org => org.id === id ? updatedOrganization : org)
        );
      }
      
      return updatedOrganization;
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
   * Delete an organization
   */
  const deleteOrganization = useCallback(async (id: string): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      
      await diamondApi.deleteOrganization(id);
      
      if (mountedRef.current) {
        // Remove from local state
        setOrganizations(prev => prev.filter(org => org.id !== id));
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
   * Get a specific organization by ID
   */
  const getOrganization = useCallback(async (id: string): Promise<Organization> => {
    try {
      setLoading(true);
      setError(null);
      
      const organization = await diamondApi.getOrganization(id);
      
      if (mountedRef.current) {
        // Update in local state if exists, otherwise add it
        setOrganizations(prev => {
          const exists = prev.find(org => org.id === id);
          if (exists) {
            return prev.map(org => org.id === id ? organization : org);
          } else {
            return [organization, ...prev];
          }
        });
      }
      
      return organization;
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
   * List all organizations
   */
  const listOrganizations = useCallback(async (): Promise<Organization[]> => {
    try {
      setLoading(true);
      setError(null);
      
      const organizationsList = await diamondApi.listOrganizations();
      
      if (mountedRef.current) {
        setOrganizations(organizationsList);
      }
      
      return organizationsList;
    } catch (err) {
      const errorMessage = createErrorMessage(err);
      
      if (mountedRef.current) {
        setError(errorMessage);
        setOrganizations([]);
      }
      
      throw new Error(errorMessage);
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  }, []);
  
  /**
   * Refresh organizations list
   */
  const refresh = useCallback(async (): Promise<void> => {
    await listOrganizations();
  }, [listOrganizations]);
  
  // Cleanup on unmount
  React.useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);
  
  return {
    // State
    organizations,
    loading,
    error,
    
    // Actions
    createOrganization,
    updateOrganization,
    deleteOrganization,
    getOrganization,
    listOrganizations,
    
    // Utils
    refresh,
    reset,
  };
}

/**
 * Hook for organization selection and management
 * 
 * Provides utilities for selecting organizations and managing selection state
 */
export function useOrganizationSelection(organizations: Organization[]) {
  const [selectedOrganization, setSelectedOrganization] = useState<Organization | null>(null);
  
  const selectOrganization = useCallback((organization: Organization | null) => {
    setSelectedOrganization(organization);
  }, []);
  
  const selectById = useCallback((id: string) => {
    const organization = organizations.find(org => org.id === id);
    setSelectedOrganization(organization || null);
  }, [organizations]);
  
  const clearSelection = useCallback(() => {
    setSelectedOrganization(null);
  }, []);
  
  const isSelected = useCallback((id: string): boolean => {
    return selectedOrganization?.id === id;
  }, [selectedOrganization]);
  
  return {
    selectedOrganization,
    selectOrganization,
    selectById,
    clearSelection,
    isSelected,
  };
}

/**
 * Hook with auto-loading organizations on mount
 */
export function useAutoOrganization() {
  const organization = useOrganization();
  
  // Auto-load organizations on mount
  React.useEffect(() => {
    if (!organization.loading && organization.organizations.length === 0) {
      organization.listOrganizations().catch(console.error);
    }
  }, [organization.loading, organization.organizations.length, organization.listOrganizations]);
  
  return organization;
}