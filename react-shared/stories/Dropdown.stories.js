import React, { useState } from 'react';

import SimpleCanvas from './decorators/SimpleCanvas';
import Dropdown from '../src/components/Dropdown';

// eslint-disable-next-line
import '@openagenda/bs-templates/compiled/main.css';

export default {
  title: 'Dropdown',
  component: Dropdown,
  decorators: [SimpleCanvas],
};

export const Simple = () => (<>
  <Dropdown
    Trigger={props => <button {...props} className="btn btn-link">Click here to toggle</button>}
  >
    <div className="padding-h-xs">Click outside the menu to close</div>
  </Dropdown>
  <Dropdown
    Trigger={props => <button {...props} className="btn btn-link">Click here to toggle another dropdown</button>}
  >
    <div className="padding-h-xs">Click outside the menu to close</div>
  </Dropdown>
</>
);
