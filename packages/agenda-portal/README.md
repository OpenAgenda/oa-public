# Overview

This library provides functionalities to build a fully customizable events website that relies on an OpenAgenda JSON export as its events data source. Good working knowledge of sass, css and html is sufficient to get a customized website running.

[Handlebars](https://handlebarsjs.com/) is the main templating engine.
[Sass](https://sass-lang.com/) for styling. The default template uses [Bootstrap 4](https://getbootstrap.com/docs/4.0/getting-started/theming/)


# Quick start

Here is a quick procedure to get you started on your agenda portal.

**Prerequisites**: You must have [nodejs](https://nodejs.org) installed. Install was done with [yarn](https://yarnpkg.com) so if you want to follow the procedure to the letter, install that too, but there is no reason why NPM should not work.

Create a new project and add agenda-portal in your dependencies:

    mkdir yourproject
    cd yourproject
    yarn init --yes
    yarn add @openagenda/agenda-portal

To get your project quickly operational, copy the contents of the dev folder of the agenda-portal library to your project directory. It contains templates and sass file to get you quickly started right await on a functional portal website:

    cp -RT node_modules/@openagenda/agenda-portal/dev/ .

Next step: add the launch command to a scripts section of your `package.json` file

    "scripts" : {
      "start": "NODE_ENV=development browser-refresh server"
    }

Open the `server.js` file. You'll find here a few parameters to tweak when the portal is created:

 * **uid**: the unique identifier of the agenda the portal will get its events from
 * **lang**: the main language of your portal
 * **key**: your OpenAgenda account public key ( available in your user settings ). By default, the script you copied looks for the content of an `oa.key` file: create the file at the root of your project and put your key in it.

Still in the same file, a final tweak to fix the reference to the portal library. Change:

    const Portal = require( '../' );

With:

    const Portal = require( '@openagenda/agenda-portal' );

... and your portal should be ready. Launch it with:

    yarn start

See it on your browser on port 3000 if you haven't changed the default port in `server.js`: [localhost:3000](localhost:3000)


# Options

## General options

These define general portal settings. Default options set in your `server.js` file are a good baseline.

 * **assets**: path to the assets folder
 * **cache**: Optional. Cache management related options. See below for details
 * **defaultFilter**: Optional. Set a filter to be applied to search when no other filter is set. For example: if featured events are displayed in a section other than the main list, it is not desired to load them in the list view at the first list load, to avoid displaying duplicate content.
 * **eventsPerPage**: Optional. Number of events to be loaded in the event list view. 20 is the default value
 * **eventParser**: Optional. event item parse function. Useful to transform event item data before it reaches the template
 * **key**: Required. OpenAgenda account public key
 * **lang**: Optional. Main portal language
 * **map**: map filter widget settings ( tiles, default center ... )
 * **root**: Required. website root. Used in production
 * **sass**: path to the sass folder
 * **uid**: Required. UID of the agenda
 * **views**: Required. Path to the handlebar views folder

## Cache options

 * **refreshInterval**: interval at which the cache is cleared. Every hour by default.

# Templates and style

When working on your portal, you should only really need to edit files that are either:

 * In your sass folder for styling
 * In your views folder for templating
 * In your assets folder for static assets such as images or javascripts


## Displaying a total

When the list is filtered, a javascript can update the displayed total dynamically. A hook class must be used on the element in which the total should go: `js_total`.

The default index template provides an example:

    <span
      class="js_total mr-2"
      data-total="{{total}}"
      data-label-none="Aucun événement ne correspond à cette recherche"
      data-label-one="1 événement" data-label-plural="%total% événements"></span>

# Miscellaneous

## Static pages

Any static page can be added by placing a file in a `pages` subfolder of the `views` folder. The path will be the same as the name of the file.

## Custom configuration

Values you add to the main Portal call in the server file are accessible in your templates. If you do this:

    Portal( {
      ...
      yourOwnKey: 'Well hello there'
      ...
    } );

You can access the value in a template like this:

    {{yourOwnKey}}

This is useful if you need to specify additional account keys, such as google analytics for example, or a facebook page url...


## Front javascript widgets

Look for the widgets folder in the sample partial templates for an example of implementation. These widgets provide navigation features:

 * **Map widget**: Placed next to the main event list, this widget allows filtering the events dynamically by navigating in the map.
 * **Calendar widget**: Placed next to the main event list, this widget provides date and date range filtering.
 * **Tags**: Placed next to the main event list, this widget provides grouped tags filtering.
 * **Search**: Placed next to the main event list, this widget provides text search filtering.
 * **Preview**: This widget can be placed on any page. By default, it loads the three first events of the agenda. It is demoed on the provided 404 template page.

*Important note*: OpenAgenda provides the same widgets for iframe integration. The iframe variants of the widgets are not directly compatible with this library. Use the codes as provided in the sample templates, under the `widgets` folder.

## Displaying raw data

For index and event pages. If you want insight on the data your are handling, add `?data` to your URL. The call will load a json view of the data as given to the template.

Use JSON viewer plugin such as [JSON Formatter](https://chrome.google.com/webstore/detail/json-formatter/bcjindcccaagfpapjjmafapmmgkkhgoa)


## Customizing event data

You may want to make some changes to the event data before it is provided to the template. This is achievable by providing an event item transform function when declaring the Portal:

    Portal( {
      ...
      eventParser: ( event, { lang, moment } ) => {

        // do things to event here

        return event;

      }
      ...
    } );

For example, you may want to display the tags of a single tag group. You can target its tags by filtering on the tag group slug:

    const _ = require( 'lodash' );

    Portal( {
      ...
      eventParser: ( event, { lang, moment } ) => {

        event.categoryTags = _.get(
          event.tagGroups.filter( g => g.slug === 'categories' ),
          '0.tags'
        );

        return event;

      }
      ...
    } );

It is then possible in an event item or page to target the group like this:

    {{#each categoryTags}}
      <a href="?oaq[tags][]={{slug}}">{{label}}</span>
    {{/each}}
