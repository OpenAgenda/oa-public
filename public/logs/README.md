# Overview

This logger lib adds some functionality to the base winston library:

- log function generator with namespace initialization
- value loader to be reprinted at each subsequent log (for example, if the log function is attached to the req object, it is useful to load user data once only and have it reprinted at each following log)

## API

### Initialization

#### `init( config )`

Initialization must be done before any call of **basic logger**.

`config`:

- namespace: _(string)_ namespace for the basic logger
- debug:
  - enable: _(string|false)_
  - prefix: _(string)_ the prefix used before all namespaces for the debug logs (eg: `oa:`)
- token: _(string)_ aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee

#### `setModuleConfig( config )`

Can be used as an **init** inside each module to modify the configuration of all the loggers used in this module.

### Enable debug

You can enable the debug log display with the environment variable `DEBUG`, for example:

```bash
DEBUG=service* yarn test
```

### Basic logger

The basic logger is available by doing:

```js
const log = require('logs');
```

### Namespaced logger

A namespaced logger is gettable by doing:

```js
const log = require('logs')('namespace');

// or

const log = require('logs')('namespace', preloadedData);
```

### Common methods

_Usable with basic logger and namespaced loggers._

- `setConfig( config )`: configure the transports of logger with a specific new config, same shape of config as in init

- `loadMetadata( data )`: preload metadata

- `clearMetadata()`: clear preloaded metadata

- `getTransports()`: get the transports used by logger, can be `{ debug, logentries }`

#### Logging methods

Each level is given a specific integer priority. The higher the priority the more important the message is considered to be, and the lower the corresponding integer priority. For example, npm logging levels are prioritized from 0 to 5 (highest to lowest):

```
{ error: 0, warn: 1, info: 2, verbose: 3, debug: 4, silly: 5 }
```

`logger( 'error', 'message %s %j %d', ...placeholderTokens, meta )`  
`logger( 'warn', 'message %s %j %d', ...placeholderTokens, meta )`  
`logger( 'info', 'message %s %j %d', ...placeholderTokens, meta )`  
`logger( 'verbose', 'message %s %j %d', ...placeholderTokens, meta )`  
`logger( 'debug', 'message %s %j %d', ...placeholderTokens, meta )`

`logger.error( 'message %s %j %d', ...placeholderTokens, meta )`  
`logger.warn( 'message %s %j %d', ...placeholderTokens, meta )`  
`logger.info( 'message %s %j %d', ...placeholderTokens, meta )`  
`logger.verbose( 'message %s %j %d', ...placeholderTokens, meta )`  
`logger.debug( 'message %s %j %d', ...placeholderTokens, meta )`

`logger.log( 'error', 'message %s %j %d', ...placeholderTokens, meta )`  
`logger.log( 'warn', 'message %s %j %d', ...placeholderTokens, meta )`  
`logger.log( 'info', 'message %s %j %d', ...placeholderTokens, meta )`  
`logger.log( 'verbose', 'message %s %j %d', ...placeholderTokens, meta )`  
`logger.log( 'debug', 'message %s %j %d', ...placeholderTokens, meta )`

The message argument can be omitted for log only metadata.

The message argument is a string containing zero or more _placeholder_ tokens. Each placeholder token is replaced with the converted value from the corresponding argument. Supported placeholders are:

%s - String.  
%d - Number (integer or floating point value).  
%i - Integer.  
%f - Floating point value.  
%j - JSON. Replaced with the string '[Circular]' if the argument contains circular references.  
%% - single percent sign ('%'). This does not consume an argument.

If the placeholder does not have a corresponding argument, the placeholder is not replaced.

To log an error you can use one of the following methods:

```js
logs('error', new Error('Une erreur ici !'));
/*
Error: Une erreur ici !
  at Context.it (/home/bertho/OpenAgenda/logs/test/index.js:133:45)
  at callFn (/usr/local/lib/node_modules/mocha/lib/runnable.js:326:21)
  at Test.Runnable.run (/usr/local/lib/node_modules/mocha/lib/runnable.js:319:7)
  at Runner.runTest (/usr/local/lib/node_modules/mocha/lib/runner.js:422:10)
  at /usr/local/lib/node_modules/mocha/lib/runner.js:528:12
  at next (/usr/local/lib/node_modules/mocha/lib/runner.js:342:14)
  at /usr/local/lib/node_modules/mocha/lib/runner.js:352:7
  at next (/usr/local/lib/node_modules/mocha/lib/runner.js:284:14)
  at Immediate.<anonymous> (/usr/local/lib/node_modules/mocha/lib/runner.js:320:5)
  at runCallback (timers.js:789:20)
  at tryOnImmediate (timers.js:751:5)
  at processImmediate [as _immediateCallback] (timers.js:722:5) +0ms
*/

logs('error', 'On a eu une erreur:', new Error('Une erreur ici !'));
/*
On a eu une erreur: Error: Une erreur ici !
  at Context.it (/home/bertho/OpenAgenda/logs/test/index.js:133:45)
  at callFn (/usr/local/lib/node_modules/mocha/lib/runnable.js:326:21)
  at Test.Runnable.run (/usr/local/lib/node_modules/mocha/lib/runnable.js:319:7)
  at Runner.runTest (/usr/local/lib/node_modules/mocha/lib/runner.js:422:10)
  at /usr/local/lib/node_modules/mocha/lib/runner.js:528:12
  at next (/usr/local/lib/node_modules/mocha/lib/runner.js:342:14)
  at /usr/local/lib/node_modules/mocha/lib/runner.js:352:7
  at next (/usr/local/lib/node_modules/mocha/lib/runner.js:284:14)
  at Immediate.<anonymous> (/usr/local/lib/node_modules/mocha/lib/runner.js:320:5)
  at runCallback (timers.js:789:20)
  at tryOnImmediate (timers.js:751:5)
  at processImmediate [as _immediateCallback] (timers.js:722:5) +0ms
*/

logs('error', 'On a eu une erreur: %s', new Error('Une erreur ici !')); // Logs only message of the error
/*
On a eu une erreur: Error: Une erreur ici !
*/
```
