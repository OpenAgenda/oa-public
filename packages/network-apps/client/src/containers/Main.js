import _ from 'lodash';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Link } from "react-router-dom";

import reducers from '../reducers';

import Header from '../components/Header';

class Main extends Component {

  componentDidMount() {

    this.props.onMount();

  }

  renderAdd() {

    const { onAddChange, onAddSubmit } = this.props;

    return <form className="form-inline" onSubmit={onAddSubmit}>
      <div className="form-group">
        <label className="margin-right-xs" htmlFor="title">Nom du réseau</label>
        <input type="text" className="form-control margin-right-xs" name="title" onChange={onAddChange.bind( null, 'title' )} />
      </div>
      <button type="submit" className="btn btn-primary">Créer</button>
    </form>

  }

  render() {

    const networks = _.get( this.props, 'main.networks', [] );
    const add = _.get( this.props, 'main.add', false );
    const { onAdd } = this.props;
    const base = this.props.config.base;

    return <div>
      <Header {...this.props} />
      <div className="margin-v-sm text-right">
        { add ? this.renderAdd() : <button className="btn btn-primary" onClick={onAdd}>Ajouter un nouveau réseau</button> }
      </div>
      <ul className="list-unstyled">{networks.map( n => <li key={n.uid}>
        <div className="margin-v-sm wsq padding-all-sm">
          <label>{n.title}</label>
          <ul className="list-inline">
            <li>
              <Link to={`${base}/networks/${n.uid}`}>Editer</Link>
            </li>
            <li>
              <Link to={`${base}/networks/${n.uid}/agendas`}>Agendas</Link>
            </li>
          </ul>
        </div>
      </li> )}</ul>
    </div>

  }

}

// container bit
export default connect(
  state => state,
  dispatch => ( {
    onMount: () => dispatch( reducers.main.load() ),
    onAdd: () => dispatch( reducers.main.add() ),
    onAddChange: ( field, e ) => dispatch( reducers.main.addChange( field, e.target.value ) ),
    onAddSubmit: e => dispatch( reducers.main.addSubmit( e ) )
  } )
)( Main );
