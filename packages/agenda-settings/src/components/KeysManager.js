import { useContext, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import CopyToClipboard from 'react-copy-to-clipboard';
import { MoreInfo } from '@openagenda/react-shared';
import * as keysActions from '../reducers/keys.js';
import * as modalsActions from '../reducers/modals.js';
import I18nContext from '../contexts/I18nContext.js';
import EditKeyForm from './EditKeyForm.js';

function Key({ item, index }) {
  const { getLabel } = useContext(I18nContext);

  const dispatch = useDispatch();

  const [inEdition, setInEdition] = useState(false);
  const [copied, setCopied] = useState(false);

  const onCopy = useCallback(() => {
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
    }, 2000);
  }, []);

  return (
    <div className="row margin-bottom-sm" key={index}>
      <div className="col-md-4">
        {inEdition ? (
          <EditKeyForm
            index={index}
            item={item}
            initialValues={{ label: item.label }}
            onSubmit={(values) =>
              dispatch(keysActions.update(item.key, values)).then(() =>
                setInEdition(false))}
            form={`edit-key-${item.id}`}
            cancel={() => setInEdition(false)}
          />
        ) : (
          <div className="input-group">
            <input
              type="text"
              className="form-control"
              value={item.label || getLabel('keyNbr', { nbr: index + 1 })}
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
        <div className="input-group">
          <input
            type="text"
            className="form-control"
            value={item.key}
            readOnly
          />
          <span className="input-group-btn">
            <MoreInfo content={copied ? getLabel('copied') : getLabel('copy')}>
              <CopyToClipboard text={item.key} onCopy={onCopy}>
                <button
                  type="button"
                  className="btn btn-primary"
                  aria-label={getLabel('copy')}
                >
                  <i className="fa fa-clipboard" aria-hidden="true" />
                </button>
              </CopyToClipboard>
            </MoreInfo>
            <button
              type="button"
              className="btn btn-default"
              onClick={() =>
                dispatch(
                  modalsActions.showModal('removeKey', { key: item.key }),
                )}
              aria-label={getLabel('remove')}
            >
              <i className="fa fa-trash text-danger" aria-hidden="true" />
            </button>
          </span>
        </div>
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
      {keys.map((item, index) => (
        <Key key={item.id} item={item} index={index} />
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
