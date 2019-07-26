<header class="agenda-header">
  <div class="container profile notheme">
    <div class="row">
      <% if ( agenda.image ) { %>
      <div class="col-sm-2 avatar-container">
        <a href="/<%= agenda.slug %>">
          <img class="avatar" src="<%= agenda.image %>" alt="<%= agenda.title %>">
        </a>
      </div>
      <% } %>
      <div class="<%= agenda.image ? 'col-sm-7' : 'col-sm-9' %> title-container">
        <a href="/<%= agenda.slug %>">
          <div class="agenda-title">
            <h1><%= agenda.title %></h1>
          </div>
          <p><%= agenda.description %></p>
          <% if ( agenda.url ) { %>
          <a href="<%= agenda.url %>" target="_blank"><%= agenda.url %></a>
          <% } %>
        </a>
      </div>
    </div>
  </div>
</header>
{content}
