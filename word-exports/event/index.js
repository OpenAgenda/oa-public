import renderEvent from './render.js';

export default function event(config) {
  return {
    render: renderEvent.bind(null, config),
  };
}
