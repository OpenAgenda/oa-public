import React from 'react';

function AgendaHeader(props) {
  const { agenda } = props;
  return (
    <header className="agenda-header">
      <div className="container profile notheme">
        <div className="row">
          {agenda.image ? (
            <div className="col-sm-2 avatar-container">
              <a href={`/${agenda.slug}`}>
                <img className="avatar" src={agenda.image} alt={agenda.title} />
              </a>
            </div>
          ) : null}
          <div
            className={`${
              agenda.image ? 'col-sm-7' : 'col-sm-9'
            } title-container`}
          >
            <a href={`/${agenda.slug}`}>
              <div className="agenda-title">
                <h1>{agenda.title}</h1>
              </div>
              <p>{agenda.description}</p>
              {agenda.url ? (
                <a href={agenda.url} rel="noreferrer" target="_blank">
                  {agenda.url}
                </a>
              ) : null}
            </a>
          </div>
        </div>
      </div>
    </header>
  );
}

export default AgendaHeader;
