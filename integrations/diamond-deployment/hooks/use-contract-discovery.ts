// Contract Discovery Hook

import { useState, useCallback, useRef } from 'react';
import type {
  ContractDiscovery,
  UseContractDiscoveryReturn
} from '../utils/types';
import { createErrorMessage, categorizeFacets, generateDeploymentOrder } from '../utils';

/**
 * Contract Discovery Hook
 * 
 * Handles contract scanning and facet discovery for Diamond deployment.
 * Since this is frontend-only, it works with pre-compiled contract artifacts
 * or interfaces with the CLI discovery engine via backend APIs.
 * 
 * @example
 * ```tsx
 * const { scanContracts, discovery, isScanning } = useContractDiscovery();
 * 
 * const handleScan = async () => {
 *   try {
 *     const result = await scanContracts();
 *     console.log('Found facets:', result.facets.length);
 *   } catch (error) {
 *     console.error('Scan failed:', error);
 *   }
 * };
 * ```
 */
export function useContractDiscovery(): UseContractDiscoveryReturn {
  // State management
  const [isScanning, setIsScanning] = useState(false);
  const [discovery, setDiscovery] = useState<ContractDiscovery | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Keep track of current scan for cleanup
  const currentScanRef = useRef<AbortController | null>(null);
  
  /**
   * Reset discovery state
   */
  const reset = useCallback(() => {
    setIsScanning(false);
    setDiscovery(null);
    setError(null);
    
    // Cancel current scan if running
    if (currentScanRef.current) {
      currentScanRef.current.abort();
      currentScanRef.current = null;
    }
  }, []);
  
  /**
   * Scan contracts for Diamond facets
   * 
   * In a full implementation, this would:
   * 1. Call backend API to trigger CLI discovery engine
   * 2. Parse compiled contract artifacts
   * 3. Extract function signatures and selectors
   * 4. Categorize facets by type
   */
  const scanContracts = useCallback(async (contractsPath?: string): Promise<ContractDiscovery> => {
    if (isScanning) {
      throw new Error('Contract scan already in progress');
    }
    
    // Cancel any existing scan
    if (currentScanRef.current) {
      currentScanRef.current.abort();
    }
    
    const abortController = new AbortController();
    currentScanRef.current = abortController;
    
    try {
      setIsScanning(true);
      setError(null);
      
      // Simulate contract discovery process
      // In real implementation, this would call backend API
      const result = await mockContractDiscovery(contractsPath, abortController.signal);
      
      setDiscovery(result);
      return result;
      
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        throw new Error('Contract scan was cancelled');
      }
      
      const errorMessage = createErrorMessage(err);
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsScanning(false);
      currentScanRef.current = null;
    }
  }, [isScanning]);
  
  /**
   * Refresh current discovery
   */
  const refresh = useCallback(async (): Promise<void> => {
    if (discovery) {
      await scanContracts();
    }
  }, [discovery, scanContracts]);
  
  return {
    // State
    isScanning,
    discovery,
    error,
    
    // Actions
    scanContracts,
    refresh,
    
    // Utils
    reset,
  };
}

/**
 * Mock contract discovery implementation
 * 
 * In production, this would be replaced with actual backend API calls
 * to the CLI discovery engine or direct artifact parsing.
 */
async function mockContractDiscovery(
  contractsPath?: string,
  signal?: AbortSignal
): Promise<ContractDiscovery> {
  // Simulate scanning delay
  await new Promise((resolve, reject) => {
    const timeout = setTimeout(resolve, 1500);
    
    if (signal) {
      signal.addEventListener('abort', () => {
        clearTimeout(timeout);
        reject(new Error('Aborted'));
      });
    }
  });
  
  // Mock discovered facets (based on real Diamond contracts)
  const mockFacets = [
    {
      name: 'DiamondCutFacet',
      functions: [
        {
          name: 'diamondCut',
          signature: 'diamondCut((address,bytes4[],uint8)[],address,bytes)',
          selector: '0x1f931c1c',
          inputs: [
            { type: 'tuple[]', name: '_diamondCut' },
            { type: 'address', name: '_init' },
            { type: 'bytes', name: '_calldata' }
          ],
          stateMutability: 'nonpayable' as const
        }
      ]
    },
    {
      name: 'DiamondLoupeFacet',
      functions: [
        {
          name: 'facets',
          signature: 'facets()',
          selector: '0x7a0ed627',
          inputs: [],
          stateMutability: 'view' as const
        },
        {
          name: 'facetFunctionSelectors',
          signature: 'facetFunctionSelectors(address)',
          selector: '0xadfca15e',
          inputs: [{ type: 'address', name: '_facet' }],
          stateMutability: 'view' as const
        },
        {
          name: 'facetAddresses',
          signature: 'facetAddresses()',
          selector: '0x52ef6b2c',
          inputs: [],
          stateMutability: 'view' as const
        },
        {
          name: 'facetAddress',
          signature: 'facetAddress(bytes4)',
          selector: '0xcdffacc6',
          inputs: [{ type: 'bytes4', name: '_functionSelector' }],
          stateMutability: 'view' as const
        }
      ]
    },
    {
      name: 'OwnableFacet',
      functions: [
        {
          name: 'owner',
          signature: 'owner()',
          selector: '0x8da5cb5b',
          inputs: [],
          stateMutability: 'view' as const
        },
        {
          name: 'transferOwnership',
          signature: 'transferOwnership(address)',
          selector: '0xf2fde38b',
          inputs: [{ type: 'address', name: 'newOwner' }],
          stateMutability: 'nonpayable' as const
        }
      ]
    },
    {
      name: 'AccessControlFacet',
      functions: [
        {
          name: 'grantRole',
          signature: 'grantRole(bytes32,address)',
          selector: '0x2f2ff15d',
          inputs: [
            { type: 'bytes32', name: 'role' },
            { type: 'address', name: 'account' }
          ],
          stateMutability: 'nonpayable' as const
        },
        {
          name: 'hasRole',
          signature: 'hasRole(bytes32,address)',
          selector: '0x91d14854',
          inputs: [
            { type: 'bytes32', name: 'role' },
            { type: 'address', name: 'account' }
          ],
          stateMutability: 'view' as const
        }
      ]
    },
    {
      name: 'OrganizationFacet',
      functions: [
        {
          name: 'createOrganization',
          signature: 'createOrganization(string,string)',
          selector: '0x123abc45',
          inputs: [
            { type: 'string', name: 'name' },
            { type: 'string', name: 'description' }
          ],
          stateMutability: 'nonpayable' as const
        },
        {
          name: 'getOrganization',
          signature: 'getOrganization(uint256)',
          selector: '0x456def78',
          inputs: [{ type: 'uint256', name: 'orgId' }],
          stateMutability: 'view' as const
        }
      ]
    }
  ];
  
  const totalFunctions = mockFacets.reduce((sum, facet) => sum + facet.functions.length, 0);
  const categorization = categorizeFacets(mockFacets);
  const deploymentOrder = generateDeploymentOrder(mockFacets);
  
  return {
    success: true,
    facets: mockFacets,
    totalFunctions,
    summary: {
      totalFacets: mockFacets.length,
      categorization,
      deploymentOrder
    }
  };
}

/**
 * Hook for contract discovery with automatic refresh
 * 
 * Automatically scans contracts on mount and provides refresh capability
 */
export function useAutoContractDiscovery(
  contractsPath?: string,
  autoScan: boolean = true
) {
  const discovery = useContractDiscovery();
  
  // Auto-scan on mount if enabled
  React.useEffect(() => {
    if (autoScan && !discovery.isScanning && !discovery.discovery) {
      discovery.scanContracts(contractsPath).catch(console.error);
    }
  }, [autoScan, contractsPath, discovery.isScanning, discovery.discovery, discovery.scanContracts]);
  
  return discovery;
}

/**
 * Hook for facet selection and configuration
 * 
 * Provides utilities for selecting and configuring facets for deployment
 */
export function useFacetSelection(discovery: ContractDiscovery | null) {
  const [selectedFacets, setSelectedFacets] = useState<string[]>([]);
  const [deploymentOrder, setDeploymentOrder] = useState<string[]>([]);
  
  // Auto-select core facets when discovery changes
  React.useEffect(() => {
    if (discovery?.facets) {
      const coreFacets = discovery.summary.categorization.core;
      setSelectedFacets(coreFacets);
      setDeploymentOrder(discovery.summary.deploymentOrder);
    }
  }, [discovery]);
  
  const toggleFacet = useCallback((facetName: string) => {
    setSelectedFacets(prev => 
      prev.includes(facetName)
        ? prev.filter(name => name !== facetName)
        : [...prev, facetName]
    );
  }, []);
  
  const selectAll = useCallback(() => {
    if (discovery?.facets) {
      setSelectedFacets(discovery.facets.map(f => f.name));
    }
  }, [discovery]);
  
  const selectNone = useCallback(() => {
    // Always keep core facets selected
    if (discovery?.summary.categorization.core) {
      setSelectedFacets(discovery.summary.categorization.core);
    }
  }, [discovery]);
  
  const getSelectedFacets = useCallback(() => {
    if (!discovery?.facets) return [];
    return discovery.facets.filter(facet => selectedFacets.includes(facet.name));
  }, [discovery, selectedFacets]);
  
  return {
    selectedFacets,
    deploymentOrder,
    setDeploymentOrder,
    toggleFacet,
    selectAll,
    selectNone,
    getSelectedFacets,
    isSelected: (facetName: string) => selectedFacets.includes(facetName),
  };
}