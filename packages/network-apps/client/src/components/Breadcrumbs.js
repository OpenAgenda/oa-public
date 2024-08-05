import _ from 'lodash';
import { Link, generatePath } from 'react-router-dom';

import getPaths from '../getPaths';

function extractCrumbs(routePatterns, match) {
  const parts = match.path.split('/');

  const result = parts
    .reduce(
      (crumbPaths, part, index) =>
        crumbPaths.concat(parts.filter((p, i) => i <= index).join('/')),
      [],
    )
    .filter((pattern) => routePatterns.indexOf(pattern) !== -1)
    .map((pattern) => ({
      path: generatePath(pattern, match.params),
      pattern,
      exact: match.path === pattern,
    }));
  return result;
}

export default (props) => {
  const {
    match,
    config: { base },
    secondaryNavLinks = null,
  } = props;
  return (
    <>
      {secondaryNavLinks
        ? secondaryNavLinks.map(({ path, label }) => (
            <Link
              className="pull-right margin-all-xs margin-right-sm"
              to={path}
            >
              {label}
            </Link>
          ))
        : null}
      <ol className="margin-v-z breadcrumb">
        {extractCrumbs(Object.values(getPaths(base)), match).map((crumb) => (
          <Crumb key={crumb.pattern} {...props} {...crumb} />
        ))}
      </ol>
    </>
  );
};

const Crumb = (props) => {
  const {
    path,
    pattern,
    exact,
    config: { base },
  } = props;

  return (
    <li className={exact ? 'active' : null}>
      <Link to={path}>
        {_.get(
          _.mapKeys(
            {
              '': 'Réseaux',
              '/:uid': _.get(props, 'network.network.title'),
              '/:uid/agendas': 'Agendas',
            },
            (v, k) => base + k,
          ),
          pattern,
          'Là il faut dire quelque chose.',
        )}
      </Link>
    </li>
  );
};
