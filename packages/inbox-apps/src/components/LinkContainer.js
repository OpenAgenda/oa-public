import { useSelector } from 'react-redux';
import removeTrailingSlash from '../utils/removeTrailingSlash.js';

const LinkContainer = (props) => {
  const prefix = useSelector((state) => state.settings.prefix);

  const to = props.external
    ? ''
    : removeTrailingSlash(
      prefix.replace(':slug', props.agenda && props.agenda.slug),
    ) + props.to;

  return props.children(to);
};

export default LinkContainer;
