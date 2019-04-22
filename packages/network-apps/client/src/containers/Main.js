import _ from 'lodash';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Link } from "react-router-dom";

import reducers from '../reducers';

class Main extends Component {

  componentDidMount() {

    this.props.onMount();

  }

  render() {

    const networks = _.get( this.props, 'main.networks', [] );
    const base = this.props.config.base;

    return <ul className="list-unstyled">{networks.map( n => <li key={n.uid}>
      <div className="margin-v-sm wsq padding-all-sm">
        <label>{n.title}</label>
        <ul className="list-inline">
          <li>
            <Link to={`${base}/networks/${n.uid}`}>Editer</Link>
          </li>
        </ul>
      </div>
    </li> )}</ul>

  }

}

// container bit
export default connect(
  state => state,
  dispatch => ( {
    onMount: () => dispatch( reducers.main.load() )
  } )
)( Main );
