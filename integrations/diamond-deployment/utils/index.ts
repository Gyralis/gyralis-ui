// Diamond Deployment Integration Utilities

import type { 
  DeploymentConfig,
  DiamondFacet,
  SimulationStep,
  DeploymentProgress,
  WebSocketEvent,
  ValidationResult
} from './types';
import { FACET_CATEGORIES, PROGRESS_COLORS, ERROR_MESSAGES } from './constants';

/**
 * Format deployment progress as percentage
 */
export function formatProgress(progress: number): string {
  return `${Math.round(progress)}%`;
}

/**
 * Format gas amount with commas
 */
export function formatGas(gas: number): string {
  return gas.toLocaleString();
}

/**
 * Format time duration in seconds
 */
export function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return remainingSeconds > 0 ? `${minutes}m ${remainingSeconds}s` : `${minutes}m`;
}

/**
 * Generate unique deployment ID
 */
export function generateDeploymentId(): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substr(2, 9);
  return `deploy_${timestamp}_${random}`;
}

/**
 * Validate deployment configuration
 */
export function validateDeploymentConfig(config: DeploymentConfig): string[] {
  const errors: string[] = [];
  
  if (!config.network) {
    errors.push('Network is required');
  }
  
  if (!config.facets || config.facets.length === 0) {
    errors.push('At least one facet is required');
  }
  
  // Check for required Diamond facets
  const facetNames = config.facets.map(f => f.name);
  if (!facetNames.includes('DiamondCutFacet')) {
    errors.push('DiamondCutFacet is required');
  }
  if (!facetNames.includes('DiamondLoupeFacet')) {
    errors.push('DiamondLoupeFacet is required');
  }
  
  // Check for function selector collisions
  const selectors = new Set<string>();
  const collisions: string[] = [];
  
  config.facets.forEach(facet => {
    facet.functions.forEach(func => {
      if (selectors.has(func.selector)) {
        collisions.push(`Selector collision: ${func.selector} (${func.name})`);
      }
      selectors.add(func.selector);
    });
  });
  
  errors.push(...collisions);
  
  return errors;
}

/**
 * Categorize facets by type
 */
export function categorizeFacets(facets: DiamondFacet[]): Record<string, string[]> {
  const categories = {
    [FACET_CATEGORIES.CORE]: [] as string[],
    [FACET_CATEGORIES.ACCESS]: [] as string[],
    [FACET_CATEGORIES.BUSINESS]: [] as string[],
    [FACET_CATEGORIES.OTHER]: [] as string[],
  };
  
  facets.forEach(facet => {
    const name = facet.name.toLowerCase();
    
    if (name.includes('diamond') || name.includes('loupe') || name.includes('cut')) {
      categories[FACET_CATEGORIES.CORE].push(facet.name);
    } else if (name.includes('ownable') || name.includes('access') || name.includes('role')) {
      categories[FACET_CATEGORIES.ACCESS].push(facet.name);
    } else if (name.includes('organization') || name.includes('pool') || name.includes('loop')) {
      categories[FACET_CATEGORIES.BUSINESS].push(facet.name);
    } else {
      categories[FACET_CATEGORIES.OTHER].push(facet.name);
    }
  });
  
  return categories;
}

/**
 * Generate optimal deployment order
 */
export function generateDeploymentOrder(facets: DiamondFacet[]): string[] {
  const categories = categorizeFacets(facets);
  
  // Deployment order: Core → Access → Business → Other
  return [
    ...categories[FACET_CATEGORIES.CORE],
    ...categories[FACET_CATEGORIES.ACCESS],
    ...categories[FACET_CATEGORIES.BUSINESS],
    ...categories[FACET_CATEGORIES.OTHER],
  ];
}

/**
 * Calculate deployment progress from simulation steps
 */
export function calculateProgress(steps: SimulationStep[], completedSteps: number): DeploymentProgress {
  const totalSteps = steps.length;
  const progress = totalSteps > 0 ? (completedSteps / totalSteps) * 100 : 0;
  
  let currentStep = 'Preparing deployment...';
  if (completedSteps < totalSteps && completedSteps >= 0) {
    const nextStep = steps[completedSteps];
    if (nextStep) {
      currentStep = `${nextStep.action === 'deploy_diamond' ? 'Deploying Diamond base' : 
                      nextStep.action === 'deploy_facet' ? `Deploying ${nextStep.contract}` :
                      'Adding facets to Diamond'}`;
    }
  } else if (completedSteps >= totalSteps) {
    currentStep = 'Deployment completed';
  }
  
  return {
    progress: Math.round(progress),
    currentStep,
    stepsCompleted: completedSteps,
    totalSteps,
  };
}

/**
 * Get progress color based on status
 */
export function getProgressColor(progress: number, hasError: boolean = false): string {
  if (hasError) return PROGRESS_COLORS.FAILED;
  if (progress === 100) return PROGRESS_COLORS.COMPLETED;
  if (progress > 0) return PROGRESS_COLORS.IN_PROGRESS;
  return PROGRESS_COLORS.PENDING;
}

/**
 * Parse WebSocket event data
 */
export function parseWebSocketEvent(event: WebSocketEvent): any {
  try {
    return typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
  } catch (error) {
    console.warn('Failed to parse WebSocket event data:', error);
    return event.data;
  }
}

/**
 * Filter events by deployment ID
 */
export function filterEventsByDeployment(events: WebSocketEvent[], deploymentId: string): WebSocketEvent[] {
  return events.filter(event => event.deploymentId === deploymentId);
}

/**
 * Get latest event by type for deployment
 */
export function getLatestEventByType(
  events: WebSocketEvent[], 
  deploymentId: string, 
  eventType: string
): WebSocketEvent | null {
  const deploymentEvents = filterEventsByDeployment(events, deploymentId)
    .filter(event => event.event === eventType)
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    
  return deploymentEvents[0] || null;
}

/**
 * Format validation result for display
 */
export function formatValidationResult(result: ValidationResult): string {
  if (result.valid) {
    return `✅ Configuration valid (${formatGas(result.gasEstimate)} gas estimated)`;
  } else {
    return `❌ ${result.errors.length} error(s): ${result.errors[0]}`;
  }
}

/**
 * Create error message from various error types
 */
export function createErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  
  if (typeof error === 'string') {
    return error;
  }
  
  if (error && typeof error === 'object' && 'message' in error) {
    return String((error as any).message);
  }
  
  return ERROR_MESSAGES.UNKNOWN_ERROR;
}

/**
 * Debounce function for API calls
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

/**
 * Retry async function with exponential backoff
 */
export async function retryAsync<T>(
  fn: () => Promise<T>,
  maxAttempts: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  let lastError: unknown;
  
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      
      if (attempt === maxAttempts) {
        throw error;
      }
      
      // Exponential backoff
      const delay = baseDelay * Math.pow(2, attempt - 1);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError;
}