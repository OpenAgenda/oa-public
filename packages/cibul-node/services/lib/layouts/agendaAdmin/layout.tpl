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
        <li>
          <h2><%= adminLabels.manage %></h2>
        </li>
      </ul>
      <ul class="list-unstyled">
        <li>
          <!--<h2><%= adminLabels.export %></h2>-->
        </li>
      </ul>
      <ul class="list-unstyled">
        <li>
          <!--<h2><%= adminLabels.settings %></h2>-->
        </li>
      </ul>
    </div>
    <div class="col col-sm-9 body">
      {content}
    </div>
  </div>
</div>


