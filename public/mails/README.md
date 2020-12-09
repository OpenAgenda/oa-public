# @openagenda/mails

Build and send responsive e-mails from Node.js.

[MJML](https://mjml.io/) + [EJS](http://ejs.co/) + [Nodemailer](https://nodemailer.com/about/) = :heart:

## Getting Started

This project allows you to send mails from templates.

### Installing

```bash
yarn add @openagenda/mails

# or `npm i @openagenda/mails`
```

### Initializing

Before using it you must initialize the service, the configuration needs to know where to find the templates, how to send them, then optionally the default values for each send (for example: *domain*, *lang*) and the translations of your templates.

```js
const createMails = require('@openagenda/mails');

/* Default configuration */

const config = {
  // Templating
  templatesDir: process.env.MAILS_TEMPLATES_DIR || path.join(__dirname, 'templates'),

  // Mailing
  transport: {
    pool: true,
    host: '127.0.0.1',
    port: '1025', // Mailcatcher port
    maxMessages: Infinity,
    maxConnections: 20,
    rateLimit: 14, // 14 emails/second max
    rateDelta: 1000
  },
  defaults: {},

  // Localization
  translations: {
    labels: {},
    makeLabelGetter
  },

  // Queuing
  redis: {
    host: 'localhost',
    port: 6379
  },
  queueName: 'mails',
  disableVerify: false
};

const mails = await createMails(config)
  .catch(error => {
    console.log('Error on initializing service mails', error);
    throw error;
  });

console.log('Service mails initialized');
```

More details on the options in the [API section](#API).

### Example

```js
const { results, errors } = await mails.send({
  template: 'helloWorld',
  to: {
    address: 'user@example.com',
    data: { username: 'bertho' },
    lang: 'fr'
  }
});
```

### Building templates

See [@openagenda/mails-editor](https://www.npmjs.com/package/@openagenda/mails-editor)

#### Structure

Each template has a folder with its name, in there must be at least one file `index.mjml` and `fixtures.js`.

**index.mjml** is the entry point of your template, it can be split into different partials (see [`include`](https://github.com/mde/ejs#includes) of EJS).  
**text.ejs** is the text version of your template.  
**subject.ejs** is the subject of the mail corresponding to your template.  
**fixtures.js** exports data that are used in the template to preview as in production. If you use translations with dev app you can put your labels in a `$labels` key and add a `__` custom method if you need it.

The structure of your templates folder can look like this:
```
/templates
  /helloWorld
    fixtures.js
    index.mjml
    text.ejs
    subject.ejs
  /accountActivation
    fixtures.js
    index.mjml
    text.ejs
    subject.ejs
``` 

## API

### Configuration

#### `createMails(options)`

**Usage**
```js
const createMails = require('@openagenda/mails');

/* Dafault values */

const mails = await createMails({
  // Templating
  templatesDir: process.env.MAILS_TEMPLATES_DIR || path.join(process.cwd(), 'templates'),

  // Mailing
  transport: {
    pool: true,
    host: '127.0.0.1',
    port: '1025',
    maxMessages: Infinity,
    maxConnections: 20,
    rateLimit: 14, // 14 emails/second max
    rateDelta: 1000
  },
  defaults: {},

  // Localization
  translations: {
    labels: {},
    makeLabelGetter
  },

  // Queuing
  redis: {
    host: 'localhost',
    port: 6379
  },
  queueName: 'mails'
});
```

**Arguments**

| Name | Type | Description |
|---|:---:|---|
| `options` | `Object` | The options to initializing the service. |

**options**

Value | Required | Description |
|---|:---:|---|
|`templatesDir` | * | The folder path containing your templates.
|`transport` | * | An object that defines connection data, it's the first argument of `nodemailer.createTransport` ([SMTP](https://nodemailer.com/smtp/) or [other](https://nodemailer.com/transports/)).
|`defaults` |  | An object that is going to be merged into every message object. This allows you to specify shared options, for example to set the same _from_ address for every message. It's the second argument of `nodemailer.createTransport`.
|`translations` |  | An object containing `labels` and `makeLabelGetter` keys. <br />- `labels` is an object of labels, one key per template. <br />- `makeLabelGetter(labels, defaultLang)` is a function that returns a function that can be called in templates with `__`. <br /><br />By default the `__` signature is `(name, values, lang)` and the values in the label are replaced when they are surrounded by `%`, for example a label like `Hello %username%` hope to receive `{ username }`
|`redis` | * | An object with your Redis connection data, which will be used to stack your mails in a queue. <br />`{ host, port }` ([@openagenda/queues](https://github.com/OpenAgenda/oa-public/tree/main/queues))
|`queueName` | * | A string that is the name of your Redis queue.
|`disableVerify` |  | A Boolean that allows to disable the verification of the transporter connection, it is done in the init.
|`logger` |  | An object for the method `setModuleConfig` of [@openagenda/logs](https://github.com/OpenAgenda/oa-public/tree/main/logs)

During initialization a `queue` and a `transporter` are added to the config, you can use them raw from anywhere with a require of `@openagenda/mails/config`.

### Mailing

#### `send(options)`

This is the main method, this function returns a Promise with one of these values:

- an array of Redis IDs if the queue is activated
- an array of nodemailer `sendMail` results if the queue is disabled

This is a nodemailer `sendMail` overload with some notable differences:

- You can use a template.
- The email addresses are validated before sending.
- The sending of emails is never grouped, the recipients of the messages are always separated, which makes it possible to attach data by recipient.
- Emails can be stored in an external queue while waiting for their turn.

**Usage**
```js
await mails({
  template: 'helloWorld',
  to: {
    address: 'user@example.com',
    data: { username: 'bertho' },
    lang: 'fr'
  },
  queue: false
});
```

**Arguments**

Name | Type | Description |
|---|:---:|---|
| `options` | `Object` | The options to sending email(s). |

***Options***

| Value | Required | Description |
|---|:---:|---|
| template |  | A string that is the name of the template, is equal to the folder name. |
| data |  | An object that contains the data to passed to the template, this can be overloaded for each recipient. |
| lang |  | A string that defines the default language that will be applied to all recipients without lang. |
| to | * | A recipient or array of recipients. |
| queue |  | A Boolean, if false do not queue job and execute directly. |
| **...** |  | **All other nodemailer options are normally handled by nodemailer, see the other options [here](https://nodemailer.com/message/).** |



***Error handling***  
`sendMail` does not throw an error in case of problem, it returns an object `{ results, errors }`.  
It allows not to block the sending of emails for all when there is only a malformed email address in the batch, for example.

***Recipients***  
You will find more information on the nodemailer documention (https://nodemailer.com/message/addresses/).  
The main difference is that the email is sent separately to each recipient, one mail/one recipient.  
If you want to add specific data to a recipient for the template (for example: its name, age, role, etc.) you must use an object with the data key, the language of the recipient can be in the lang key:
```js
{
  address: 'user@example.com',
  data: { username: 'bertho' },
  lang: 'fr'
}
```

***Defaults***  
It's an object that is going to be merged into every message object. This allows you to specify shared options, for example to set a default _from_ address for every message.

***Data order***  
The data come from several sources, they are `Object.assign`ed in this order:

 - `data` from the `send` options
 - `data` from the current recipient (`recipient.data`)
 - `data` from `defaults.data` lastly for conserve values like *domain*, etc

***Language***  
As for data, the language can be overloaded in several places, in this order:

 - `{ lang }` from `defaults`.
 - `lang` from the `send` options
 - `lang` from the current recipient (`recipient.lang`)

The `__` and `lang` values are passed to the template.

#### `task()`

If you can send a lot of messages it is better to use the Redis queue rather than the memory.

To use a `rateLimit` you will need to boot a transport with the `pool: true` option.  
Learn more at [Delivering bulk mail](https://nodemailer.com/usage/bulk-mail/) and [Pooled SMTP](https://nodemailer.com/smtp/pooled/)

Make sure to run the task before sending any email, just after the initialization looks correct.

`task` returns a promise that should **not** be waited.

**Usage**

```js
mails.task();
```

> **ProTip**: You can disable the queue for all email sends by setting `{ defaults: { queue: false } }` to initialization.

### Templating

The `render` and `compile` methods allow you to use your [MJML](https://mjml.io/) templates, coupled with [EJS](http://ejs.co/) for replacing variables and loops, among others.

These methods add `__` method in the data for use the translations in the templates, the labels are found with the `templateName` argument.  
You can pass your own translation method or overload the existing one with the data.

The `opts` argument corresponds to the EJS argument described [here](https://github.com/mde/ejs#options).

#### `render(templateName [, data = {}, opts = {}])`

Returns a Promise that resolves an Object containing three strings:
- `html`
- `text`
- `subject`.

**Arguments**

Name | Type | Description |
|---|:---:|---|
| `templateName` | `string` | The name of the template, is equal to the folder name. |
| `data` | `object` | An object that contains the data to passed to the template. |
| `options` | `Object` | The `opts` argument corresponds to the EJS argument described [here](https://github.com/mde/ejs#options). <br /><br />With the ability to add `disableHtml`, `disableText` and `disableSubject`, all three booleans. |

**Options**

| Value | Required | Description |
|---|:---:|---|
| disableHtml |  | A Boolean, if true then `html` is not rendered and is equal null. |
| disableText |  | A Boolean, if true then `text` is not rendered and is equal null. |
| disableSubject |  | A Boolean, if true then `subject` is not rendered and is equal null. |
| **...** |  | **All other EJS options are normally handled by EJS, see the other options [here](https://github.com/mde/ejs#options).** |

#### `compile(templateName [, opts = {}])`

Returns a Promise that resolves an Object containing three functions:
- `html(data)`
- `text(data)`
- `subject(data)`.

**Arguments**

Name | Type | Description |
|---|:---:|---|
| `templateName` | `string` | The name of the template, is equal to the folder name. |
| `options` | `Object` | The `opts` argument corresponds to the EJS argument described [here](https://github.com/mde/ejs#options). <br /><br />With the ability to add `disableHtml`, `disableText` and `disableSubject`, all three booleans. |

**Options**

| Value | Required | Description |
|---|:---:|---|
| disableHtml |  | A Boolean, if true then `html` is not compiled and is equal null. |
| disableText |  | A Boolean, if true then `text` is not compiled and is equal null. |
| disableSubject |  | A Boolean, if true then `subject` is not compiled and is equal null. |
| **...** |  | **All other EJS options are normally handled by EJS, see the other options [here](https://github.com/mde/ejs#options).** |

## Testing

### Running the tests

For a single run of all suites of tests:

```
yarn test
```
You can add the `--watch` option to watch the tests related to the files you modify, or `--watchAll` to run all tests with each change.

`--coverage` option is available to indicates that test coverage information should be collected and reported in the output.

These options are the most common, but you can use other [Jest CLI options](https://jestjs.io/docs/en/cli.html).

### Adding tests

If you want to create your own tests, you can refer to the [Testing SMTP](https://nodemailer.com/smtp/testing) section on the nodemailer documentation.
