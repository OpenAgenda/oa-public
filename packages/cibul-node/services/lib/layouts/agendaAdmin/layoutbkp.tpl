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
        <li class="menu-item js_menu_item js_menu_item_events">
          <a href="/<%= agenda.slug %>/admin">
            <span><%= adminLabels.events %></span>
          </a>
        </li>
        <li class="menu-item js_menu_item js_menu_item_members">
          <a href="/<%= agenda.slug %>/admin/members">
            <span><%= adminLabels.members %></span>
          </a>
        </li>
        <li class="menu-item js_menu_item js_menu_item_locations">
          <a href="/<%= agenda.slug %>/admin/locations">
            <span><%= adminLabels.locations %></span>
          </a>
        </li>
        <li class="menu-item js_menu_item js_menu_item_sources">
          <a href="/<%= agenda.slug %>/admin/sources">
            <span>XXX <%= adminLabels.sources %></span>
          </a>
        </li>
        <li class="menu-item js_menu_item js_menu_item_inbox">
          <a href="/<%= agenda.slug %>/admin/inbox">
            <span><%= adminLabels.inbox %></span>
          </a>
        </li>
        <li class="menu-item js_menu_item js_menu_item_activities">
          <a href="/<%= agenda.slug %>/admin/activities">
            <span><%= adminLabels.activities %></span>
          </a>
        </li>
      </ul>
      <ul class="list-unstyled">
        <li>
          <h2><%= adminLabels.export %></h2>
        </li>
        <li class="menu-item js_menu_item js_menu_item_facebook">
          <a href="/<%= agenda.slug %>/admin/facebook">
            <span><%= adminLabels.facebook %></span>
          </a>
        </li>
        <li class="menu-item js_menu_item js_menu_item_web">
          <a href="/<%= agenda.slug %>/admin/webembed">
            <span><%= adminLabels.web %></span>
          </a>
        </li>
      </ul>
      <ul class="list-unstyled">
        <li>
          <h2><%= adminLabels.settings %></h2>
        </li>
        <li class="menu-item js_menu_item js_menu_item_settings_profile">
          <a href="/<%= agenda.slug %>/admin/settings/profile">
            <span><%= adminLabels.settings_profile %></span>
          </a>
        </li>
        <li class="menu-item js_menu_item js_menu_item_settings_schema">
          <a href="/<%= agenda.slug %>/admin/schema">
            <span><%= adminLabels.schema %></span>
          </a>
        </li>
        <li class="menu-item js_menu_item js_menu_item_settings_contribution">
          <a href="/<%= agenda.slug %>/admin/settings/contribution">
            <span><%= adminLabels.settings_contribution %></span>
          </a>
        </li>
        <li class="menu-item js_menu_item js_menu_item_settings_customize">
          <a href="/<%= agenda.slug %>/admin/settings/customize">
            <span><%= adminLabels.settings_advanced %></span>
          </a>
        </li>
      </ul>
    </div>
    <div class="col col-sm-9 body">
      {content}
    </div>
  </div>
</div>


