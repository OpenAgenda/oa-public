import React, { useState, useCallback, useContext } from 'react';
import CopyToClipboard from 'react-copy-to-clipboard';
import { useSelector } from 'react-redux';
import makeGetterLabel from '@openagenda/labels';
import { withLayoutData } from '@openagenda/react-shared';
import labels from '@openagenda/labels/agenda-admin/gettingStarted';
import I18nContext from '../contexts/I18nContext';

@withLayoutData('agenda')
export default function GettingStarted({ agenda }) {
  const { lang } = useContext(I18nContext);

  const getLabel = useCallback(
    (label, values = {}) => makeGetterLabel(labels)(label, values, lang),
    [lang]
  );

  const res = useSelector(state => state.res);
  const [copied, setCopied] = useState(false);

  const onCopy = useCallback(() => {
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }, []);

  return (
    <div>
      <div>
        <h2>{getLabel( 'title' )}</h2>
        <p className="text-muted">{getLabel( 'someActions' )}</p>
      </div>

      <div className="margin-v-lg">
        <p><b>{getLabel( 'addYourFirstEvent' )}</b></p>
        <div className="margin-v-md">
          <a className="btn btn-primary" href={res.addEvent.replace(':slug', agenda.slug)}>
            {getLabel( 'addEvent' )}
          </a>
        </div>
      </div>

      <div className="margin-v-lg">
        <b>{getLabel( 'sendLink' )}</b><br />
        <span className="text-muted">
            {getLabel( 'copyLinkAndSend' )}
          </span>
        <div className="row">
          <div className="input-group margin-top-md col-md-8 margin-left-sm">
            <input
              type="text"
              className="form-control"
              defaultValue={window.location.origin + res.agenda.replace(':slug', agenda.slug)}
              readOnly
            />
            <span className="input-group-btn">
                <CopyToClipboard text={window.location.origin + res.agenda.replace(':slug', agenda.slug)} onCopy={onCopy}>
                  <button className="btn btn-primary btn-block" title={getLabel( 'copyLink' )}>
                    <i className={`fa fa-${copied ? 'check' : 'clipboard'}`} aria-hidden="true" />
                  </button>
                </CopyToClipboard>
              </span>
          </div>
        </div>
      </div>

      <div className="margin-v-lg">
        <p><b>{getLabel( 'embedYourAgenda' )}</b></p>
        <div className="margin-v-md">
          <a className="btn btn-primary" href={res.createEmbed}>
            {getLabel( 'createEmbedded' )}
          </a><span className="margin-left-md">{getLabel('or')}</span><a target="_blank" href="https://developers.openagenda.com/tag/60-plugins" className="btn btn-link">{getLabel('useAPlugin')}</a>
        </div>
      </div>

      <div className="margin-v-lg">
        <p><b>{getLabel( 'needPrivate' )}</b></p>
        <div className="margin-v-md">
          <a className="btn btn-primary" href={`/support?origin=${encodeURIComponent(window.location.pathname)}&subject=privateAgenda`} target="_blank" rel="noopener noreferrer">
            {getLabel( 'requestPrivate' )}
          </a>

          <a
            className="margin-left-sm"
            href="https://doc.openagenda.com/visibilite-des-agendas/"
            target="_blank"
            rel="noopener noreferrer"
          >
            {getLabel( 'learnMore' )}
          </a>
        </div>
      </div>

      <div className="margin-v-lg">
        <p><b>{getLabel( 'needOfficial' )}</b></p>
        <div className="margin-v-md">
          <a className="btn btn-primary" href={`/support?origin=${encodeURIComponent(window.location.pathname)}&subject=officialAgenda`} target="_blank" rel="noopener noreferrer">
            {getLabel( 'requestOfficial' )}
          </a>
        </div>
      </div>
    </div>
  );
}
