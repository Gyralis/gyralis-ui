// Diamond Deployment Integration Types
// Extended with Organizations and Loops/Pools management

export interface DiamondFacet {
  name: string;
  functions: DiamondFunction[];
  address?: string;
  deployed?: boolean;
}

export interface DiamondFunction {
  name: string;
  signature: string;
  selector: string;
  inputs: any[];
  stateMutability: 'view' | 'pure' | 'nonpayable' | 'payable';
}

export interface DeploymentConfig {
  network: string;
  facets: DiamondFacet[];
  gasLimit?: number;
  gasPrice?: string;
  deploymentOrder?: string[];
  dryRun?: boolean;
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  gasEstimate: number;
  networkInfo?: NetworkInfo;
  facetsValidated?: number;
}

export interface SimulationResult {
  success: boolean;
  steps: SimulationStep[];
  totalGasUsed: number;
  estimatedTime: number;
  simulatedAddresses?: Record<string, string>;
  error?: string;
}

export interface SimulationStep {
  step: number;
  action: 'deploy_diamond' | 'deploy_facet' | 'diamond_cut';
  contract: string;
  gasUsed: number;
  status: 'success' | 'pending' | 'failed';
  simulatedAddress?: string;
  txHash?: string;
  functions?: string[];
  facetsAdded?: string[];
}

export interface DeploymentResult {
  success: boolean;
  deploymentId: string;
  message: string;
  diamondAddress?: string;
  facetsDeployed?: string[];
  totalGasUsed?: number;
  deploymentTime?: number;
}

export interface NetworkInfo {
  name: string;
  url?: string;
  chainId: number;
  gasPrice: string;
  supported: boolean;
}

export interface DeploymentProgress {
  progress: number; // 0-100
  currentStep: string;
  stepsCompleted: number;
  totalSteps: number;
  gasUsed?: number;
  estimatedTimeRemaining?: number;
}

export interface WebSocketEvent {
  deploymentId: string;
  event: 'deployment_started' | 'deployment_progress' | 'step_completed' | 'deployment_completed' | 'deployment_failed';
  timestamp: string;
  data: any;
}

export interface DeploymentStatus {
  deploymentId: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  progress: number;
  message?: string;
  error?: string;
  results?: any;
}

export interface ContractDiscovery {
  success: boolean;
  facets: DiamondFacet[];
  totalFunctions: number;
  summary: {
    totalFacets: number;
    categorization: {
      core: string[];
      access: string[];
      business: string[];
      other: string[];
    };
    deploymentOrder: string[];
  };
  error?: string;
}

export interface BackendConnection {
  connected: boolean;
  baseUrl: string;
  lastPing?: number;
}

// Organization Types with Smart Contract Integration
export interface Organization {
  id: string;
  contract_address: string;
  metadata: OrganizationMetadata;
  created_at?: string;
  updated_at?: string;
}

export interface OrganizationMetadata {
  name: string;
  description: string;
  contract_deployment?: ContractDeploymentInfo;
  abi_info?: ContractABIInfo;
  governance?: GovernanceConfig;
  diamond_integration?: DiamondIntegrationInfo;
}

// Request Types with Enhanced Metadata
export interface CreateOrganizationRequest {
  contract_address: string;
  metadata: OrganizationMetadata;
}

export interface UpdateOrganizationRequest {
  metadata?: Partial<OrganizationMetadata>;
}

export interface CreateVerificationRequest {
  type: 'blockchain' | 'api' | 'webhook' | 'signature';
  endpoint: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  parameters: VerificationParameters;
  metadata: VerificationMetadata;
}

export interface CreateSybilRequest {
  verification_id: string;
  metadata: SybilMetadata;
}

export interface CreateCriterionRequest {
  verification_id: string;
  metadata: CriterionMetadata;
}

// Pool/Loop Types with Smart Contract Integration
export interface Pool {
  id: string;
  organization_id: string;
  contract_address: string;
  sybil_id?: string;
  criterion_id?: string;
  metadata: PoolMetadata;
  created_at?: string;
  updated_at?: string;
  // Extended information
  organization?: Organization;
  sybil?: Sybil;
  criterion?: Criterion;
  verification?: Verification;
}

export interface PoolMetadata {
  name: string;
  description: string;
  loop_config?: LoopConfig;
  contract_deployment?: ContractDeploymentInfo;
  abi_info?: ContractABIInfo;
  diamond_integration?: DiamondLoopIntegration;
}

export interface CreatePoolRequest {
  organization_id: string;
  contract_address: string;
  sybil_id?: string;
  criterion_id?: string;
  metadata: PoolMetadata;
}

export interface UpdatePoolRequest {
  sybil_id?: string;
  criterion_id?: string;
  metadata?: Partial<PoolMetadata>;
}

// Enhanced Sybil, Criterion, and Verification Types
export interface Verification {
  id: string;
  type: 'blockchain' | 'api' | 'webhook' | 'signature';
  endpoint: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  parameters: VerificationParameters;
  metadata: VerificationMetadata;
  created_at?: string;
  updated_at?: string;
}

export interface VerificationParameters {
  chainId?: number;
  contract_types?: string[];
  required_interfaces?: string[];
  gas_limit?: number;
  timeout?: number;
  headers?: Record<string, string>;
}

export interface VerificationMetadata {
  name: string;
  description: string;
  supported_contracts?: string[];
  blockchain_specific?: boolean;
  rate_limit?: number;
}

export interface Sybil {
  id: string;
  verification_id: string;
  metadata: SybilMetadata;
  created_at?: string;
  updated_at?: string;
  verification?: Verification;
}

export interface SybilMetadata {
  name: string;
  description: string;
  contract_based?: boolean;
  max_contracts_per_admin?: number;
  cooldown_period?: number;
  verification_rules?: Record<string, any>;
}

export interface Criterion {
  id: string;
  verification_id: string;
  metadata: CriterionMetadata;
  created_at?: string;
  updated_at?: string;
  verification?: Verification;
}

export interface CriterionMetadata {
  name: string;
  description: string;
  required_facets?: string[];
  required_functions?: string[];
  eip_2535_compliant?: boolean;
  gas_requirements?: {
    max_deployment_gas?: number;
    max_execution_gas?: number;
  };
  validation_rules?: Record<string, any>;
}

// Hook return types
export interface UseDiamondDeploymentReturn {
  // State
  isDeploying: boolean;
  deploymentId: string | null;
  progress: DeploymentProgress | null;
  status: DeploymentStatus | null;
  error: string | null;
  
  // Actions
  validateConfig: (config: DeploymentConfig) => Promise<ValidationResult>;
  simulateDeployment: (config: DeploymentConfig) => Promise<SimulationResult>;
  deploy: (config: DeploymentConfig) => Promise<void>;
  deployRealtime: (config: DeploymentConfig) => Promise<void>;
  getStatus: (deploymentId: string) => Promise<DeploymentStatus>;
  
  // Utils
  reset: () => void;
}

export interface UseContractDiscoveryReturn {
  // State
  isScanning: boolean;
  discovery: ContractDiscovery | null;
  error: string | null;
  
  // Actions
  scanContracts: (contractsPath?: string) => Promise<ContractDiscovery>;
  refresh: () => Promise<void>;
  
  // Utils
  reset: () => void;
}

export interface UseDeploymentWebSocketReturn {
  // State
  connected: boolean;
  connectionError: string | null;
  deploymentEvents: WebSocketEvent[];
  activeDeployments: string[];
  
  // Actions
  connect: () => void;
  disconnect: () => void;
  subscribeToDeployment: (deploymentId: string) => void;
  unsubscribeFromDeployment: (deploymentId: string) => void;
  
  // Utils
  clearEvents: () => void;
  getEventsForDeployment: (deploymentId: string) => WebSocketEvent[];
}

export interface UseBackendConnectionReturn {
  // State
  connected: boolean;
  connecting: boolean;
  error: string | null;
  networks: Record<string, NetworkInfo>;
  
  // Actions
  testConnection: () => Promise<boolean>;
  getNetworks: () => Promise<Record<string, NetworkInfo>>;
  
  // Utils
  refresh: () => Promise<void>;
}

export interface UseOrganizationReturn {
  // State
  organizations: Organization[];
  loading: boolean;
  error: string | null;
  
  // Actions
  createOrganization: (data: CreateOrganizationRequest) => Promise<Organization>;
  updateOrganization: (id: string, data: UpdateOrganizationRequest) => Promise<Organization>;
  deleteOrganization: (id: string) => Promise<void>;
  getOrganization: (id: string) => Promise<Organization>;
  listOrganizations: () => Promise<Organization[]>;
  
  // Utils
  refresh: () => Promise<void>;
  reset: () => void;
}

export interface UsePoolReturn {
  // State
  pools: Pool[];
  loading: boolean;
  error: string | null;
  
  // Actions
  createPool: (data: CreatePoolRequest) => Promise<Pool>;
  updatePool: (id: string, data: UpdatePoolRequest) => Promise<Pool>;
  deletePool: (id: string) => Promise<void>;
  getPool: (id: string) => Promise<Pool>;
  listPools: (organizationId?: string) => Promise<Pool[]>;
  
  // Utils
  refresh: () => Promise<void>;
  reset: () => void;
}

// New Hook Types for Enhanced Entities
export interface UseVerificationReturn {
  // State
  verifications: Verification[];
  loading: boolean;
  error: string | null;
  
  // Actions
  createVerification: (data: CreateVerificationRequest) => Promise<Verification>;
  updateVerification: (id: string, data: Partial<CreateVerificationRequest>) => Promise<Verification>;
  deleteVerification: (id: string) => Promise<void>;
  getVerification: (id: string) => Promise<Verification>;
  listVerifications: () => Promise<Verification[]>;
  
  // Utils
  refresh: () => Promise<void>;
  reset: () => void;
}

export interface UseSybilReturn {
  // State
  sybils: Sybil[];
  loading: boolean;
  error: string | null;
  
  // Actions
  createSybil: (data: CreateSybilRequest) => Promise<Sybil>;
  updateSybil: (id: string, data: Partial<CreateSybilRequest>) => Promise<Sybil>;
  deleteSybil: (id: string) => Promise<void>;
  getSybil: (id: string) => Promise<Sybil>;
  listSybils: () => Promise<Sybil[]>;
  
  // Utils
  refresh: () => Promise<void>;
  reset: () => void;
}

export interface UseCriterionReturn {
  // State
  criteria: Criterion[];
  loading: boolean;
  error: string | null;
  
  // Actions
  createCriterion: (data: CreateCriterionRequest) => Promise<Criterion>;
  updateCriterion: (id: string, data: Partial<CreateCriterionRequest>) => Promise<Criterion>;
  deleteCriterion: (id: string) => Promise<void>;
  getCriterion: (id: string) => Promise<Criterion>;
  listCriteria: () => Promise<Criterion[]>;
  
  // Utils
  refresh: () => Promise<void>;
  reset: () => void;
}

// Smart Contract Integration Types
export interface ContractDeploymentInfo {
  diamond_address?: string;
  organization_facet?: string;
  system_diamond?: string;
  deployment_block?: number;
  deployment_timestamp?: number;
  gas_used?: number;
  deployer_address?: string;
  transaction_hash?: string;
}

export interface ContractABIInfo {
  organization_functions?: number;
  loop_functions?: number;
  has_diamond_cut?: boolean;
  has_diamond_loupe?: boolean;
  eip_2535_compliant?: boolean;
  supported_interfaces?: string[];
}

export interface GovernanceConfig {
  admin_role?: string;
  can_create_loops?: boolean;
  multi_sig?: boolean;
  voting_threshold?: number;
  proposal_duration?: number;
}

export interface DiamondIntegrationInfo {
  system_diamond?: string;
  organization_diamond?: string;
  upgradeable?: boolean;
  facets_count?: number;
  total_functions?: number;
}

export interface LoopConfig {
  token_address?: string;
  period_length?: number;
  percent_per_period?: number;
  loop_type?: 'governance' | 'funding' | 'rewards' | 'investment' | 'discussion' | 'emergency';
  voting_system?: 'equal' | 'weighted' | 'mixed';
  max_participants?: number;
}

export interface DiamondLoopIntegration {
  facet_type?: 'LoopFacet' | 'CustomLoop';
  system_diamond?: string;
  organization_diamond?: string;
  upgradeable?: boolean;
  loop_factory_address?: string;
  supports_claims?: boolean;
  supports_voting?: boolean;
}

// Deployment Workflow Types
export interface DiamondDeploymentWorkflow {
  network: string;
  chainId: number;
  facets: DeploymentFacetInfo[];
  deployment_metadata: DeploymentMetadata;
}

export interface DeploymentFacetInfo {
  name: string;
  address: string;
  functions: string[];
  deployment_gas?: number;
}

export interface DeploymentMetadata {
  organization_id?: string;
  contract_addresses?: Record<string, string>;
  pool_count?: number;
  diamond_standard?: string;
  verification_id?: string;
  sybil_id?: string;
  criterion_id?: string;
  deployment_timestamp?: number;
}

// API Response Types
export interface APIResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Validation and Deployment Response Types
export interface DeploymentValidationResponse {
  valid: boolean;
  errors?: string[];
  warnings?: string[];
  estimated_gas?: number;
  estimated_time?: number;
}

export interface DeploymentSimulationResponse {
  success: boolean;
  deploymentId?: string;
  simulation_results?: {
    steps: SimulationStep[];
    total_gas_estimate: number;
    estimated_time: number;
  };
  error?: string;
}