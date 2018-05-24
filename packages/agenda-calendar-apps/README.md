# Overview

This app shows agenda events in a calendar grid form, using the `react-big-calendar` component. It enables users to navigate on the agenda through month, week and day views

Aiming for minimal integration effort. Overview points:

 * This is a purely frontend app. The production-ready script is the `dist/index.js` file. It is copied and placed in its final destination by the integrating build procedure
 * Parameters are given on the hosting page, inside a `<script type="application/json" id="config">` tag.
 * Parameters are completed with props default values in general react app.
 * The app uses an agenda event search endpoint to fetch data. This is specified in default props and can be also given through host page
 * The index.html at the root serves as the host page in a test environment. It fetches data from online agendas.
 * Style and labels are given by @openagenda/bs-templates and @openagenda/labels respectively

 To do:

  * event open links
  * total ( show more ) links 
  * specialized view loads
  * basic filtering ( for mcc needs )
  * default message if no search index is shown

