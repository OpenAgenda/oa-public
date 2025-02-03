<div class="container page-dialog">
  <div class="row top-margined">
    <section class="col-sm-6 col-sm-offset-3 wsq">
      <div class="content text-center">
        <h2><%- title %></h2>
      </div>
      <div class="content">
        <%= content %>
      </div>
      <div class="content actions">
        <% actions.forEach(function(a) { %>
        <a href="<%- a.href %>" class="btn btn-<%- a.type %>">
          <%- a.label %>
        </a>
        <% }); %>
      </div>
    </section>
  </div>
</div>
