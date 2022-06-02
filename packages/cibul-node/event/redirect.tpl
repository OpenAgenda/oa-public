<!DOCTYPE html>
<html>
  <head>
    <title><%= agenda.title %> | <%= event.title %></title>
    <link rel="stylesheet" href="/css/oa-main.css?v=1"/>
<% for ( meta of metas ) { %>
    <meta property="<%= meta.property %>" content="<%= meta.content %>" />
<% } %>
  </head>
  <body>
    <div class="container top-margined">
      <div class="row">
        <div class="col-sm-6 col-sm-offset-3">
          <div>
            <div class="agenda-item minimize text-center">
              <a href="/agendas/<%= agenda.uid %>">
                <% if ( agenda.image ) { %>
                <img class="ill avatar" src="//cibul.s3.amazonaws.com/<%= agenda.image %>" alt="<%= agenda.title %>">
                <% } %>
                <strong class="<% if ( agenda.image ) { %>margin-left-xs<% } %>"><%= agenda.title %></strong>
                <% if ( agenda.official ) { %>
                <div class="official">
                  <i></i>
                  <div class="tooltip right" role="tooltip">
                    <div class="tooltip-arrow"></div>
                    <div class="tooltip-inner">Agenda officiel</div>
                  </div>
                </div>
                <% } %>
              </a>
            </div>
            <div class="wsq padding-all-md margin-top-sm padding-bottom-sm">
              <div class="text-center">
                <p>Redirection vers <a href="#"><em><strong><%= event.title %></strong></em></a> en cours...</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <script type="text/javascript">
      setTimeout( function() {

        window.location.href = '<%= redirect %>';

      }, 100 );
    </script>
  </body>
</html>
