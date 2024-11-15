import head from './head.js';
import parseEvent from './parseEvent.js';

const tail = () => 'END:VCALENDAR\r\n';

export { head, parseEvent, tail };
