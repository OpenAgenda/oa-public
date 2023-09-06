# @openagenda/mails-editor

Edit your email templates easily.

[MJML](https://mjml.io/) + [EJS](http://ejs.co/) + [Nodemailer](https://nodemailer.com/about/) = :heart:

## Getting Started

This project allows you to create templates with preview and refresh in real time.

### Installing

```bash
yarn add -D @openagenda/mails-editor

# or `npm i -D @openagenda/mails-editor`
```

[@openagenda/mails](https://www.npmjs.com/package/@openagenda/mails) is a peerDependency, you need to install it:

```bash
yarn add @openagenda/mails
```

### Launching app

The templates used by `oa-mails-editor` come from a folder defined by the `MAILS_TEMPLATES_DIR` environment variable or with the first argument of the command.

The simpliest method is to run `oa-mails-editor` from the root of your project and navigate to [http://localhost:3000](http://localhost:3000).  
The home page is the list of templates available in the chosen folder (`./templates` by default), once on the template to edit you just have to save your changes to see the changes in your browser.
