import React from 'react';
import { action } from '@storybook/addon-actions';
import { FiltersProvider, DateRangeFilter } from '../src';

require('@openagenda/bs-templates/compiled/main.css');

const lang = 'fr';

export default {
  title: 'OpenAgenda/Demo'
};

export const CompleteExample = () => (
  <FiltersProvider onSubmit={action('onSubmit')} locale={lang}>
    <div className="rc-collapse">
      <DateRangeFilter name="date" />
      <DateRangeFilter name="createdAt" />
      <DateRangeFilter name="updatedAt" />
    </div>
  </FiltersProvider>
);
CompleteExample.storyName = 'Complete example';
CompleteExample.argTypes = { onClick: { action: 'clicked' } };
