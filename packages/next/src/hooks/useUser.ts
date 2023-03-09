// import session from '@openagenda/sessions/client';
import { useEffect } from 'react';
import Router from 'next/router';
import useSWR from 'swr';
// import useRequest from 'hooks/useRequest';
import { FetchStatus } from 'config/types';

// TODO wrap getServerSideProps with withUserSsr (https://github.com/vvo/iron-session/blob/main/next/index.ts#L54)
//   -> add req.session, getServerSideProps add the user to page props
// TODO layout to getLayout(pageProps) to use user

function fetcher(url) {
  return fetch(url)
    .then(
      r => {
        if (r.ok) return r.json();
        if (r.status === 401) return null;
        // TODO should recreate an error with data in `await r.json()`
        // console.log('ERROR response', await r.json());
        throw new Error('Error');
      },
    );
}

export default function useUser({ redirectTo = null, redirectIfFound = false } = {}) {
  // return typeof window !== 'undefined'
  //   ? session.getUser()
  //   : null;

  // const { data: user, status, error } = useRequest<any>('/users/me');
  const { data: user, status, error } = useSWR('/users/me', fetcher);

  const finished = status !== FetchStatus.Fetching;
  const hasUser = Boolean(user);

  useEffect(() => {
    if (!finished) return;
    if (!redirectTo) return;
    // If redirectTo is set, redirect if the user was not found.
    // If redirectIfFound is also set, redirect if the user was found
    if ((!redirectIfFound && !hasUser) || (redirectIfFound && hasUser)) {
      Router.push(redirectTo);
    }
  }, [redirectTo, redirectIfFound, finished, hasUser]);

  return {
    user,
    status,
    error,
  };
}
