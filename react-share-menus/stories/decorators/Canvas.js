import React from 'react';
import { IntlProvider } from 'react-intl';
import locales from '../../src/locales-compiled';

export default Story => {
  const lang = 'fr';

  return (
    <IntlProvider messages={locales[lang]} locale={lang} key={lang}>
      <div id="event">
        <header className="agenda-header">
          <div className="container profile notheme">
            <div className="row">
              <div className="col-sm-2 avatar-container">
                <a href="#agendaShow%7B%22slug%22:%22la-gargouille%22%7D">
                  <img
                    className="avatar"
                    src="//cibul.s3.amazonaws.com/review_cheznous_598_00.jpg"
                    alt="L'agenda de la Gargouille"
                  />
                </a>
              </div>
              <div className="col-sm-7 title-container">
                <a href="#agendaShow%7B%22slug%22:%22la-gargouille%22%7D">
                  <div className="agenda-title">
                    <h1>L'agenda de la Gargouille</h1>
                    <div className="agenda-badges">
                      <div className="tooltip-icon big">
                        <i className="fa fa-unlock-alt" />
                        <div className="tooltip right" role="tooltip">
                          <div className="tooltip-inner">Agenda privé</div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <p>Evénements sur Paris</p>
                </a>
                <p>
                  <a target="_blank" href="http://openagenda.com">
                    http://openagenda.com
                  </a>
                </p>
                <Story />
              </div>
              <div className="col-sm-3 action-container">
                <p className="share">
                  Partager&nbsp;:
                  <a
                    rel="nofollow"
                    href="#agendaShare%7B%22slug%22:%22chez-nous%22,%22service%22:%22twitter%22%7D"
                    className="tw"
                    target="_blank"
                  >
                    <i className="fa fa-twitter" />
                    <span>twitter</span>
                  </a>
                  <a
                    rel="nofollow"
                    href="#agendaShare%7B%22slug%22:%22chez-nous%22,%22service%22:%22facebook%22%7D"
                    className="fb"
                    target="_blank"
                  >
                    <i className="fa fa-facebook" />
                    <span>facebook</span>
                  </a>
                  <a
                    rel="nofollow"
                    href="#agendaShare%7B%22slug%22:%22chez-nous%22,%22service%22:%22googlePlus%22%7D"
                    className="gp"
                    target="_blank"
                  >
                    <i className="fa fa-google-plus" />
                    <span>google plus</span>
                  </a>
                  <a
                    rel="nofollow"
                    href="#agendaShare%7B%22slug%22:%22chez-nous%22,%22service%22:%22linkedIn%22%7D"
                    className="li"
                    target="_blank"
                  >
                    <i className="fa fa-linkedin" />
                    <span>linkedin</span>
                  </a>
                </p>
              </div>
            </div>
          </div>
        </header>
      </div>
    </IntlProvider>
  );
};
