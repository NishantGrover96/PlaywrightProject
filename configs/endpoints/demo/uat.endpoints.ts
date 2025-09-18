import { ClientEndpointConfig } from '../endpoint-manager';
const demoDevConfig = require('./dev.endpoints');

/**
 * Demo Client - UAT Environment Endpoints
 * 
 * Inherits from dev endpoints but with UAT environment URL
 * UAT typically has most functionality available for testing
 */

const demoUatConfig: ClientEndpointConfig = {
  clientId: 'demo',
  clientName: 'Demo Portal',
  environments: {
    uat: {
      baseUrl: 'https://demoportaluat.channel-fusion.com',
      endpoints: demoDevConfig.environments.dev.endpoints.map((endpoint: any) => ({
        ...endpoint,
        // UAT usually has similar functionality to dev
        verified: endpoint.priority === 'critical' || endpoint.priority === 'high' ? endpoint.verified : false
      }))
    }
  }
};

module.exports = demoUatConfig;
