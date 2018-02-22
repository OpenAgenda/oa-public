<% if ( sectionValue ) { %>
<%= sectionValue %>
-----------------------------
<% } %><%= title %>
<%= link %>

<%= description %>

<%= location.name %>, <%= location.address %>
<%= labels.itinerary %>: https://www.google.com/maps/dir//<%= location.latitude %>,<%= location.longitude %>/@<%= location.latitude %>,<%= location.longitude %>,17z
<%= dateRange %>

<% if ( longDescription.length ) { %><%= longDescription %>

<% } %><% if ( location.access ) { %><%= location.access %><% } %>
<% if ( registration.length ) { %><%= labels.register %>: <%= registration.join( ' - ' ) %><% } %>

<% if ( accessibility.length ) { %><%= labels.accessibility %>: <%= accessibility.join( ', ' ) %><% } %>
-----------------------------
