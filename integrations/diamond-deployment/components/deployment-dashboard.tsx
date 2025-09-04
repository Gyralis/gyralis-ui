'use client'

// Diamond Deployment Dashboard Component

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  useDiamondDeployment,
  useDeploymentWebSocket,
  useContractDiscovery,
  useBackendConnection,
  useOrganization,
  useOrganizationSelection,
  usePool,
  useOrganizationPools
} from '../hooks';
import { formatProgress, formatGas, formatDuration } from '../utils';
import { DEPLOYMENT_STATUSES, STEP_ICONS } from '../utils/constants';
import { OrganizationManager } from './organization-manager';
import { PoolManager } from './pool-manager';

interface DeploymentDashboardProps {
  className?: string;
}

/**
 * Diamond Deployment Dashboard
 * 
 * Main dashboard component for managing Diamond contract deployments.
 * Integrates all hooks and provides a complete deployment interface.
 */
export function DeploymentDashboard({ className }: DeploymentDashboardProps) {
  // Hook integrations
  const deployment = useDiamondDeployment();
  const webSocket = useDeploymentWebSocket();
  const discovery = useContractDiscovery();
  const backend = useBackendConnection();
  
  // Organization and Pool management  
  const organization = useOrganization();
  const orgSelection = useOrganizationSelection(organization.organizations);
  const [selectedOrganization, setSelectedOrganization] = React.useState(null);

  // Connection status indicator
  const ConnectionStatus = () => (
    <div className="flex items-center gap-2">
      <div className={`size-2 rounded-full ${backend.connected ? 'bg-green-500' : 'bg-red-500'}`} />
      <span className="text-sm">
        Backend: {backend.connected ? 'Connected' : 'Disconnected'}
      </span>
      <div className={`size-2 rounded-full ${webSocket.connected ? 'bg-green-500' : 'bg-red-500'}`} />
      <span className="text-sm">
        WebSocket: {webSocket.connected ? 'Connected' : 'Disconnected'}
      </span>
    </div>
  );

  // Progress display
  const ProgressDisplay = () => {
    if (!deployment.isDeploying && !deployment.progress) return null;

    return (
      <Card className="mb-4">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            🚀 Deployment Progress
            <Badge variant={deployment.status?.status === DEPLOYMENT_STATUSES.COMPLETED ? 'default' : 'secondary'}>
              {deployment.status?.status || 'In Progress'}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {deployment.progress && (
            <>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>{deployment.progress.currentStep}</span>
                  <span>{formatProgress(deployment.progress.progress)}</span>
                </div>
                <Progress value={deployment.progress.progress} className="w-full" />
                <div className="text-xs text-muted-foreground">
                  Step {deployment.progress.stepsCompleted} of {deployment.progress.totalSteps}
                </div>
              </div>
            </>
          )}
          
          {deployment.deploymentId && (
            <div className="rounded bg-muted p-2 font-mono text-xs">
              Deployment ID: {deployment.deploymentId}
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  // Error display
  const ErrorDisplay = () => {
    const errors = [deployment.error, backend.error, discovery.error].filter(Boolean);
    
    if (errors.length === 0) return null;

    return (
      <Alert variant="destructive" className="mb-4">
        <AlertTitle>Errors</AlertTitle>
        <AlertDescription>
          <ul className="list-inside list-disc space-y-1">
            {errors.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        </AlertDescription>
      </Alert>
    );
  };

  // Contract discovery tab
  const DiscoveryTab = () => (
    <TabsContent value="discovery" className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Contract Discovery</CardTitle>
          <CardDescription>
            Scan and discover Diamond facets for deployment
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button 
            onClick={() => discovery.scanContracts()}
            disabled={discovery.isScanning}
          >
            {discovery.isScanning ? 'Scanning...' : 'Scan Contracts'}
          </Button>

          {discovery.discovery && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                <div className="text-center">
                  <div className="text-2xl font-bold">{discovery.discovery.summary.totalFacets}</div>
                  <div className="text-sm text-muted-foreground">Total Facets</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{discovery.discovery.totalFunctions}</div>
                  <div className="text-sm text-muted-foreground">Functions</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{discovery.discovery.summary.categorization.core.length}</div>
                  <div className="text-sm text-muted-foreground">Core</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{discovery.discovery.summary.categorization.business.length}</div>
                  <div className="text-sm text-muted-foreground">Business</div>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-semibold">Discovered Facets</h4>
                <div className="grid gap-2">
                  {discovery.discovery.facets.map((facet) => (
                    <Card key={facet.name} className="p-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium">{facet.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {facet.functions.length} functions
                          </div>
                        </div>
                        <Badge variant="outline">
                          {Object.entries(discovery.discovery.summary.categorization)
                            .find(([_, facets]) => facets.includes(facet.name))?.[0] || 'other'}
                        </Badge>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </TabsContent>
  );

  // Deployment tab
  const DeploymentTab = () => (
    <TabsContent value="deployment" className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Deploy Diamond</CardTitle>
          <CardDescription>
            Execute Diamond contract deployment
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4">
            <Button
              onClick={() => {
                if (discovery.discovery) {
                  deployment.deploy({
                    network: 'localhost',
                    facets: discovery.discovery.facets,
                    dryRun: true
                  });
                }
              }}
              disabled={deployment.isDeploying || !discovery.discovery}
              variant="outline"
            >
              🧪 Dry Run Deployment
            </Button>

            <Button
              onClick={() => {
                if (discovery.discovery) {
                  deployment.deployRealtime({
                    network: 'localhost',
                    facets: discovery.discovery.facets,
                    dryRun: false
                  });
                }
              }}
              disabled={deployment.isDeploying || !discovery.discovery || !webSocket.connected}
            >
              🚀 Real-time Deployment
            </Button>
          </div>

          {!webSocket.connected && (
            <Alert>
              <AlertDescription>
                WebSocket connection required for real-time deployment updates
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </TabsContent>
  );

  // Network status tab
  const NetworkTab = () => (
    <TabsContent value="networks" className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Networks</CardTitle>
          <CardDescription>
            Available deployment networks
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2">
            {Object.entries(backend.networks).map(([name, network]) => (
              <Card key={name} className="p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">{network.name}</div>
                    <div className="text-sm text-muted-foreground">
                      Chain ID: {network.chainId}
                    </div>
                  </div>
                  <Badge variant={network.supported ? 'default' : 'secondary'}>
                    {network.supported ? 'Supported' : 'Unavailable'}
                  </Badge>
                </div>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </TabsContent>
  );

  // Organizations tab
  const OrganizationsTab = () => (
    <TabsContent value="organizations" className="space-y-4">
      <OrganizationManager onOrganizationSelect={orgSelection.selectOrganization} />
    </TabsContent>
  );

  // Pools tab
  const PoolsTab = () => (
    <TabsContent value="pools" className="space-y-4">
      <PoolManager 
        selectedOrganization={orgSelection.selectedOrganization}
      />
    </TabsContent>
  );

  return (
    <div className={className}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold">💎 Diamond Deployment</h1>
            <p className="text-muted-foreground">
              Deploy and manage EIP-2535 Diamond contracts
            </p>
          </div>
          <ConnectionStatus />
        </div>

        {/* Progress and Errors */}
        <ErrorDisplay />
        <ProgressDisplay />

        {/* Main Content */}
        <Tabs defaultValue="discovery" className="space-y-4">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="discovery">🔍 Discovery</TabsTrigger>
            <TabsTrigger value="deployment">🚀 Deploy</TabsTrigger>
            <TabsTrigger value="organizations">🏢 Organizations</TabsTrigger>
            <TabsTrigger value="pools">🔄 Pools</TabsTrigger>
            <TabsTrigger value="networks">🌐 Networks</TabsTrigger>
          </TabsList>

          <DiscoveryTab />
          <DeploymentTab />
          <OrganizationsTab />
          <PoolsTab />
          <NetworkTab />
        </Tabs>
      </div>
    </div>
  );
}