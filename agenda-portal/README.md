# @openagenda/agenda-portal

This library provides functionalities to build a fully customizable events website that relies on an OpenAgenda JSON export as its events data source. Good working knowledge of sass, css and html is sufficient to get a customized website running.

Here are a few websites built with this library:

 * INHA: [https://agenda.inha.fr/](https://agenda.inha.fr/)
 * L'agenda d'Albi: [https://agenda.albi.fr](https://agenda.albi.fr)
 * Arles | Agenda: [https://arles-agenda.fr/](https://arles-agenda.fr/)
 * 50 ans de Francophonie: [https://agenda50ans.francophonie.org/](https://agenda50ans.francophonie.org/)

[Handlebars](https://handlebarsjs.com/) is the main templating engine.
[Sass](https://sass-lang.com/) for styling. Default templates use [Bootstrap 4](https://getbootstrap.com/docs/4.0/getting-started/theming/)

Table of contents:

 * [Features](#features)
 * [Quick start](#quick-start)
 * [Options](#options)
 * [Templates and styling](#templates-and-styling)
   * [Available data](#available-data)
   * [Customizing data](#customizing-data)
 * [IFrames](#iframes)
 * [Preview](#preview)
 * [Miscellaneous](#miscellaneous)

## Features

### For site users

 * **Event search** : mirrors search featured available on [OpenAgenda](https://openagenda.com) by forwarding filters to the matching agenda **JSON** export
 * **Event list pagination**: event lists can be either paginated or loaded progressively as the user scrolls
 * **Lateral navigation**: When a search is made and an event is opened, the user can shuffle through events of the current search without going back to the list
 * **Caching**: redis caching

### For developers

 * **Bootstrap client**: to start working on a sandbox project in a matter of minutes
 * **Live reload for integrators**: The portal reloads as templates or styles are customized on file saves
 * **Structured event data**: ready-to-use `json+ld` sets are ready for use on templates for search engine indexing
 * **Filter widgets**: Customizable map, tag, search field, calendar components
 * **View variables**: add `?data` to current url to see available data for use in templates

## Quick start

Here is a quick procedure to get you started on your agenda portal.

**Prerequisites**: You must have [nodejs](https://nodejs.org) installed. Install was done with [yarn](https://yarnpkg.com) so if you want to follow the procedure to the letter, install that too, but there is no reason why NPM should not work.

Create a new project and add agenda-portal in your dependencies:

    mkdir yourproject
    cd yourproject
    yarn init --yes
    yarn add @openagenda/agenda-portal

To get your project quickly operational, make sure you have the following information in hand:

 * **uid**: the unique identifier of the agenda the portal will get its events from
 * **lang**: the main language of your portal
 * **key**: your OpenAgenda account public key ( available in your user settings ).

**Note**: if the agenda portal is expected to run inside an iframe, answer "Yes" to the corresponding deploy question to activate additional scripts that will communicate with the parent page to adjust iframe height and url updates. See the [iframe section below](#iframes) for details.

Run the deploy command:

    yarn deploy

... and your portal should be ready. Launch it with:

    yarn start

Once this is done, all files will be ready to be edited in your project. And .env file lists all project environment variables, which are overwritten by variables already declared on execution of the server script.

See it on your browser on port 3000 if you haven't changed the default port in `server.js`: [localhost:3000](localhost:3000)

You can then edit handlebar templates available in the views folder and the sass files as you wish to adapt the portal design.

## Options

### General options

These define general portal settings. Default options set in your `server.js` file are a good baseline.

 * **assets**: path to the assets folder
 * **cache**: Optional. Cache management related options. See below for details
 * **defaultFilter**: Optional. Set a filter to be applied to search when no other filter is set. For example: if featured events are displayed in a section other than the main list, it is not desired to load them in the list view at the first list load, to avoid displaying duplicate content.
 * **eventsPerPage**: Optional. Number of events to be loaded in the event list view. 20 is the default value
 * **eventHook**: Optional. event item parse function. Useful to transform event item data before it reaches the template. See more on this in the [Customizing data](#customizing-data) section.
 * **key**: Required. OpenAgenda account public key
 * **lang**: Optional. Main portal language
 * **map**: map filter widget settings ( tiles, default center ... )
 * **root**: Required. website root. Used in production
 * **sass**: path to the sass folder
 * **uid**: Required. UID of the agenda
 * **views**: Required. Path to the handlebar views folder
 * **refreshInterval**: interval with which the cache is cleared in milliseconds. Defaults on 1000*60*60 (1 hour)
 * **iframable**: false by default. True if the portal is to be displayed within an iframe.

### Cache options

 * **refreshInterval**: interval at which the cache is cleared. Every hour by default.

## Templates and styling

When working on your portal, you should only really need to edit files that are either:

 * In your sass folder for styling
 * In your views folder for templating
 * In your assets folder for static assets such as images or javascripts

### Available data

For index and event pages. If you want insight on the data your are handling, add `?data` to your URL. The call will load a json view of the data as given to the template.

Use JSON viewer plugin such as [JSON Formatter](https://chrome.google.com/webstore/detail/json-formatter/bcjindcccaagfpapjjmafapmmgkkhgoa)

### Customizing data

A function can be passed to the main portal configuration in your `server.js` file under the `eventHook` key together with all the options of your portal instance. This function is evaluated on every event before it is passed on to event templates, list or full page. To illustrate:

```
// server.js

Portal({
  ...
  eventHook: function(event) {
    // do stuff here
    event.slugWithStuff = event.slug + 'WithStuff';
    return event;
  }
  ...
});
```

In the event template, you can now use:

```
{{slugWithStuff}}
```

A set of ready-to-use utilities is available through the module `@openagenda/agenda-portal/utils`:

 * `decorateTimings`: uses [momentjs](https://momentjs.com) to decorate timings with custom formats
 * `markdownToHTML`: returns html content corresponding to the provided markdown
 * `spreadRegistration`: spreads registration values to specified keys according to their types
 * `cloudimage`: generates cloud image links for event images given cloudimage options

#### utils - decorateTimings

Sometimes you want to display timings with specific formats. [momentjs](https://momentjs.com) provides the functionality to achieve this, the `decorateTimings` utility makes it easily accessible in the event hook function:

```
const { decorateTimings } = require('@openagenda/agenda-portal/utils');

// in your event hook:
const timingsWithYear = decorateTimings(event.timings, 'Europe/Paris', [{
  src: 'begin',
  dst: 'year',
  format: 'YYYY'
}]);

event.timings = timingsWithYear;
```

The `{{year}}` can now be displayed in the templates where the timings list is looped over.

#### utils - markdownToHTML

Self-explanatory:

```
const { markdownToHTML } = require('@openagenda/agenda-portal/utils');

// in your event hook:
event.html = markdownToHTML(event.longDescription.en);
```

#### utils - spreadRegistration

```
const { spreadRegistration } = require('@openagenda/agenda-portal/utils');

// in your event hook:
Object.assign(event, spreadRegistration(event.registration));
```

The following lists will be available in your templates:

 * `registrationEmails`
 * `registrationLinks`
 * `registrationPhones`

#### utils - cloudimage

[Cloudimage](https://www.cloudimage.io) is a service that makes it easy to format images on the fly according to your integration needs. This utility generates cloudimage links of the event image that can then be used in the templates.

```
const { cloudimage } = require('@openagenda/agenda-portal/utils');
const BASECILINK = 'https://{youraccountkey}.cloudimg.io/v7/';

// in your event hook
event.anotherImage = cloudimage(BASECILINK, { width: 400, grey: 1 } /* cloudimage options */);
```

For details on possible options, refer to the cloudimage documentation [here](https://docs.cloudimage.io/go/cloudimage-documentation-v7/en/introduction). Options passed to the utility are integrated into the image link.

### Displaying a total

When the list is filtered, a javascript can update the displayed total dynamically. A hook class must be used on the element in which the total should go: `js_total`.

The default index template provides an example:

    <span
      class="js_total mr-2"
      data-total="{{total}}"
      data-label-none="Aucun événement ne correspond à cette recherche"
      data-label-one="1 événement" data-label-plural="%total% événements"></span>


### Navigation

#### Progressive load

progressive load is deactivated by default. It can be enabled by setting a specific class on dom element containing the event list: `js_progressive_load`.

Instead of reloading a page when a navigation occurs, a script will perform an xhr query to retrieve the content of the next page, extract the items found in the `js_progressive_load` element and append it to the bottom of the list when it is reached.

#### Sideways event navigation

When a search is done on the main agenda page and an event is selected, it is loaded with a navigation context query parameter in its url. Sideway navigation links then allow the user to navigate from event to event within a same search without the need to go back to search result list.

The partial illustrating this is `navigation.hbs`

#### Filtering widgets

Look for the widgets folder in the sample partial templates for an example of implementation. These widgets provide navigation features:

 * **Map widget**: Placed next to the main event list, this widget allows filtering the events dynamically by navigating in the map.
 * **Calendar widget**: Placed next to the main event list, this widget provides date and date range filtering.
 * **Tags**: Placed next to the main event list, this widget provides grouped tags filtering.
 * **Search**: Placed next to the main event list, this widget provides text search filtering.
 * **Preview**: This widget can be placed on any page. By default, it loads the three first events of the agenda. It is demoed on the provided 404 template page.

*Important note*: OpenAgenda provides the same widgets for iframe integration. The iframe variants of the widgets are not directly compatible with this library. Use the codes as provided in the sample templates, under the `widgets` folder.

##### Map

Place the partial `widgets/map.hbs` where the map is to appear. Widget options can be set under the `map` key of the Portal call in your `server.js` file:

 * `tiles`: the map tiles to be used.
 * `auto`: boolean. If `true` panning and zooming actions on the map will update the current list filter accordingly.
 * `center`: Preset center at initialization. Object of 3 required keys: `latitude`, `longitude`, `center`

## IFrames

In some cases, an agenda portal project is integrated into an existing website by loading it within an iframe. In this case, a js controller that will handle iframe height adjustments and url updates needs to be associated to the iframe. This controller is a js file made available by the portal implementation: `${youportalurl}/js/oaPreviewController.js`.

To illustrate, given a portal url `https://myagendaportal.com`, the iframe/controller code should look like this:

    <iframe data-oa-portal="https://myagendaportal.com" allowtransparency="allowtransparency" frameborder="0"></iframe>
    <script type="text/javascript" src="https://myagendaportal.com/js/oaPortalController.js"></script>

You can use the `iframe-canvas.html` locally when working in a development environment to display the portal within an integrated page.

Attributes:

  * `data-scroll-offset`: when an event is opened, the page scrolls to the top of the page. Adjust positionning by specifying this offset.
  * `allowtransparency, frameborder`: avoid ugly borders and preset background on the iframe

## Preview

If you need to display an extract / a preview of the content of the portal, say on the homepage of your website for example, where user can click on an event to be redirected to the full view on your portal, a preview template can be customized: `preview.hbs`. Once ready, it is to be pointed to by an iframe/js pair to be placed where you want to display the previewed events:

    <iframe
      data-oa-preview="http(s)://portal-url.com/preview"
      data-count="3"
      data-query="oaq[featured]=1"
      data-target-url="http://portal-url-or-iframed-portal-hosting-page.com"
      data-target-iframe
      allowtransparency="allowtransparency"
      frameborder="0"></iframe>
    <script type="text/javascript" src="http(s)://portal-url.com/js/oaPreviewController.js"></script>

The specified iframe attributes:

 * `data-oa-preview`: route to the preview endpoint of your portal
 * `data-target-url`: base url where the portal is deployed
 * `data-target-iframe`: set this attribute only if the portal is hosted within an iframe on the target page.
 * `data-query`: query to filter events to be displayed in preview widget
 * `allowtransparency, frameborder`: avoid ugly borders and preset background on the iframe

## Miscellaneous

### Static pages

Any static page can be added by placing a file in a `pages` subfolder of the `views` folder. The path will be the same as the name of the file.

### Custom configuration

Values you add to the main Portal call in the server file are accessible in your templates. If you do this:

    Portal( {
      ...
      yourOwnKey: 'Well hello there'
      ...
    } );

You can access the value in a template like this:

    {{yourOwnKey}}

This is useful if you need to specify additional account keys, such as google analytics for example, or a facebook page url...

### Customizing event data

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


## Migration

### From 1.x.x to 2.0.0

 * `In server.js`: the Portal call returns an object containing the express app instead of the app itself. Replace `.then( app => ... )` with `.then( ( { app } ) => ... )`
 * `In server.js`: ensure the protocol is specified in dev environment: `http://localhost:3000` instead of `localhost:3000`
 * Timing labels have moved in a 'labels' key. For example, `start.label` becomes `labels.start.time`.
 * 2.0.0 provides a JSON LD for each timing and for each event. Add the following to your event template:

    <script type="application/ld+json">
      {{{event.JSONLD}}}
    </script>

## Changelog

2.7.0 - 19/05/2020

 * Utilities for formatting events before they are handed to templates
 * Option to use v2 OpenAgenda JSON export

... other stuff.

2.0.0 - 08/07/2019

 * eventParser option is now called eventHook
 * added progressive load alternative to list view
 * added rich snippets to event view
 * miscellaneous refactors
