import { ClientEndpointConfig, EndpointConfig } from '../endpoint-manager';

/**
 * Hankook Client - Development Environment Endpoints
 *
 * Placeholder configuration - endpoints need to be verified for Hankook client
 */

const hankookDevEndpoints: EndpointConfig[] = [
  {
    name: 'Dashboard',
    path: '/Index',
    description: 'Main dashboard with module navigation',
    expectedElements: ['Hankook', 'Dashboard'],
    isMainDashboard: true,
    timeout: 90000,
    roles: ['admin', 'dealer', 'distributor'],
    environments: ['dev', 'test', 'uat', 'prod'],
    verified: false, // Needs verification for Hankook
    priority: 'critical',
  },
  // Add more endpoints as they are verified for Hankook client
];

const hankookDevConfig: ClientEndpointConfig = {
  clientId: 'hankook',
  clientName: 'Hankook Portal',
  environments: {
    dev: {
      baseUrl: 'https://hankookdev.channel-fusion.com', // Placeholder URL
      endpoints: hankookDevEndpoints,
    },
  },
};

export default hankookDevConfig;
