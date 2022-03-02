import React, { useContext, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import CopyToClipboard from 'react-copy-to-clipboard';
import { MoreInfo } from '@openagenda/react-shared';
import EditKeyForm from './EditKeyForm';
import * as keysActions from '../reducers/keys';
import * as modalsActions from '../reducers/modals';
import I18nContext from '../contexts/I18nContext';

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
        {inEdition
          ? <EditKeyForm
            index={index}
            item={item}
            initialValues={{ label: item.label }}
            onSubmit={values => dispatch(keysActions.update(item.key, values)).then(() => setInEdition(false))}
            form={`edit-key-${item.id}`}
            cancel={() => setInEdition(false)}
          /> :
          <div className="input-group">
            <input
              type="text"
              className="form-control"
              value={item.label || getLabel('keyNbr', { nbr: index + 1 })}
              readOnly
            />
            <span className="input-group-btn">
              <button
                className="btn btn-default"
                onClick={() => setInEdition(true)}
              >
                <i className="fa fa-pencil" aria-hidden="true"></i>
              </button>
            </span>
          </div>}
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
              <MoreInfo
                id={`key-copy-${item.id}`}
                content={copied ? getLabel('copied') : getLabel('copy')}
              >
                <CopyToClipboard text={item.key} onCopy={onCopy}>
                  <button className="btn btn-primary">
                    <i className="fa fa-clipboard" aria-hidden="true"></i>
                  </button>
                </CopyToClipboard>
              </MoreInfo>
                <button
                  className="btn btn-default"
                  onClick={() => dispatch(modalsActions.showModal('removeKey', { key: item.key }))}
                >
                  <i className="fa fa-trash text-danger" aria-hidden="true"></i>
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
  const keys = useSelector(state => state.keys.data.items);

  return (
    <div>
      {keys.map((item, index) => <Key key={item.id} item={item} index={index} />)}
      <a
        style={{ cursor: 'pointer' }}
        onClick={() => dispatch(keysActions.create())}
      >
        {getLabel('generateKey')}
      </a>
    </div>
  );
}
