<div id="content" class="js_page_body">
  <div class="container">
    <div class="row">
      <section class="col-sm-6 col-sm-offset-3 wsq margin-top-lg">
        <div class="event-content">
          <h1><%= event.title %></h1>
          <p class="short-description"><%= event.description %></p>
        </div>
      </section>
    </div>
  </div>
  <% if ( redirect ) { %> 
  <script type="text/javascript">

    setTimeout( function() {

      window.location.href = '<%= redirect %>';

    }, 1000 );
  </script>
  <% } %>
</div>
