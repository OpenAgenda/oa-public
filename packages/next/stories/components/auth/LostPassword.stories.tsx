import { http, HttpResponse } from 'msw';
import { Box } from '@openagenda/uikit';
import LostPassword from 'components/auth/LostPassword';
import AuthDialog from 'components/auth/AuthDialog';
import fetchLocale from 'app/locales';
import ProvidersDecorator from '../../decorators/ProvidersDecorator';

function WhiteSquareDecorator(Story) {
  return (
    <Box bg="white" p="6" borderRadius="md" maxW="sm" mx="auto" mt="10">
      <Story />
    </Box>
  );
}

const noop = () => {};

export default {
  title: 'components/auth/LostPassword',
  component: LostPassword,
  loaders: [
    async () => ({
      intlMessages: await fetchLocale('fr'),
    }),
  ],
  decorators: [WhiteSquareDecorator, ProvidersDecorator],
};

export function Default() {
  return <LostPassword onCancel={noop} />;
}

export function Success() {
  return <LostPassword onCancel={noop} />;
}

Success.parameters = {
  msw: {
    handlers: [
      http.post('/password/lost', () => HttpResponse.json({ success: true })),
    ],
  },
};

export function SuccessDisplay() {
  return <LostPassword defaultSuccess onCancel={noop} />;
}

export function Loading() {
  return <LostPassword defaultLoading onCancel={noop} />;
}

export function ServerError() {
  return <LostPassword onCancel={noop} />;
}

ServerError.parameters = {
  msw: {
    handlers: [
      http.post('/password/lost', () =>
        HttpResponse.json(
          {
            success: false,
            errors: {},
            message: 'Internal server error',
          },
          { status: 500 },
        ),
      ),
    ],
  },
};

export function InSigninDialog() {
  return <AuthDialog />;
}

InSigninDialog.decorators = [];

InSigninDialog.parameters = {
  msw: {
    handlers: [
      http.post('/signin', () =>
        HttpResponse.json({
          success: true,
          redirect: '/home',
        }),
      ),
      http.post('/password/lost', () => HttpResponse.json({ success: true })),
    ],
  },
};
