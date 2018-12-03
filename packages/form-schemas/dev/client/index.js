import _ from 'lodash';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { render } from 'react-dom';

import { cases, groups } from '../cases';

if ( module.hot ) module.hot.accept();

class Main extends Component {

  render() {

    return <div className="margin-top-lg container col-lg-offset-1 col-lg-10">

      <div className="row margin-v-lg">
        <h1>Development pages index</h1>
      </div>

      { _.uniq( cases.map( a => a.group ) ).map( ( g, gi ) => <div key={'group'+gi}>
        <h2>{g ? _.get( groups.filter( group => g === group.slug ), '0.label' ) : 'Other' }</h2>
        {_.chunk( cases.filter( a => a.group === g ), 4 ).map( ( chunk, i ) =><div key={['group', gi, i].join( '-' )} className="row margin-top-md">
          {chunk.map( app =>
            <div className="col-lg-3" key={app.link.substr( 1 )}>
              <div className="wsq padding-v-sm padding-h-md">
                <label>{app.name}</label>
                <p>{app.description}</p>
                <a href={app.link}>Open</a>
              </div>
            </div>
          )}
        </div> ) }
      </div> ) }

    </div>

  }

}

render( <Main />, document.getElementById( 'app' ) );
