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
      <EventState value="refused" />
    </li>
    <li className="margin-v-xs" key="toMod">
      <EventState value="toModerate" />
    </li>
    <li className="margin-v-xs" key="ready">
      <EventState value={1} />
    </li>
    <li className="margin-v-xs" key="publ">
      <EventState value="2" />
    </li>
    <li className="margin-v-xs" key="publ">
      <EventState value="2" displayLabel={false} />
    </li>
  </ul>
);
