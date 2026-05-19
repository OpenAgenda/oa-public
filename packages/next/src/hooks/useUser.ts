import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import useSWR from 'swr';
import ky from 'ky';
import { FetchStatus } from 'config/types';

type User = {
  uid: number;
  fullName?: string;
  username?: string;
  email?: string;
  culture?: string;
  image?: string | null;
  isNew?: boolean;
  createdAt?: string;
  updatedAt?: string;
  hasSocialAccount?: boolean;
  hasLocalAccount?: boolean;
  announcement?: {
    id: string;
    kind: 'primary' | 'info' | 'success' | 'warning' | 'danger';
    content: string;
  } | null;
};

// TODO wrap getServerSideProps with withUserSsr (https://github.com/vvo/iron-session/blob/main/next/index.ts#L54)
//   -> add req.session, getServerSideProps add the user to page props
// TODO layout to getLayout(pageProps) to use user

function fetcher(url: string): Promise<User> {
  return ky(url, {
    hooks: {
      afterResponse: [
        (_request, _options, response) => {
          if (response.status === 401) return new Response();
        },
      ],
    },
  }).json<User>();
}

export default function useUser({
  redirectTo = null,
  redirectIfFound = false,
} = {}) {
  const router = useRouter();
  const { data: user, status, error } = useSWR<User>('/users/me', fetcher);

  const finished = status !== FetchStatus.Fetching;
  const hasUser = Boolean(user);

  useEffect(() => {
    if (!finished) return;
    if (!redirectTo) return;
    // If redirectTo is set, redirect if the user was not found.
    // If redirectIfFound is also set, redirect if the user was found
    if ((!redirectIfFound && !hasUser) || (redirectIfFound && hasUser)) {
      router.push(redirectTo);
    }
  }, [redirectTo, redirectIfFound, finished, hasUser, router]);

  return {
    user,
    status,
    error,
  };
}
