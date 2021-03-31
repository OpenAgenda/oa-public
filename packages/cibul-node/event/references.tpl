<div class="event-references show">
  <div class="wsq">
  <% events.forEach(event => { %>
    <div class="media">
    <% if (event.image?.filename) { %>
      <div class="media-left">
        <a class="event-pic" href="/events/<%= event.uid %>">
          <img style="width:100%" class="media-object" src="<%= event.image.base + event.image.variants.filter(v => v.type === 'thumbnail').pop()?.filename %>" />
        </a>
      </div>
    <% } %>
      <div class="media-body">
        <a href="/events/<%= event.uid %>"
          <h4 class="media-heading"><%= event.title %></h4>
          <ul class="list-unstyled">
            <% if (event.location) { %>
              <li><%= event.location.name %>, <%= event.location.address %></li>
            <% } %>
              <li><%= event.dateRange %></li>
          </ul>
        </a>
      </div>
    </div>
  <% }) %>
  </div>
</div>