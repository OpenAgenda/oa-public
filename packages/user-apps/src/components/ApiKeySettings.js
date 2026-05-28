import { useContext, useState, useCallback } from 'react';
import { useHistory } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { MoreInfo, Spinner } from '@openagenda/react-shared';
import * as keysActions from '../reducers/userKeys.js';
import I18nContext from '../contexts/I18nContext.js';

// Non-secret hint for a native stored key: the plugin keeps the first
// characters (`start`), the rest is masked. Native key material is never
// recoverable after creation (the store hashes it).
function maskedHint(item) {
  return item.start ? `${item.start}••••••••` : '••••••••••••';
}

// Keys mirrored from the legacy `key` table keep `start` = the full plaintext,
// so they stay fully visible exactly as they were in the pre-migration UI.
function isLegacyKey(item) {
  return item.metadata?.source === 'mirror';
}

function KeyRow({ item, onRemove }) {
  const { getLabel } = useContext(I18nContext);
  const dispatch = useDispatch();

  // The plaintext is present only right after creation (shown once) for native
  // keys; legacy mirror keys carry their full value in `start` permanently.
  const revealed = useSelector((state) => state.userKeys.revealed?.[item.id]);
  const fullValue = revealed ?? (isLegacyKey(item) ? item.start : null);

  const [inEdition, setInEdition] = useState(false);
  const [name, setName] = useState(item.name || '');
  const [copied, setCopied] = useState(false);

  const tier = item.metadata?.oaKind === 'pk' ? 'publicKey' : 'secretKey';

  const onCopy = useCallback(() => {
    navigator.clipboard?.writeText(fullValue);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [fullValue]);

  const removeButton = (
    <button
      type="button"
      className="btn btn-default"
      onClick={() => onRemove(item.id)}
      aria-label={getLabel('remove')}
    >
      <i className="fa fa-trash text-danger" aria-hidden="true" />
    </button>
  );

  return (
    <div className="row margin-bottom-sm">
      <div className="col-md-4">
        {inEdition ? (
          <div className="input-group">
            <input
              type="text"
              className="form-control"
              value={name}
              placeholder={getLabel('keyDefaultName', { id: item.id })}
              onChange={(e) => setName(e.target.value)}
            />
            <span className="input-group-btn">
              <MoreInfo content={getLabel('cancel')}>
                <button
                  type="button"
                  className="btn btn-default"
                  onClick={() => {
                    setName(item.name || '');
                    setInEdition(false);
                  }}
                  aria-label={getLabel('cancel')}
                >
                  <i className="fa fa-ban text-danger" aria-hidden="true" />
                </button>
              </MoreInfo>
              <MoreInfo content={getLabel('save')}>
                <button
                  type="button"
                  className="btn btn-default"
                  onClick={() =>
                    dispatch(keysActions.update(item.id, { name })).then(() =>
                      setInEdition(false))}
                  aria-label={getLabel('save')}
                >
                  <i className="fa fa-check text-primary" aria-hidden="true" />
                </button>
              </MoreInfo>
            </span>
          </div>
        ) : (
          <div className="input-group">
            <input
              type="text"
              className="form-control"
              value={item.name || getLabel('keyDefaultName', { id: item.id })}
              readOnly
            />
            <span className="input-group-btn">
              <button
                type="button"
                className="btn btn-default"
                onClick={() => setInEdition(true)}
                aria-label={getLabel('edit')}
              >
                <i className="fa fa-pencil" aria-hidden="true" />
              </button>
            </span>
          </div>
        )}
        <small className="text-muted">{getLabel(tier)}</small>
      </div>

      <div className="col-md-8">
        {fullValue ? (
          <>
            <div className="input-group">
              <input
                type="text"
                className="form-control"
                value={fullValue}
                readOnly
              />
              <span className="input-group-btn">
                <MoreInfo
                  content={copied ? getLabel('copied') : getLabel('copy')}
                >
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={onCopy}
                    aria-label={getLabel('copy')}
                  >
                    <i className="fa fa-clipboard" aria-hidden="true" />
                  </button>
                </MoreInfo>
                {removeButton}
              </span>
            </div>
            {revealed && (
              <small className="text-warning">{getLabel('keyShownOnce')}</small>
            )}
          </>
        ) : (
          <div className="input-group">
            <input
              type="text"
              className="form-control"
              value={maskedHint(item)}
              readOnly
              disabled
            />
            <span className="input-group-btn">{removeButton}</span>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ApiKeySettings({ activeTab, displayModal }) {
  const { getLabel } = useContext(I18nContext);
  const history = useHistory();
  const dispatch = useDispatch();

  const prefix = useSelector((state) => state.settings.prefix);
  const loaded = useSelector((state) => state.userKeys.loaded);
  const items = useSelector((state) => state.userKeys.data?.items ?? []);

  const onRemove = useCallback(
    (id) =>
      displayModal({
        visible: true,
        title: getLabel('removeKey'),
        content: <p>{getLabel('removeKeyWarning')}</p>,
        action: () => dispatch(keysActions.remove(id)),
        actionText: getLabel('remove'),
        buttonClass: 'btn btn-danger',
      }),
    [displayModal, dispatch, getLabel],
  );

  return (
    <tr
      onClick={
        !activeTab
          ? () => history.push(`${prefix}/apiKey`, { fromUserApps: true })
          : null
      }
      className={!activeTab ? 'inactive' : ''}
    >
      <td
        role="gridcell"
        onClick={
          activeTab
            ? () => history.push(`${prefix}/`, { fromUserApps: true })
            : null
        }
        className="col-md-3"
        style={{ cursor: 'pointer' }}
      >
        {getLabel('apiKeys')}
      </td>
      {activeTab ? (
        <td>
          <div style={{ padding: '0 5px' }}>
            <p>{getLabel('apiKeyInformation')}</p>
            <p>
              <a href="https://developers.openagenda.com">
                {getLabel('showDocumentation')}
              </a>
            </p>
            <p className="text-muted">{getLabel('apiKeyTiersHelp')}</p>

            {!loaded ? (
              <Spinner />
            ) : (
              <>
                {items.map((item) => (
                  <KeyRow key={item.id} item={item} onRemove={onRemove} />
                ))}
                <div className="margin-top-sm">
                  <button
                    type="button"
                    className="btn btn-default margin-right-sm"
                    onClick={() => dispatch(keysActions.create('pk'))}
                  >
                    {getLabel('generatePublicKey')}
                  </button>
                  <button
                    type="button"
                    className="btn btn-default"
                    onClick={() => dispatch(keysActions.create('sk'))}
                  >
                    {getLabel('generateSecretKey')}
                  </button>
                </div>
              </>
            )}
          </div>
        </td>
      ) : (
        <td style={{ cursor: 'pointer' }}>{getLabel('showApiKeys')}</td>
      )}
    </tr>
  );
}
