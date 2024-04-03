import EventState from '../src/components/EventState';
import SmallCanvas from './decorators/SmallCanvas';

import '@openagenda/bs-templates/compiled/main.css';

export default {
  title: 'EventState',
  component: EventState,
  decorators: [SmallCanvas],
};

export const WithAndWithoutLabel = () => (
  <ul className="list-unstyled">
    <li className="margin-v-xs" key="toMod">
      <EventState value="refused" id="1" />
    </li>
    <li className="margin-v-xs" key="toMod">
      <EventState value="toModerate" id="2" />
    </li>
    <li className="margin-v-xs" key="ready">
      <EventState value={1} id="3" />
    </li>
    <li className="margin-v-xs" key="publ">
      <EventState value="2" id="4" />
    </li>
    <li className="margin-v-xs" key="publ">
      <EventState value="2" displayLabel={false} id="5" />
    </li>
  </ul>
);
