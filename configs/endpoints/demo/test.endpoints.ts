import { ClientEndpointConfig } from '../endpoint-manager';
const demoDevConfig = require('./dev.endpoints');

/**
 * Demo Client - Test Environment Endpoints
 *
 * Inherits from dev endpoints but with test environment URL
 * Some endpoints may not be available in test environment
 */

const demoTestConfig: ClientEndpointConfig = {
  clientId: 'demo',
  clientName: 'Demo Portal',
  environments: {
    test: {
      baseUrl: 'https://demoportaltest.channel-fusion.com',
      endpoints: demoDevConfig.environments.dev.endpoints.map((endpoint: any) => ({
        ...endpoint,
        // Some endpoints may not be verified in test environment
        verified: endpoint.priority === 'critical' ? endpoint.verified : false,
      })),
    },
  },
};

module.exports = demoTestConfig;
