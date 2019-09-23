import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import update from 'immutability-helper';
import CopyToClipboard from 'react-copy-to-clipboard';
import MoreInfo from '@openagenda/react-components/build/MoreInfo';
import EditKeyForm from './EditKeyForm';
import * as keysActions from '../reducers/keys';
import * as modalsActions from '../reducers/modals';

@connect(
  state => ({
    keys: state.keys.data.items,
    total: state.keys.data.total
  }),
  { ...keysActions, ...modalsActions }
)
export default class KeysManager extends Component {

  constructor() {
    super();
    this.renderKey = ::this.renderKey;
    this.handleCopy = ::this.handleCopy;
    this.closeEdition = ::this.closeEdition;
  }

  static contextTypes = {
    getLabel: PropTypes.func,
    lang: PropTypes.string
  };

  state = {
    inEdition: [],
    copied: []
  };

  closeEdition( id ) {
    this.setState( update( this.state, {
      inEdition: { $apply: arr => arr.filter( v => v !== id ) }
    } ) );
  }

  handleCopy( id ) {
    this.setState( update( this.state, { copied: { $push: [ id ] } } ) );
    setTimeout( () => {
      this.setState( update( this.state, {
        copied: { $apply: arr => arr.filter( v => v !== id ) }
      } ) );
    }, 2000 );
  }

  renderKey( item, index ) {
    const { update: updateKey, showModal } = this.props;
    const { getLabel } = this.context;
    const { copied, inEdition } = this.state;

    return (
      <div className="row margin-bottom-sm" key={index}>
        <div className="col-md-4">
          {inEdition.includes( item.id )
            ? <EditKeyForm
              index={index}
              item={item}
              initialValues={{ label: item.label }}
              onSubmit={values => updateKey( item.key, values ).then( () => this.closeEdition( item.id ) )}
              form={`edit-key-${item.id}`}
              cancel={this.closeEdition.bind( this, item.id )}
            /> :
            <div className="input-group">
              <input
                type="text"
                className="form-control"
                value={item.label || getLabel( 'keyNbr', { nbr: index + 1 } )}
                readOnly
              />
              <span className="input-group-btn">
                <button
                  className="btn btn-default"
                  onClick={() => this.setState( update( this.state, { inEdition: { $push: [ item.id ] } } ) )}
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
                content={copied.includes( item.id ) ? getLabel( 'copied' ) : getLabel( 'copy' )}
              >
                <CopyToClipboard text={item.key} onCopy={() => this.handleCopy( item.id )}>
                  <button className="btn btn-primary">
                    <i className="fa fa-clipboard" aria-hidden="true"></i>
                  </button>
                </CopyToClipboard>
              </MoreInfo>
                <button
                  className="btn btn-default"
                  onClick={() => showModal( 'removeKey', { key: item.key } )}
                >
                  <i className="fa fa-trash text-danger" aria-hidden="true"></i>
                </button>
            </span>
          </div>
        </div>
      </div>
    );
  }

  render() {

    const { keys, create } = this.props;
    const { getLabel } = this.context;

    return (
      <div>
        {keys.map( this.renderKey )}
        <a
          style={{ cursor: 'pointer' }}
          onClick={() => create()}
        >
          {getLabel( 'generateKey' )}
        </a>
      </div>
    );

  }

}
