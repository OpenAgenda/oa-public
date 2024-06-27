# @openagenda/react-filters

This library works with OpenAgenda-compatible query structures. It provides a controller that loads calendar filters in designated placeholders presented on a webpage. It is used on the [OpenAgenda](https://openagenda.com) platform as well as by the following libraries:

 * The OpenAgenda [Wordpress plugin](https://fr.wordpress.org/plugins/openagenda/)
 * The OpenAgenda [Drupal plugin](https://www.drupal.org/project/openagenda)
 * The OpenAgenda [agenda-portal](https://www.npmjs.com/package/@openagenda/agenda-portal) event portal library

Table of contents:

 * [General principles](#principles)
 * [Available filters](#filters)

## Principles

Configuration is provided to the controller through a `window.oa` object that must be initialized before the filter library is loaded. 

```html
<html>
  <head></head>
  <body>
    <!-- place filter <div /> anchor points in your webpage -->
    <script>
      window.oa = {
        res: '/events',
        locale: 'fr',
        onLoad: () => {}, // ...
        onFilterChange: (), // ...
        // ...
      };
    </script>
    <script src="https://unpkg.com/@openagenda/react-filters@2.4.2/dist/main.js"></script>
  </body>
</html>
```

The [OpenAgenda plugins](https://developers.openagenda.com/tag/60-plugins/) load this object with the configuration provided in their backend. When used, initializing the `window.oa` separately should not be done. In this case, your focus should be on the [filters part](#filters) of this documentation.

If you need to use this library outside of the context of a plugin, see the contents of the `example` folder of the repo for details on the parameters to be provided to the `window.oa` object. In that case, requests can be sent directly to the [OpenAgenda API endpoints](https://developers.openagenda.com/10-lecture/)

### Controller options

This are loaded through the `window.oa` object.

 * **res**: The path where the controller will retrieve aggregated data to populate the filters with
 * **locale**: The locale in which the filters should be loaded
 * **locales**: Optional. The filter labels to be loaded over defaults. Use the following as base: `https://github.com/OpenAgenda/oa-public/blob/main/react-filters/src/locales/fr.json`
 * **aggregations**: Optional. The aggregated data object to be used by the controller at initialisation.
 * **total**: The current total displayed events
 * **defaultViewport**: Viewport to be used when no results are found. Format: `{ bottomRight: { latitude, longitude }, topLeft: { latitude, longitude } }`
 * **query**: Optional. Filter value to be loaded at initialization.
 * **onFilterChange**: The function to be called each time a filter value changes. This function should be in charge of loading the matching events in the list and updating the URL.
 * **onLoad**: This function is called when the controller has been loaded.
 * **apiClient**: An optional axios instance. Useful for tests.
 * **ref**: A React ref. Useful if the controller is to be used with the `FilterManager` component (not documented). See `React.createRef()` or `React.useRef()`

## Filters

A filter is defined by placing a `div` with `data-oa-filter` and `data-oa-filter-params` attributes in the webpage. At page load, the controler scans for any divs containing those attributes and attempts to load the corresponding filter.

 * `data-oa-filter` should contain a unique identifier for the filter on the site where it is loaded
 * `data-oa-filter-params` should container the parameters for the filter encoded in JSON and escaped (ex `{"name": "city"}` becomes `{&quot;name&quot;:&quot;city&quot;}`).

Most filters can be loaded using the following basic configuration (here, a filter that provides a list of cities from which the user can filter the event selection to focus on the requested cities):

```
<div
  data-oa-filter="unique-filter-id"
  data-oa-filter-params="{&quot;name&quot;:&quot;city&quot;}"
></div>
```

Here is a non-comprehensive list of the filters that can be loaded (to be placed in the `name` parameter):

 * `search`: A search text input.
 * `map`: A map for filtering based on events geolocation data. See below for details.
 * `locationUid`: Loads a list of location names.
 * `city`: as shown in the example. Provides a list of cities.
 * `region`: Loads a list of regions (equivalent of administrative level 1)
 * `department`: Loads a list of department (equivalent of administrative level 2)
 * `adminLevel3`: Loads a list of city groups (administrative level 3)
 * `city`: Loads a list of cities.
 * `keyword`: Loads a list of keywords.
 * `accessibility`: Loads a list of accessibility installation filters.
 * `attendanceMode`: Loads a filter to filter from `online`, `offline` or `mixed` events.
 * `featured`: Filter between featured and non-featured events.
 * `relative`: Filter between passed, ongoing and upcoming events
 * `timings`: Loads a calendar picker when the type is `dateRange` and range links (today, tomorrow, this weekend, ...) when the type is `definedRange`. See below for details.

For all filters that take the form of a list of checkboxes, the parameter `inputType` can be set to `radio` if the required behavior is to limit filtering to one value at a time per field.

### Search

A text input for open-text search. Parameters are:

 * **name**: 'search'.
 * **manualSearch**: Boolean, false by default. When true, search is only triggered when the user submits the value.

### Map

The map filter displays a map at the location of the container div that will allow the user to focus the selection of events according to their geographical locations. Parameters are:

 * **name**: 'geo'. Tells the controller the map filter is to be loaded.
 * **mapClass**: The class to be given to the map component container div.
 * **tileUrl**: The tiles to be used. Ex: `//{s}.tile.openstreetmap.org/{z}/{x}/{y}.png`
 * **tileAttribution**: The attribution for the tiles. Ex: `Map data © OpenStreetMap contributors`
 * **searchWithMap**: Boolean. Whether the event selection should be reloaded as the user navigates through the map.
 * **searchMessage**: Text to be displayed next to the checkbox controlling whether the selection should be reloaded with map navigation.

### Timings

The timings filter displays a calendar or range links that allow the user to filter the event selection to those occuring during the selected time range.

 * **name**: 'timings'
 * **type**: 'dateRange' for the calendar, 'definedRange' for predefined range links (today, tomorrow, this weekend)
 * **staticRanges**: when the type is 'definedRange', specifies which ranges to be displayed. Possible values are `['today', 'tomorrow', 'thisWeekend', 'currentWeek', 'currentMonth']`
 * **dateFormat**: Change the formatting of dates displayed in the from and to input fields. By default, uses [date-fns synthax](https://date-fns.org/docs/format) by default .
 * **dateFormatStyle**: date-fns by default. When the value is set to "php", reads the 'dateFormat' configuration in a [php formatting style](https://www.php.net/manual/datetime.format.php)

### Explicit filter options

It is possible to restrict displayed options of a given filter by providing an explicit list of options to its parameters. In the following example, only the "true" value will be displayed. Labels can also be set in the options object:

```
      <div
        data-oa-filter="evenement-jeune-public"
        data-oa-filter-params="<%= JSON.stringify({
          type: 'choice',
          name: 'audience-type',
          options: [
            {
              label: 'Youth',
              value: 'true'
            }
          ],
          aggregation: {
            type: 'additionalFields',
            field: 'audience-type',
          },
        }) %>"
      ></div>
```

The HTML equivalent:

```
      <div
        data-oa-filter="evenement-jeune-public"
        data-oa-filter-params="{&quot;type&quot;:&quot;choice&quot;,&quot;name&quot;:&quot;evenement-jeune-public&quot;,&quot;options&quot;:[{&quot;label&quot;:&quot;Jeune public&quot;,&quot;value&quot;:&quot;true&quot;},{&quot;label&quot;:&quot;Vieux public&quot;,&quot;value&quot;:&quot;false&quot;}],&quot;aggregation&quot;:{&quot;type&quot;:&quot;additionalFields&quot;,&quot;field&quot;:&quot;audience-type&quot;}}"
      ></div>
```