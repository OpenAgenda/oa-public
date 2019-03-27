<div class="container">
  <div class="row margin-top-lg">
    <div class="col-sm-offset-4 col-sm-4">
      <div class="wsq padding-h-sm padding-v-md">
        <div class="text-center">
          <label><%= code %></label>
          <% if ( message ) { %>
            <div class="margin-v-sm">
              <p><%= message %></p>
            </div>
          <% } %>
          <% if ( back ) { %>
            <div class="margin-top-md">
              <a class="btn btn-primary" href="<%= back.link %>"><%= back.label %></a>
            </div>
          <% } %>
        </div>
      </div>
    </div>
  </div>
</div>
