# Overview

Generate a form based on a given FormSchema. This service does that specifically to generate a survey form and store the submitted data.

The service provides to an integrating app:
  * a sub express app to be set on a pre-defined route
  * a client-side dist js file.

The service is given a layout template at initialization which it uses to set the app canvas and a reference to the dist js client file.

In development, a testServer.js app replaces the integrating app and implements a webpack config to allow for hot module replacement.

The integrating app is responsible for:

 * providing a sub-route for the service
 * initializing the service with:
   * store connection info
   * the path of the dist client js file