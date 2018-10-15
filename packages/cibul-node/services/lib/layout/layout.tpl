<!DOCTYPE html>
<html>
  <head>
    <title><%= agenda.title %></title>
    <link rel="stylesheet" href="/css/oasfmain.css?v=1"/>
<% for ( meta of metas ) { %>
    <meta property="<%= meta.property %>" content="<%= meta.content %>" />
<% } %>
  </head>
  <body>
    <nav class="oa-page-header navbar navbar-default navbar-static-top js_top_nav" id="nav">
      <div class="container">
        <div class="navbar-header">
          <button type="button" class="navbar-toggle collapsed js_toggle_trigger">
            <i class="fa fa-bars"></i>
          </button>
          <a class="navbar-brand" href="/">
            <img src="/images/openagenda.png" width="125" alt="OpenAgenda">
          </a>
        </div>
        <div class="navbar-collapse collapse">
          <form class="navbar-left search-form js_agenda_search" role="search" action="/agendas">
            <input class="search-input" placeholder="<%= labels.search %>" type="text" name="search">
<% if ( lang !== 'fr' ) { %>
            <input type="hidden" name="lang" value="<%= lang %>"/>
<% } %>
            <div class="search-button">
              <button class="search-submit" type="submit"><i class="fa fa-search"></i></button>
            </div>
          </form>
          <ul class="nav navbar-nav navbar-right js_header_links">
            <li><a target="_blank" href="/support"><%= labels.help %></a></li>
            <li class="js_toggle language-menu js_not_logged js_language_menu" data-toggle="js_languages_menu">
              <a href="#"><%= lang %></a>
              <ul class="dropdown-menu js_languages_menu collapse">
                <li><a href="?lang=fr" hreflang="fr">Français</a></li>
                <li><a href="?lang=en" hreflang="en">English</a></li>
              </ul>
            </li>
            <li class="js_not_logged signin">
              <a class="js_signin_link" href="/signin"><%= labels.signin %></a>
            </li>
            <li class="inbox js_inbox_header hide">
              <a href="/home/inbox">
                <i class="fa fa-envelope" aria-hidden="true"></i>
              </a>
            </li>
            <li class="notifications js_notifications hide">
              <a class="js_notifications_opener">
                <i class="fa fa-bell" aria-hidden="true"></i>
                <span class="label label-danger hide"></span>
              </a>
              <div class="js_notifications_panel hide"></div>
            </li>
          </ul>
        </div>
      </div>
    </nav>

    <header class="agenda-header">
      <div class="container profile notheme">
        <div class="row">
          <% if ( agenda.image ) { %>
          <div class="col-sm-2 avatar-container">
            <a href="/<%= agenda.slug %>">
              <img class="avatar" src="//cibul.s3.amazonaws.com/<%= agenda.image %>" alt="<%= agenda.title %>">
            </a>
          </div>
          <% } %>
          <div class="<%= agenda.image ? 'col-sm-7' : 'col-sm-9' %> title-container">
            <a href="/<%= agenda.slug %>">
              <div class="agenda-title">
                <h1><%= agenda.title %></h1>
              </div> 
              <p><%= agenda.description %></p>
            </a>
          </div>
        </div>
      </div>
    </header>
    {content}
    <script type="text/javascript">window.templates='bs';</script>
    <script type="text/javascript" src="/js/bsLayoutMain.js"></script>
  </body>
</html>
