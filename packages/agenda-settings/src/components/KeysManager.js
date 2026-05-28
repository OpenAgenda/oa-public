import { useContext, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import CopyToClipboard from 'react-copy-to-clipboard';
import { MoreInfo } from '@openagenda/react-shared';
import * as keysActions from '../reducers/keys.js';
import * as modalsActions from '../reducers/modals.js';
import I18nContext from '../contexts/I18nContext.js';
import EditKeyForm from './EditKeyForm.js';

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

function Key({ item }) {
  const { getLabel } = useContext(I18nContext);
  const dispatch = useDispatch();

  // The plaintext is present only right after creation (shown once) for native
  // keys; legacy mirror keys carry their full value in `start` permanently.
  const revealed = useSelector((state) => state.keys.revealed?.[item.id]);
  const fullValue = revealed ?? (isLegacyKey(item) ? item.start : null);

  const [inEdition, setInEdition] = useState(false);
  const [copied, setCopied] = useState(false);

  const onCopy = useCallback(() => {
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, []);

  const removeButton = (
    <button
      type="button"
      className="btn btn-default"
      onClick={() =>
        dispatch(modalsActions.showModal('removeKey', { id: item.id }))}
      aria-label={getLabel('remove')}
    >
      <i className="fa fa-trash text-danger" aria-hidden="true" />
    </button>
  );

  return (
    <div className="row margin-bottom-sm">
      <div className="col-md-4">
        {inEdition ? (
          <EditKeyForm
            item={item}
            initialValues={{ name: item.name }}
            onSubmit={(values) =>
              dispatch(keysActions.update(item.id, values)).then(() =>
                setInEdition(false))}
            form={`edit-key-${item.id}`}
            cancel={() => setInEdition(false)}
          />
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
                  <CopyToClipboard text={fullValue} onCopy={onCopy}>
                    <button
                      type="button"
                      className="btn btn-primary"
                      aria-label={getLabel('copy')}
                    >
                      <i className="fa fa-clipboard" aria-hidden="true" />
                    </button>
                  </CopyToClipboard>
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

export default function KeysManager() {
  const { getLabel } = useContext(I18nContext);

  const dispatch = useDispatch();
  const keys = useSelector((state) => state.keys.data.items);

  return (
    <div>
      {keys.map((item) => (
        <Key key={item.id} item={item} />
      ))}
      <button
        type="button"
        className="btn btn-link btn-link-inline"
        onClick={() => dispatch(keysActions.create())}
      >
        {getLabel('generateKey')}
      </button>
    </div>
  );
}
