# Overview

This library provides functionalities to build a fully customizable events website that relies on an OpenAgenda JSON export as its events data source. Good working knowledge of sass, css and html is sufficient to get a customized website running.

[Handlebars](https://handlebarsjs.com/) is the main templating engine.
[Sass](https://sass-lang.com/) for styling. The default template uses [Bootstrap 4](https://getbootstrap.com/docs/4.0/getting-started/theming/)

# Getting started

Create a new project and agenda-portal in your dependencies:

    yarn init --yes
    yarn add @openagenda/agenda-portal

To get your project quickly operational, copy the contents of the dev folder of the agenda-portal library to your project directory. This will allow you to get a site to run at the launch of a command

    cp -R node_modules/@openagenda/agenda-portal/dev/* ./

Last step, add the launch command to a scripts section of your `package.json` file

    "scripts" : {
      "start": "NODE_ENV=development browser-refresh dev/server"
    }

