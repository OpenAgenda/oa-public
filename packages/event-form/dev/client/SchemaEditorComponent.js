import React, { Component } from 'react';
import { render } from 'react-dom';

import JSONInput from 'react-json-editor-ajrm';
import locale    from 'react-json-editor-ajrm/locale/en';


export default class Editor extends Component {

  constructor( props ) {

    super( props );

    this.state = {
      updated: this.props.schemas
    }

  }

  onChange( updated ) {

    this.setState( { updated } );

  }

  onSubmit() {

    this.props.onChange( this.state.updated );

  }

  render() {

    return <div>
      <JSONInput
        placeholder={this.props.schemas}
        onChange={this.onChange.bind( this )}
        width="100%" />
      <button className="btn btn-primary margin-top-sm btn-block" onClick={this.onSubmit.bind( this )}>Submit</button>
    </div>

  }

}
