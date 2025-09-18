/**
 * Demo Client - Development Environment Endpoints
 * 
 * Based on MCP verification and testing - only verified working endpoints included
 * These endpoints have been tested and confirmed to work reliably
 */

interface EndpointConfig {
  name: string;
  path: string;
  description: string;
  expectedElements: string[];
  isMainDashboard?: boolean;
  isExternal?: boolean;
  externalUrl?: string;
  timeout?: number;
  roles?: string[];
  environments?: string[];
  verified?: boolean;
  priority?: 'critical' | 'high' | 'medium' | 'low';
}

interface ClientEndpointConfig {
  clientId: string;
  clientName: string;
  environments: {
    [env: string]: {
      baseUrl: string;
      endpoints: EndpointConfig[];
    };
  };
}

const demoDevEndpoints: EndpointConfig[] = [
  {
    name: 'Dashboard',
    path: '/Index',
    description: 'Main dashboard with module navigation',
    expectedElements: ['Demo', 'David Lenzen', 'Corporate Admin'],
    isMainDashboard: true,
    timeout: 90000,
    roles: ['admin', 'dealer', 'distributor'],
    environments: ['dev', 'test', 'uat', 'prod'],
    verified: true,
    priority: 'critical'
  },
  {
    name: 'Ads & Assets',
    path: '/Adbuilder/Ads/AdbuilderHome',
    description: 'AdBuilder interface with marketing assets and templates',
    expectedElements: ['Marketing Assets', 'Create An Ad', 'My Library', 'AdBuilder'],
    timeout: 90000,
    roles: ['admin'],
    environments: ['dev', 'test', 'uat', 'prod'],
    verified: true,
    priority: 'high'
  },
  {
    name: 'Brand Shop',
    path: '/PopShop/Dashboard',
    description: 'Online Marketing Store with e-commerce functions',
    expectedElements: ['Online Marketing Store', 'Add New Item', 'Order Summary', 'New Order'],
    timeout: 90000,
    roles: ['admin'],
    environments: ['dev', 'test', 'uat', 'prod'],
    verified: true,
    priority: 'high'
  },
  {
    name: 'EngageHQ',
    path: '/Engage/EngageHQ',
    description: 'Customer engagement and communication platform',
    expectedElements: ['Engage'],
    timeout: 90000,
    roles: ['admin'],
    environments: ['dev', 'test', 'uat'],
    verified: true,
    priority: 'medium'
  },
  {
    name: 'Fund Management',
    path: '/CoopManagement/Dashboard',
    description: 'Cooperative advertising management and tracking',
    expectedElements: ['Fund', 'Management', 'Coop'],
    timeout: 90000,
    roles: ['admin'],
    environments: ['dev', 'test', 'uat'],
    verified: true,
    priority: 'medium'
  },
  {
    name: 'Incentives',
    path: '/Rewards/Incentives/Dashboard/IncentiveDashboard',
    description: 'Incentive program management and tracking',
    expectedElements: ['Incentive', 'Dashboard'],
    timeout: 90000,
    roles: ['admin'],
    environments: ['dev', 'test', 'uat'],
    verified: true,
    priority: 'medium'
  },
  
  // Additional endpoints that exist but may not be fully verified
  {
    name: 'LMS',
    path: '/LMS/Core/Course/view/CourseListing',
    description: 'Learning Management System for training and education',
    expectedElements: ['Course', 'LMS', 'Learning'],
    timeout: 90000,
    roles: ['admin'],
    environments: ['dev', 'test', 'uat'],
    verified: false, // Not verified yet
    priority: 'low'
  },
  {
    name: 'Rebates',
    path: '/Rebates',
    description: 'External rebate management system',
    expectedElements: ['Rebate'],
    isExternal: true,
    externalUrl: 'https://corerebatesdemouat.channel-fusion.com/Admin/CampaignList',
    timeout: 90000,
    roles: ['admin'],
    environments: ['dev', 'test', 'uat'],
    verified: false, // External URL - requires special handling
    priority: 'low'
  },
  {
    name: 'Rewards',
    path: '/Rewards/Brand/Dashboard/Index',
    description: 'Brand rewards and loyalty program management',
    expectedElements: ['Reward', 'Brand'],
    timeout: 90000,
    roles: ['admin'],
    environments: ['dev', 'test', 'uat'],
    verified: false, // Not verified yet
    priority: 'low'
  },
  {
    name: 'SPIFF',
    path: '/Rewards/SPIFF/Default',
    description: 'Sales Performance Incentive Fund management',
    expectedElements: ['SPIFF'],
    timeout: 90000,
    roles: ['admin'],
    environments: ['dev', 'test', 'uat'],
    verified: false, // Not verified yet
    priority: 'low'
  },
  {
    name: 'Resources',
    path: '/Support/Guidelines/DocumentLibrary/DocListing',
    description: 'Document library and resource management',
    expectedElements: ['Document', 'Resource', 'Library'],
    timeout: 90000,
    roles: ['admin', 'dealer', 'distributor'],
    environments: ['dev', 'test', 'uat', 'prod'],
    verified: false, // Not verified yet
    priority: 'low'
  }
];

const demoDevConfig: ClientEndpointConfig = {
  clientId: 'demo',
  clientName: 'Demo Portal',
  environments: {
    dev: {
      baseUrl: 'https://demoportaldev.channel-fusion.com',
      endpoints: demoDevEndpoints
    }
  }
};

module.exports = demoDevConfig;
