/**
 * Global Endpoint Configuration Interface
 * 
 * This defines the structure for all endpoint configurations across clients and environments
 */

export interface EndpointConfig {
  name: string;
  path: string;
  description: string;
  expectedElements: string[];
  isMainDashboard?: boolean;
  isExternal?: boolean;
  externalUrl?: string;
  timeout?: number;
  roles?: string[]; // Which roles can access this endpoint
  environments?: string[]; // Which environments this endpoint is available in
  verified?: boolean; // Whether this endpoint has been verified through testing
  priority?: 'critical' | 'high' | 'medium' | 'low'; // For smoke test prioritization
}

export interface ClientEndpointConfig {
  clientId: string;
  clientName: string;
  environments: {
    [env: string]: {
      baseUrl: string;
      endpoints: EndpointConfig[];
    };
  };
}

/**
 * Endpoint Manager - Dynamic endpoint resolution
 */
export class EndpointManager {
  
  /**
   * Get endpoints for a specific client and environment
   */
  static getEndpoints(
    clientId: string,
    environment: string,
    role?: string,
    onlyVerified?: boolean
  ): EndpointConfig[] {
    try {
      // Dynamic require based on client
      const config: ClientEndpointConfig = require(`./${clientId}/${environment}.endpoints`);
      
      if (!config.environments[environment]) {
        throw new Error(`Environment ${environment} not found for client ${clientId}`);
      }
      
      let endpoints = config.environments[environment].endpoints;
      
      // Filter by role if specified
      if (role) {
        endpoints = endpoints.filter(endpoint => 
          !endpoint.roles || endpoint.roles.includes(role)
        );
      }
      
      // Filter to only verified endpoints if requested
      if (onlyVerified) {
        endpoints = endpoints.filter(endpoint => endpoint.verified === true);
      }
      
      return endpoints;
      
    } catch (error) {
      console.error(`Failed to load endpoints for ${clientId}-${environment}:`, error);
      return [];
    }
  }
  
  /**
   * Get verified working endpoints for smoke tests
   */
  static getVerifiedEndpoints(
    clientId: string,
    environment: string,
    role?: string
  ): EndpointConfig[] {
    return this.getEndpoints(clientId, environment, role, true);
  }
  
  /**
   * Get critical endpoints that must work
   */
  static getCriticalEndpoints(
    clientId: string,
    environment: string,
    role?: string
  ): EndpointConfig[] {
    const endpoints = this.getEndpoints(clientId, environment, role);
    return endpoints.filter(endpoint => endpoint.priority === 'critical');
  }
  
  /**
   * Get base URL for client and environment
   */
  static getBaseUrl(clientId: string, environment: string): string {
    try {
      const config: ClientEndpointConfig = require(`./${clientId}/${environment}.endpoints`);
      
      return config.environments[environment]?.baseUrl || '';
      
    } catch (error) {
      console.error(`Failed to get base URL for ${clientId}-${environment}:`, error);
      return '';
    }
  }
}
