"use strict";

// generate page with layout
module.exports = ( content, data ) => {

  const {
    title,
    description
  } = data.agenda || {
    title: 'Scenarios',
    description: 'These are development environment scenarios. Each load the contribution app in a different agenda environment'
  };


  return `<!DOCTYPE html>
    <html>
      <head>
        <link rel="stylesheet" href="/style.css">
      </head>
      <body>
        <nav class="oa-page-header navbar navbar-default navbar-static-top js_top_nav" id="nav">
          <div class="container">
            <div class="navbar-header">
              <button type="button" class="navbar-toggle collapsed js_toggle_trigger">
                <i class="fa fa-bars"></i>
              </button>
              <a class="navbar-brand" href="/">
                <img src="https://openagenda.com/images/openagenda.png" width="125" alt="OpenAgenda">
              </a>
            </div>
            <div class="navbar-collapse collapse">
              <form class="navbar-left search-form js_agenda_search" role="search" action="/agendas">
                <input class="search-input" placeholder="Rechercher" type="text" name="search" value="">
                <div class="search-button">
                  <button class="search-submit" type="submit"><i class="fa fa-search"></i></button>
                </div>
              </form>
                <ul class="nav navbar-nav navbar-right js_header_links">
                  <li>
                    <div class="help-button-canvas">
                      <a class="btn btn-primary btn-rounded btn-bordered" rel="nofollow" target="_blank" href="/support?origin=%2Fjep-2018-occitanie">
                        <i class="fa fa-question-circle"></i>
                        <span>Aide</span>
                      </a>
                    </div>
                  </li>
                  <li class="js_toggle language-menu js_not_logged js_language_menu" data-toggle="js_languages_menu">
                    <a href="#">fr</a>
                    <ul class="dropdown-menu collapse">
                      <li><a href="?lang=fr" hreflang="fr" class="selected">français</a></li>
                      <li><a rel="alternate" href="?lang=en" hreflang="en">english</a></li>
                    </ul>
                  </li>
                  <li class="js_not_logged signin">
                    <a class="js_signin_link" href="/signin">Se connecter</a>
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
          <div id="agenda">
            <header class="agenda-header" >

              <div class="container profile notheme">
                <div class="row"><!--
                  --><div class="col-sm-2 avatar-container">

                  <a href="/jep-2018-occitanie">
                    <img class="avatar" src="//cibul.s3.amazonaws.com/agenda69809170.jpg" alt="JEP 2018 : Occitanie">
                  </a>

                  </div><!--
                  --><div class="col-sm-7 title-container">
                    <a href="/jep-2018-occitanie">
                      <div class="agenda-title">
                        <h1>${title}</h1>

                        <div class="agenda-badges">

                          <div class="official big">
                            <i></i>
                            <div class="tooltip right" role="tooltip">
                              <div class="tooltip-arrow"></div>
                              <div class="tooltip-inner">Agenda officiel</div>
                            </div>
                          </div>


                        </div>

                      </div>
                      <p>${description}</p>
                    </a>

                    <p><a target="_blank" href="#">http://oa.com</a></p>

                        <div class="ctas">
                            <a class="btn btn-default margin-bottom-xs" href="/">
                              <i class="fa fa-cogs"></i> See all scenarios
                            </a>
                        </div>
                  </div>
                </div>
              </div>
            </header>
            ${content}
          </div>
        </body>
    </html>`

}
