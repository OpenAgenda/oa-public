import qs from 'qs';
import React, { useMemo } from 'react';
import { useHistory, useLocation, matchPath } from 'react-router-dom';
import ChildLayouts from '../components/ChildLayouts';
import Loading from '../components/Loading';

function createRequiredUser(options = {}) {
  const { inAgendaContext = false } = options;

  const fn = function RequiredUser({
    childLayouts,
    children,
    extraProps,
    fallback,
  }) {
    const history = useHistory();
    const location = useLocation();

    const { params } = useMemo(
      () => matchPath(location.pathname, '/:slug'),
      [location.pathname]
    );

    if (!extraProps.user) {
      const url = location.pathname + location.search;

      const query = {
        redirect: Buffer.from(url).toString('base64'),
      };

      const { lang } = qs.parse(location.search, { ignoreQueryPrefix: true });

      if (lang) {
        query.lang = lang;
      }

      const redirectUrl = (inAgendaContext ? `/${params.slug}/signin` : '/signin')
        + qs.stringify(query, { addQueryPrefix: true });

      if (typeof window === 'undefined') {
        history.replace(redirectUrl);
      } else {
        window.location.href = redirectUrl;
      }

      // Display Loading waiting redirection
      return <Loading />;
    }

    return (
      <ChildLayouts
        layouts={childLayouts}
        extraProps={extraProps}
        fallback={fallback}
      >
        {children}
      </ChildLayouts>
    );
  };

  fn.layoutName = inAgendaContext ? 'RequiredUser.agenda' : 'RequiredUser';

  return fn;
}

const RequiredUser = createRequiredUser();

RequiredUser.agenda = createRequiredUser({ inAgendaContext: true });

export default RequiredUser;
