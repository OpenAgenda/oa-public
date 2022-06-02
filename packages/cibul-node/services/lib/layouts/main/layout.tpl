<!DOCTYPE html>
<html lang="<%= lang %>">
  <head>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <link rel="shortcut icon" href="/images/favicon.ico" />
    <title><%= title %></title>
    <link rel="stylesheet" href="/css/oa-main.css?v=1"/>
    <meta name="robots" content="index, follow">
<% for ( meta of metas ) { %>
    <meta property="<%= meta.property %>" content="<%= meta.content %>" />
<% } %>
<% for ( script of scripts.top ) { %>
  <% if (script.src) { %>
    <script type="text/javascript" src="<%= script.src %>"></script>
  <% } else if (script.body) { %>
    <script type="text/javascript"><%= script.body %></script>
  <% } %>
<% } %>
  </head>
  <body <% for ( attr of bodyAttributes ) { %>
    <%- attr.name %>="<%- attr.value %>"
  <% } %>>
    <div id="outdated"></div>
    <nav class="oa-page-header navbar navbar-default navbar-static-top js_top_nav" id="nav">
      <div class="container">
        <div class="navbar-header">
          <button
            type="button"
            class="navbar-toggle collapsed"
            data-toggle="collapse"
            data-target="#bs-navbar-collapse"
            aria-expanded="false">
            <i class="fa fa-bars"></i>
          </button>
          <a class="navbar-brand" href="/">
            <img src="/images/openagenda.png" width="125" alt="OpenAgenda">
          </a>
        </div>
        <div class="navbar-collapse collapse" id="bs-navbar-collapse" aria-expanded="false">
          <form class="navbar-left search-form js_agenda_search" role="search" action="/agendas">
            <input class="search-input" placeholder="<%= labels.search %>" type="text" name="search" value="<%= querySearch %>">
<% if ( lang !== 'fr' ) { %>
            <input type="hidden" name="lang" value="<%= lang %>"/>
<% } %>
            <div class="search-button">
              <button class="search-submit" type="submit"><i class="fa fa-search"></i></button>
            </div>
          </form>
          <ul class="nav navbar-nav navbar-right js_header_links">
            <% if ((typeof isTranslator !== 'undefined' && isTranslator) || (typeof translateMode !== 'undefined' && translateMode)) { %>
            <li>
              <button
                type="button"
                class="<%= translateMode ? 'btn btn-default active translate-button' : 'btn btn-link translate-button' %>"
              >
                <i class="fa fa-language"></i>
              </button>
            </li>
            <% } %>
            <li>
              <div class="help-button-canvas">
                <a class="btn btn-primary btn-rounded btn-bordered" target="_blank" rel="nofollow" href="/support">
                  <i class="fa fa-question-circle"></i>&nbsp;<%= labels.help %>
                </a>
              </div>
            </li>
            <li class="js_toggle language-menu js_not_logged js_language_menu" data-toggle="js_languages_menu">
              <a href="#"><%= lang %></a>
              <ul class="dropdown-menu js_languages_menu collapse">
<% interfaceLanguages.forEach( languageCode => { %>
                <li><a href="?lang=<%= languageCode %>" hreflang="<%= languageCode %>"><%= labels[ languageCode ] %></a></li>
<% }) %>
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
    {content}
    <script type="text/javascript">window.templates='bs';</script>
    <script type="text/javascript" src="/js/bsLayoutMain.js"></script>
<% for ( script of scripts.bottom ) { %>
  <% if (script.src) { %>
    <script type="text/javascript" src="<%= script.src %>"></script>
  <% } else if (script.body) { %>
    <script type="text/javascript"><%= script.body %></script>
  <% } %>
<% } %>
  </body>
</html>
