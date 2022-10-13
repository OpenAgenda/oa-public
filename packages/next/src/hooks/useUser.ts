// import session from '@openagenda/sessions/client';
import { useEffect } from 'react';
import Router from 'next/router';
import useSWR from 'swr';

const fetcher = url =>
  fetch(url)
    .then(r => r.json())
    .then(data => ({ user: data || null }));

// TODO wrap getServerSideProps with withUserSsr (https://github.com/vvo/iron-session/blob/main/next/index.ts#L54)
//   -> add req.session, getServerSideProps add the user to page props
// TODO layout to getLayout(pageProps) to use user

export default function useUser({ redirectTo = null, redirectIfFound = false } = {}) {
  // return typeof window !== 'undefined'
  //   ? session.getUser()
  //   : null;

  const { data, status, error } = useSWR('/users/me', fetcher);
  const user = data?.user;
  const finished = Boolean(data);
  const hasUser = Boolean(user);

  useEffect(() => {
    if (!redirectTo || !finished) return;
    if (
      // If redirectTo is set, redirect if the user was not found.
      // If redirectIfFound is also set, redirect if the user was found
      redirectTo && ((!redirectIfFound && !hasUser) || (redirectIfFound && hasUser))
    ) {
      Router.push(redirectTo);
    }
  }, [redirectTo, redirectIfFound, finished, hasUser]);

  return {
    user,
    status,
    error,
  };
}
