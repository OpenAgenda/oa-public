import React from 'react';
import Image from './Image.js';

export default function AgendasList({
  WrapperComponent = 'div',
  ActionsComponent = () => null,
  agendas,
  getTitleLink,
  getLabel,
}) {
  return React.createElement(
    WrapperComponent,
    {},
    agendas
      && agendas.map((agenda, i) => (
        // eslint-disable-next-line react/no-array-index-key
        <div className="agenda-item media" key={i}>
          <div className="media-left">
            <a href={getTitleLink(agenda)}>
              <Image
                src={agenda.image}
                fallbackSrc={
                  process.env.NODE_ENV === 'development'
                    ? agenda.image.replace('dev', 'main')
                    : null
                }
                className="media-object ill avatar"
                alt={agenda.title}
              />
            </a>
          </div>
          <div className="media-body">
            <div className="title media-heading">
              <a href={getTitleLink(agenda)}>
                <strong>{agenda.title}</strong>
              </a>
              {!!agenda.official && (
                <div className="official">
                  <i />
                  <div className="tooltip right" role="tooltip">
                    <div className="tooltip-arrow" />
                    <div className="tooltip-inner">
                      {getLabel('officialAgenda')}
                    </div>
                  </div>
                </div>
              )}
              {!!agenda.private && (
                <div className="tooltip-icon">
                  <i className="fa fa-unlock-alt" />
                  <div className="tooltip right" role="tooltip">
                    <div className="tooltip-arrow" />
                    <div className="tooltip-inner">
                      {getLabel('privateAgenda')}
                    </div>
                  </div>
                </div>
              )}
            </div>
            {React.createElement(ActionsComponent, { agenda })}
          </div>
        </div>
      )),
  );
}
