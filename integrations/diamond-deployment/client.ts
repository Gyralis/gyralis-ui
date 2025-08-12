// Diamond Deployment Backend Client

import type {
  DeploymentConfig,
  ValidationResult,
  SimulationResult,
  DeploymentResult,
  DeploymentStatus,
  NetworkInfo,
  Organization,
  CreateOrganizationRequest,
  UpdateOrganizationRequest,
  Pool,
  CreatePoolRequest,
  UpdatePoolRequest
} from './utils/types';
import { DIAMOND_DEPLOYMENT_CONFIG, API_ENDPOINTS, ERROR_MESSAGES } from './utils/constants';
import { createErrorMessage, retryAsync } from './utils';

/**
 * Diamond Deployment Backend API Client
 */
export class DiamondDeploymentClient {
  private baseUrl: string;
  private timeout: number;
  
  constructor(
    baseUrl: string = DIAMOND_DEPLOYMENT_CONFIG.API_BASE_URL,
    timeout: number = DIAMOND_DEPLOYMENT_CONFIG.REQUEST_TIMEOUT
  ) {
    this.baseUrl = baseUrl;
    this.timeout = timeout;
  }
  
  /**
   * Test backend connection
   */
  async testConnection(): Promise<boolean> {
    try {
      await this.request('GET', API_ENDPOINTS.NETWORKS);
      return true;
    } catch (error) {
      console.warn('Backend connection test failed:', error);
      return false;
    }
  }
  
  /**
   * Validate deployment configuration
   */
  async validateDeployment(config: DeploymentConfig): Promise<ValidationResult> {
    return this.request('POST', API_ENDPOINTS.VALIDATE, config);
  }
  
  /**
   * Simulate deployment
   */
  async simulateDeployment(config: DeploymentConfig): Promise<SimulationResult> {
    return this.request('POST', API_ENDPOINTS.SIMULATE, config);
  }
  
  /**
   * Execute deployment
   */
  async executeDeployment(config: DeploymentConfig): Promise<DeploymentResult> {
    return this.request('POST', API_ENDPOINTS.EXECUTE, config);
  }
  
  /**
   * Execute real-time deployment with WebSocket updates
   */
  async executeRealtimeDeployment(config: DeploymentConfig): Promise<DeploymentResult> {
    return this.request('POST', API_ENDPOINTS.REALTIME, config);
  }
  
  /**
   * Get deployment status
   */
  async getDeploymentStatus(deploymentId: string): Promise<DeploymentStatus> {
    return this.request('GET', API_ENDPOINTS.STATUS(deploymentId));
  }
  
  /**
   * Get supported networks
   */
  async getNetworks(): Promise<Record<string, NetworkInfo>> {
    return this.request('GET', API_ENDPOINTS.NETWORKS);
  }
  
  /**
   * Get WebSocket service status
   */
  async getWebSocketStatus(): Promise<{
    connected: number;
    activeDeployments: number;
    deploymentRooms: Record<string, string[]>;
  }> {
    return this.request('GET', API_ENDPOINTS.WEBSOCKET_STATUS);
  }
  
  // ===== ORGANIZATION METHODS =====
  
  /**
   * Create a new organization
   */
  async createOrganization(data: CreateOrganizationRequest): Promise<Organization> {
    return this.request('POST', API_ENDPOINTS.ORGANIZATIONS, data);
  }
  
  /**
   * Get all organizations
   */
  async listOrganizations(): Promise<Organization[]> {
    return this.request('GET', API_ENDPOINTS.ORGANIZATIONS);
  }
  
  /**
   * Get organization by ID
   */
  async getOrganization(id: string): Promise<Organization> {
    return this.request('GET', API_ENDPOINTS.ORGANIZATION(id));
  }
  
  /**
   * Update organization
   */
  async updateOrganization(id: string, data: UpdateOrganizationRequest): Promise<Organization> {
    return this.request('PUT', API_ENDPOINTS.ORGANIZATION(id), data);
  }
  
  /**
   * Delete organization
   */
  async deleteOrganization(id: string): Promise<void> {
    return this.request('DELETE', API_ENDPOINTS.ORGANIZATION(id));
  }
  
  // ===== POOL METHODS =====
  
  /**
   * Create a new pool
   */
  async createPool(data: CreatePoolRequest): Promise<Pool> {
    return this.request('POST', API_ENDPOINTS.POOLS, data);
  }
  
  /**
   * Get all pools
   */
  async listPools(): Promise<Pool[]> {
    return this.request('GET', API_ENDPOINTS.POOLS);
  }
  
  /**
   * Get pools by organization
   */
  async listOrganizationPools(organizationId: string): Promise<Pool[]> {
    return this.request('GET', API_ENDPOINTS.ORGANIZATION_POOLS(organizationId));
  }
  
  /**
   * Get pool by ID
   */
  async getPool(id: string): Promise<Pool> {
    return this.request('GET', API_ENDPOINTS.POOL(id));
  }
  
  /**
   * Update pool
   */
  async updatePool(id: string, data: UpdatePoolRequest): Promise<Pool> {
    return this.request('PUT', API_ENDPOINTS.POOL(id), data);
  }
  
  /**
   * Delete pool
   */
  async deletePool(id: string): Promise<void> {
    return this.request('DELETE', API_ENDPOINTS.POOL(id));
  }
  
  /**
   * Generic HTTP request method with retry logic
   */
  private async request<T>(
    method: 'GET' | 'POST' | 'PUT' | 'DELETE',
    endpoint: string,
    data?: any
  ): Promise<T> {
    return retryAsync(async () => {
      const url = `${this.baseUrl}${endpoint}`;
      
      const options: RequestInit = {
        method,
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'Diamond-Frontend/1.0.0',
        },
        signal: AbortSignal.timeout(this.timeout),
      };
      
      if (data && (method === 'POST' || method === 'PUT')) {
        options.body = JSON.stringify(data);
      }
      
      const response = await fetch(url, options);
      
      if (!response.ok) {
        let errorMessage: string;
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorData.message || response.statusText;
        } catch {
          errorMessage = response.statusText;
        }
        
        throw new Error(`HTTP ${response.status}: ${errorMessage}`);
      }
      
      return response.json();
    }, DIAMOND_DEPLOYMENT_CONFIG.RETRY_ATTEMPTS, DIAMOND_DEPLOYMENT_CONFIG.RETRY_DELAY);
  }
}

/**
 * Default client instance
 */
export const diamondClient = new DiamondDeploymentClient();

/**
 * Create client with custom configuration
 */
export function createDiamondClient(config?: {
  baseUrl?: string;
  timeout?: number;
}): DiamondDeploymentClient {
  return new DiamondDeploymentClient(
    config?.baseUrl,
    config?.timeout
  );
}

/**
 * API helper functions for direct use in components
 */
export const diamondApi = {
  // Connection
  testConnection: () => diamondClient.testConnection(),
  
  // Deployment operations
  validate: (config: DeploymentConfig) => diamondClient.validateDeployment(config),
  simulate: (config: DeploymentConfig) => diamondClient.simulateDeployment(config),
  deploy: (config: DeploymentConfig) => diamondClient.executeDeployment(config),
  deployRealtime: (config: DeploymentConfig) => diamondClient.executeRealtimeDeployment(config),
  
  // Status and information
  getStatus: (deploymentId: string) => diamondClient.getDeploymentStatus(deploymentId),
  getNetworks: () => diamondClient.getNetworks(),
  getWebSocketStatus: () => diamondClient.getWebSocketStatus(),
  
  // Organizations
  createOrganization: (data: CreateOrganizationRequest) => diamondClient.createOrganization(data),
  listOrganizations: () => diamondClient.listOrganizations(),
  getOrganization: (id: string) => diamondClient.getOrganization(id),
  updateOrganization: (id: string, data: UpdateOrganizationRequest) => diamondClient.updateOrganization(id, data),
  deleteOrganization: (id: string) => diamondClient.deleteOrganization(id),
  
  // Pools
  createPool: (data: CreatePoolRequest) => diamondClient.createPool(data),
  listPools: () => diamondClient.listPools(),
  listOrganizationPools: (orgId: string) => diamondClient.listOrganizationPools(orgId),
  getPool: (id: string) => diamondClient.getPool(id),
  updatePool: (id: string, data: UpdatePoolRequest) => diamondClient.updatePool(id, data),
  deletePool: (id: string) => diamondClient.deletePool(id),
};