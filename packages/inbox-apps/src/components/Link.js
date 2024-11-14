import { useSelector } from 'react-redux';
import { Link as RouterLink } from 'react-router-dom';
import omit from 'lodash/omit.js';
import removeTrailingSlash from '../utils/removeTrailingSlash.js';

const Link = (props) => {
  const { external: isExternal, agenda, to } = props;

  const prefix = useSelector((state) => state.settings.prefix);

  const Component = isExternal ? 'a' : RouterLink;

  const hrefOrTo = `${isExternal ? '' : removeTrailingSlash(prefix.replace(':slug', agenda?.slug))}${to}`;

  // Filter props to remove Redux-specific and unused props
  const filteredProps = omit(props, [
    'prefix',
    'external',
    'agenda',
    isExternal ? 'to' : undefined,
    'dispatch',
  ]);

  // Construct the final props for the component
  const finalProps = {
    ...filteredProps,
    [isExternal ? 'href' : 'to']: hrefOrTo,
  };

  return <Component {...finalProps} />;
};

export default Link;
