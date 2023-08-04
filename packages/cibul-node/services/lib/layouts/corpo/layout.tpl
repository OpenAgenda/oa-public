<%
const nonceAttr = typeof cspNonce !== 'undefined' ? ` nonce="${cspNonce}"` : '';
%><!DOCTYPE html>
<html lang="<%= lang %>">
  <head>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <link rel="shortcut icon" href="/images/favicon.ico"/>
    <link href="https://oastatic.s3.eu-central-1.amazonaws.com/fonts/roboto.css" rel="stylesheet" type="text/css"<%= nonceAttr %>>
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="language" content="<%= lang %>">
    <link rel="stylesheet" href="/css/oa-main.css?v=1"<%= nonceAttr %>>
    <%= metas %>
  </head>
  <body class="landing" style="background: gray;">
    <div id="outdated"></div>
    <nav class="landing-header navbar navbar-default navbar-static-top">
      <div class="container">
        <div class="navbar-header">
          <button
            type="button"
            class="navbar-toggle collapsed"
            data-toggle="collapse"
            data-target="#bs-navbar-collapse"
            aria-expanded="false"><i class="fa fa-bars"></i></button>
          <a class="navbar-brand" href="/">
            <div class="logo"></div>
          </a>
        </div>
        <div class="navbar-collapse collapse" id="bs-navbar-collapse" aria-expanded="false">
          <ul class="nav navbar-nav navbar-right">
            <li class="signin"><a href="/start?a=header_signin&lang=<%= lang %>"><%= labels.layoutSignin %></a></li>
            <li class="signup"><a href="/start?a=header_signup&lang=<%= lang %>"><%= labels.layoutSignup %></a></li>
            <li class="tel">
              <div>
                <a href="tel:<%= tel %>" class="btn btn-default">
                  <i class="fa fa-phone" aria-hidden="true"></i>&nbsp;&nbsp;<%= tel %>
                </a>
              </div>
            </li>
            <li>
              <div class="padding-v-sm">
<% languages.forEach( l => { %>
                <a href="/<% if ( l.value !== 'fr' ) { %>?lang=<%= l.value %><% } %>" hreflang="<%= l.value %>" class="padding-h-sm <%= l.className %>">
                  <%= l.label %>
                </a><%= l.separator ? '|' : '' %>
<% } ) %>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </nav>
    {content}
<% scripts.forEach( s => { %>
    <script type="text/javascript"<% if (s.src) { %> src="<%= s.src %>"<% } %><%= nonceAttr %><% if (s.integrity) { %> hash="<%= s.integrity %>" integrity="<%= s.integrity %>"<% } %><% if (typeof s.crossorigin === 'string') { %> crossorigin="<%= s.crossorigin %>"<% } %>><%= s.content || '' %></script>
<% }) %>
  </body>
</html>
