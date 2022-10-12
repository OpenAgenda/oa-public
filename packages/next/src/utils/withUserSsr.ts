import {
  GetServerSidePropsContext,
  GetServerSidePropsResult,
} from 'next';

async function getUser(_req, _res) {
  return {
    fullName: 'Test user',
  };
}

export default function withUserSsr<P extends { [key: string]: unknown } = { [key: string]: unknown }>(
  handler: (
    context: GetServerSidePropsContext,
  ) => GetServerSidePropsResult<P> | Promise<GetServerSidePropsResult<P>>,
) {
  return async function nextGetServerSidePropsWithUser(
    context: GetServerSidePropsContext,
  ) {
    const user = await getUser(context.req, context.res);

    Object.defineProperty(
      context.req,
      'user',
      {
        enumerable: true,
        value: user,
      },
    );

    return handler(context);
  };
}
