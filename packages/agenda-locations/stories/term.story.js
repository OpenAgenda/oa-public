import React, { Component } from 'react';

import TermApp from '../components/src/TermSelector';
import TermPickerApp from '../components/src/TermSelectorPicker';

class BaseTermStory extends Component {
  constructor(props) {
    super(props);

    this.state = {
      term: '',
      pickedTerm: {
        region: 'Champagne-Ardenne',
        department: 'Aube',
      },
    };
  }

  render() {
    return (
      <div className="top-margined col-sm-8 col-sm-offset-2 wsq content">
        <TermApp
          lang="fr"
          field="region,countryCode"
          res={`${this.props.apiRoot}/terms`}
          value={this.state.term}
          onChange={term => this.setState({ term })}
        />
        <div
          className="separator"
          style={{ marginTop: '1em', marginBottom: '1em' }}
        ></div>
        <TermPickerApp
          lang={this.state.lang}
          fields={{
            region: 'region,countryCode',
            department: 'department,region',
            city: 'city,region',
          }}
          res={`${this.props.apiRoot}/terms`}
          value={this.state.pickedTerm}
          labels={{
            region: { fr: 'région', en: 'region' },
            department: { fr: 'département', en: 'department' },
            city: { fr: 'ville', en: 'city' },
          }}
          onChange={pickedTerm => this.setState({ pickedTerm })}
        />
      </div>
    );
  }
}

export default props => <BaseTermStory {...props} />;
