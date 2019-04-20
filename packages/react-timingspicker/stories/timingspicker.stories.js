import React from 'react';
import { storiesOf } from '@storybook/react';
import App from './App';
import '../src/App.css';

storiesOf( 'App', module )
  .add( 'all', () => <App /> )
  .add( 'in French language', () => <App locale="fr" /> );
