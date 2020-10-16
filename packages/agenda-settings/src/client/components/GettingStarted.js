import React, { useState, useCallback, useContext } from 'react';
import CopyToClipboard from 'react-copy-to-clipboard';
import { useSelector } from 'react-redux';
import openRequestForm from '@openagenda/call-to-action/dist/openRequestForm';
import makeGetterLabel from '@openagenda/labels';
import labels from '@openagenda/labels/agenda-admin/gettingStarted';
import I18nContext from '../contexts/I18nContext';

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
          </a>
        </div>
      </div>

      <div className="margin-v-lg">
        <p><b>{getLabel( 'needPrivate' )}</b></p>
        <div className="margin-v-md">
          <button className="btn btn-primary" onClick={() => openRequestForm( {
            lang,
            subject: 'privateAgenda',
            agenda: res.agenda.replace(':slug', agenda.slug)
          } )}>
            {getLabel( 'requestPrivate' )}
          </button>

          <a
            className="margin-left-sm"
            href="https://openagenda.zendesk.com/hc/fr/articles/115001584389-Visibilit%C3%A9-des-OpenAgendas-public-d%C3%A9sindex%C3%A9-priv%C3%A9"
          >
            {getLabel( 'learnMore' )}
          </a>
        </div>
      </div>

      <div className="margin-v-lg">
        <p><b>{getLabel( 'needOfficial' )}</b></p>
        <div className="margin-v-md">
          <button className="btn btn-primary" onClick={() => openRequestForm( {
            lang,
            subject: 'officialAgenda',
            agenda: res.agenda.replace(':slug', agenda.slug)
          } )}>
            {getLabel( 'requestOfficial' )}
          </button>
        </div>
      </div>
    </div>
  );
}
