
// This file contains environment-specific configuration.
// By default, it's configured for development with mock data.

export const environment = {
  /**
   * Use mock data for development when true.
   * Set to false to switch to using the live API.
   */
  useTestData: false,
  
  /**
   * The base URL for the API.
   * This is used only when `useTestData` is false.
   */
  apiUrl: 'http://localhost:3000/api'
};
