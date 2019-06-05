<div class="container agenda-admin agenda-admin">
  <div class="row wsq header">
    <% if ( agenda.image ) { %>
      <div class="col col-sm-2">
        <a class="agenda-logo" href="/<%= agenda.slug %>">
          <img alt="<%= agenda.title %>" src="<%= agenda.image %>">
        </a>
      </div>
    <% } %>
    <div class="col col-sm-<% if ( agenda.image ) { %>10<% } else { %>12<% } %>">
      <h1><%= agenda.title %></h1>
      <p><%= adminLabels.administration %></p>
      <a class="url" href="/<%= agenda.slug %>"><%= adminLabels.back %></a>
    </div>
  </div>
  <div class="row wsq">
    <div class="col col-sm-3 nav">
      <ul class="list-unstyled">
        <% sections.forEach( function( section ) { %>
          <% if ( section && section.tabs.length ) { %>
          <li>
            <h2><%= section.label %></h2>
          </li>
          <% section.tabs.forEach( function( { name, label, link, selected, scriptAnchor } ) { %>
          <li class="menu-item js_menu_item js_menu_item_<%= name %><%= selected ? ' selected' : '' %>">
            <a class="<%= selected ? 'active' : ''%>" href="<%= link %>"><%= label %></a>
            <% if ( scriptAnchor ) { %>
            <%= scriptAnchor.replace( ':slug', agenda.slug ) %>
            <% } %>
          </li>
          <% } ) %>
          <% } %>
        <% } ) %>
      </ul>
    </div>
    <div class="col col-sm-9 body">
      {content}
    </div>
  </div>
</div>


