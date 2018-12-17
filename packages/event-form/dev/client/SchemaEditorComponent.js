import React, { Component } from 'react';
import { render } from 'react-dom';

import JSONInput from 'react-json-editor-ajrm';
import locale    from 'react-json-editor-ajrm/locale/en';


export default class Editor extends Component {

  render() {

    return <JSONInput
      placeholder={this.props.schemas}
      onChange={this.props.onChange}
      width="100%" />

  }

}
