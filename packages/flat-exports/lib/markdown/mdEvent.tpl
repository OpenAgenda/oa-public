<% if ( sectionValue ) { %>
## <%= sectionValue %>
---

<% } %>### [<%= title %>](<%= link %>)

<%= description %>

**<%= dateRange %>**

<% if ( location ) { %>**<%= location.name %>**, <%= location.address %> [<%= labels.itinerary %>](https://www.google.com/maps/dir//<%= location.latitude %>,<%= location.longitude %>/@<%= location.latitude %>,<%= location.longitude %>,17z)
<% if ( location.access ) { %><%= location.access %><% } %>
<% } %><% if ( attendanceMode.mode ) { %>**<%= attendanceMode.attendanceModeLabel %>**: <%= attendanceMode.mode %>
**<%= attendanceMode.onlineAccessLinkLabel %>**: <%= onlineAccessLink %>

<% } %><% if ( registration.length ) { %>**<%= labels.register %>**: <%= registration.map(el => el.value).join( ' - ' ) %>

<% } %><% if ( accessibility.length ) { %>**<%= labels.accessibility %>**: <%= accessibility.join( ', ' ) %>

<% } %><% if ( image ) { %>**Image**: <%= image %>

<% } %>---

