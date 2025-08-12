# Diamond Deployment Integration

Frontend integration for Diamond Pattern (EIP-2535) deployment system.

## Features

- 🔍 **Contract Discovery** - Auto-detect Diamond facets from compiled contracts
- 🚀 **Deployment Management** - Validate, simulate, and deploy Diamond contracts  
- ⚡ **Real-time Updates** - WebSocket connection for live deployment progress
- 🎯 **Network Support** - Local Anvil, testnets, and mainnet deployment
- 📊 **Progress Tracking** - Detailed deployment steps and gas estimation

## Structure

```
diamond-deployment/
├── api/              # Backend API integration
├── components/       # React UI components
├── hooks/           # Custom React hooks
├── utils/           # Utility functions and types
└── client.ts        # Backend client configuration
```

## Usage

```tsx
import { useDiamondDeployment } from '@/integrations/diamond-deployment'

function DeploymentPage() {
  const { deploy, progress, isDeploying } = useDiamondDeployment()
  
  return (
    <div>
      <button onClick={() => deploy(config)}>
        Deploy Diamond
      </button>
      {isDeploying && <ProgressBar value={progress} />}
    </div>
  )
}
```

## Hooks

- `useDiamondDeployment` - Main deployment management
- `useContractDiscovery` - Facet scanning and discovery
- `useDeploymentWebSocket` - Real-time updates
- `useBackendConnection` - Backend API connection

## Integration with Backend

Connects to Diamond Deployment Backend APIs at `http://localhost:3000/api/deploy/`:

- `POST /validate` - Configuration validation
- `POST /simulate` - Deployment simulation  
- `POST /execute` - Deployment execution
- `POST /realtime` - Real-time deployment with WebSocket
- `GET /networks` - Supported networks
- `GET /status` - WebSocket service status