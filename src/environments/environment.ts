// This file contains environment-specific configuration.
// By default, it's configured for development with mock data.

export const environment = {
  /**
   * Use mock data for development when true.
   * Set to false to switch to using the live API.
   */
  useTestData: false,
  
  /**
   * When true, the payment page will show a "Place Mock Order" button
   * that skips the payment gateway and directly creates an order.
   * Set to false for production to use the real payment gateway.
   */
  skipPayment: true,

  /**
   * The base URL for the API.
   * This is used only when `useTestData` is false.
   */
  apiUrl: 'https://api-wddjmdzuzq-uc.a.run.app/api'
  // apiUrl: 'http://localhost:3000/api'

};