import { ClientEndpointConfig } from '../endpoint-manager';
const demoDevConfig = require('./dev.endpoints');

/**
 * Demo Client - Production Environment Endpoints
 *
 * Production environment - only critical and high priority endpoints
 * More restrictive than other environments
 */

const demoProdConfig: ClientEndpointConfig = {
  clientId: 'demo',
  clientName: 'Demo Portal',
  environments: {
    prod: {
      baseUrl: 'https://demoportal.channel-fusion.com',
      endpoints: demoDevConfig.environments.dev.endpoints
        .filter((endpoint: any) => endpoint.priority === 'critical' || endpoint.priority === 'high')
        .map((endpoint: any) => ({
          ...endpoint,
          // Only verified critical/high priority endpoints in prod
          verified: endpoint.priority === 'critical' ? true : false,
        })),
    },
  },
};

module.exports = demoProdConfig;
