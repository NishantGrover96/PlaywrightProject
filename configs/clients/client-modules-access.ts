/**
 * Client Module Access Configuration
 *
 * This configuration defines which modules each client has access to in the SaaS platform.
 * The structure supports dynamic test execution based on client-specific access permissions.
 */

export interface ModuleConfig {
  name: string;
  path: string;
  isExternal?: boolean;
  externalUrl?: string;
  description: string;
  features?: string[];
}

export interface ClientConfig {
  clientId: string;
  clientName: string;
  baseUrl: string; // Default URL (can be overridden by environment)
  loginUrl: string; // Default login URL
  environments?: {
    [key: string]: {
      baseUrl: string;
      loginUrl: string;
    };
  };
  credentials: {
    username: string;
    password: string;
  };
  modules: ModuleConfig[];
}

export const clientModulesConfig: ClientConfig[] = [
  {
    clientId: 'demo',
    clientName: 'Demo Portal',
    baseUrl: 'https://demoportaldev.channel-fusion.com', // Default URL (dev)
    loginUrl: 'https://demoportaldev.channel-fusion.com/account/login', // Default login URL
    environments: {
      dev: {
        baseUrl: 'https://demoportaldev.channel-fusion.com',
        loginUrl: 'https://demoportaldev.channel-fusion.com/account/login',
      },
      uat: {
        baseUrl: 'https://demoportaluat.channel-fusion.com',
        loginUrl: 'https://demoportaluat.channel-fusion.com/account/login',
      },
      prod: {
        baseUrl: 'https://demoportal.channel-fusion.com',
        loginUrl: 'https://demoportal.channel-fusion.com/account/login',
      },
    },
    credentials: {
      username: 'admin@channel-fusion.com', // Admin credentials for dev/uat
      password: 'Cfusion2016',
    },
    modules: [
      {
        name: 'Dashboard',
        path: '/Index',
        description: 'Main dashboard with module navigation and recent activities',
        features: ['Module Navigation', 'User Profile', 'Recent Activities', 'Notifications'],
      },
      {
        name: 'Ads & Assets',
        path: '/Adbuilder/Ads/AdbuilderHome',
        description: 'AdBuilder interface with marketing assets and templates',
        features: ['Marketing Assets', 'Create An Ad', 'My Library', 'Template Management'],
      },
      {
        name: 'Brand Shop',
        path: '/PopShop/Dashboard',
        description: 'Online Marketing Store with e-commerce functions',
        features: ['Add New Item', 'Order Summary', 'New Order', 'Item Management'],
      },
      {
        name: 'EngageHQ',
        path: '/Engage/EngageHQ',
        description: 'Customer engagement and communication platform',
        features: ['Communication Tools', 'Engagement Analytics', 'Customer Interaction', 'Messaging'],
      },
      {
        name: 'Fund Management',
        path: '/CoopManagement/Dashboard',
        description: 'Cooperative advertising management and tracking',
        features: ['Campaign Setup', 'Budget Management', 'Approval Workflow', 'Performance Tracking'],
      },
      {
        name: 'Incentives',
        path: '/Rewards/Incentives/Dashboard/IncentiveDashboard',
        description: 'Incentive program management and tracking',
        features: ['Program Setup', 'Participant Management', 'Reward Distribution', 'Performance Analytics'],
      },
      {
        name: 'LMS',
        path: '/LMS/Core/Course/View/CourseListing',
        description: 'Learning Management System for training and education',
        features: ['Course Creation', 'Student Management', 'Progress Tracking', 'Assessments', 'Certifications'],
      },
      {
        name: 'Rebates',
        path: '/Rebate/Dashboard',
        description: 'Rebate management system for processing claims and campaigns',
        features: ['Rebate Campaigns', 'Claim Processing', 'Approval Workflow', 'Reporting'],
      },
      {
        name: 'Rewards',
        path: '/Rewards/Brand/Dashboard/Index',
        description: 'Brand rewards and loyalty program management',
        features: ['Reward Programs', 'Point Management', 'Redemption Tracking', 'Member Management'],
      },
      {
        name: 'SPIFF',
        path: '/Rewards/SPIFF/Default',
        description: 'Sales Performance Incentive Fund management',
        features: ['SPIFF Programs', 'Sales Tracking', 'Incentive Calculation', 'Payout Management'],
      },
      {
        name: 'Reports',
        path: '/Reports/ReportList',
        description: 'Analytics and reporting dashboard for business insights',
        features: ['Business Reports', 'Analytics Dashboard', 'Export Options', 'Data Visualization'],
      },
      {
        name: 'Resources',
        path: '/Support/Guidelines/DocumentLibrary/DocListing',
        description: 'Document library and resource management',
        features: ['Document Storage', 'Resource Sharing', 'Version Control', 'Access Management'],
      },
    ],
  },
  {
    clientId: 'hankook',
    clientName: 'Hankook Portal',
    baseUrl: 'https://dev2.channel-fusion.com', // Default URL (dev)
    loginUrl: 'https://dev2.channel-fusion.com/account/login', // Default login URL
    environments: {
      dev: {
        baseUrl: 'https://dev2.channel-fusion.com',
        loginUrl: 'https://dev2.channel-fusion.com/account/login',
      },
      uat: {
        baseUrl: 'https://hankookportaluat.channel-fusion.com',
        loginUrl: 'https://hankookportaluat.channel-fusion.com/Account/Login.aspx',
      },
    },
    credentials: {
      username: 'admin@channel-fusion.com', // Admin credentials for dev/uat
      password: 'Hankook_2019',
    },
    modules: [
      {
        name: 'Ads & Assets',
        path: '/AdBuilder/Ads/AdbuilderHome',
        description: 'Create and manage advertising assets and campaigns',
        features: ['Ad Creation', 'Asset Management', 'Campaign Management'],
      },
      {
        name: 'Brand Shop',
        path: '/PopShop/Dashboard',
        description: 'E-commerce platform for branded merchandise and products',
        features: ['Product Catalog', 'Shopping Cart', 'Order Management'],
      },
      {
        name: 'Coop Management',
        path: '/CoopManagement/Dashboard',
        description: 'Cooperative advertising management and tracking',
        features: ['Campaign Setup', 'Budget Management', 'Approval Workflow'],
      },
      {
        name: 'Incentives',
        path: '/Rewards/Incentives/Dashboard/IncentiveDashboard',
        description: 'Incentive program management and tracking',
        features: ['Program Setup', 'Participant Management', 'Reward Distribution'],
      },
      {
        name: 'SPIFF',
        path: '/Rewards/SPIFF/Default',
        description: 'Sales Performance Incentive Fund management',
        features: ['SPIFF Programs', 'Sales Tracking', 'Incentive Calculation'],
      },
      {
        name: 'CMS Control',
        path: '/Admin/CMS/Slider/list',
        description: 'Content Management System control panel',
        features: ['Content Management', 'Slider Control', 'Page Management', 'Media Management'],
      },
      {
        name: 'Reports',
        path: '/Reports/ReportList',
        description: 'Reporting and analytics dashboard',
        features: ['Custom Reports', 'Data Analytics', 'Performance Metrics', 'Export Functions'],
      },
      {
        name: 'Resources',
        path: '/Support/Guidelines/DocumentLibrary/DocListing',
        description: 'Document library and resource management',
        features: ['Document Storage', 'Resource Sharing', 'Guidelines'],
      },
      {
        name: 'Support',
        path: '/Support/ContactUs',
        description: 'Support and contact management',
        features: ['Contact Forms', 'Support Tickets', 'Help Documentation'],
      },
    ],
  },
];
