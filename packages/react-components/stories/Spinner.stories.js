import React from 'react';
import Spinner from '../src/Spinner';
import Decorator from './helpers/Decorator';

import '@openagenda/bs-templates/compiled/main.css';

export default {
  title: 'Spinner',
  component: Spinner,
  decorators: [Decorator]
};

export const Simple = () => <Spinner />;

export const Inline = () => <Spinner mode="inline" message="this is an inline spinner" />;

export const Message = () => <Spinner message="Look ma', I'm spinning! Weeee!" />;

export const Page = () => <Spinner page={true} message="this will close soon" />;
