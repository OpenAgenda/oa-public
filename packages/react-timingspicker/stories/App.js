import React, { Component } from 'react';
import TimingsPicker from '../src';

class App extends Component {
  state = {
    value: null,
    allowedTimings: [
      {
        begin: '2019-05-15',
        end: '2019-05-16'
      },
      {
        begin: '2019-05-17',
        end: '2019-05-24'
      }
    ]
  };

  onChange = value => {
    console.log( 'onChange', value );
    this.setState( { value } );
  };

  render() {
    const { locale } = this.props;
    const { value, allowedTimings } = this.state;

    return (
      <TimingsPicker
        value={value}
        onChange={this.onChange}
        // activeWeek={activeWeek}
        // onChangeActiveWeek={this.onChangeActiveWeek}
        allowedTimings={allowedTimings}
        locale={locale}
      />
    );
  }
}

export default App;
