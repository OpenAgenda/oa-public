import { http, HttpResponse } from 'msw';
import { Box } from '@openagenda/uikit';
import Signin from 'components/auth/Signin';
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

export default {
  title: 'components/auth/Signin',
  component: Signin,
  loaders: [
    async () => ({
      intlMessages: await fetchLocale('fr'),
    }),
  ],
  decorators: [WhiteSquareDecorator, ProvidersDecorator],
};

export function Default() {
  return <Signin />;
}

Default.parameters = {
  msw: {
    handlers: [
      http.post('/signin', () =>
        HttpResponse.json({
          success: true,
          redirect: '/home',
        }),
      ),
    ],
  },
};

export function InvalidCredentials() {
  return <Signin defaultInvalidCredentials />;
}

InvalidCredentials.parameters = {
  msw: {
    handlers: [
      http.post('/signin', () =>
        HttpResponse.json(
          {
            success: false,
            errors: { password: 'Mot de passe incorrect' },
            message: null,
          },
          { status: 400 },
        ),
      ),
    ],
  },
};

export function Success() {
  return <Signin />;
}

Success.parameters = {
  msw: {
    handlers: [
      http.post('/signin', () =>
        HttpResponse.json({
          success: true,
          redirect: '/home',
        }),
      ),
    ],
  },
};

export function SuccessRedirecting() {
  return <Signin defaultSuccess />;
}

export function AccountNotActivated() {
  return <Signin />;
}

AccountNotActivated.parameters = {
  msw: {
    handlers: [
      http.post('/signin', () =>
        HttpResponse.json({
          success: false,
          redirect: '/activate/resend?email=test@example.com',
          reason: 'activation_required',
        }),
      ),
    ],
  },
};

export function Loading() {
  return <Signin defaultLoading />;
}

export function ServerError() {
  return <Signin />;
}

ServerError.parameters = {
  msw: {
    handlers: [
      http.post('/signin', () =>
        HttpResponse.json(
          {
            success: false,
            message: 'Internal server error',
          },
          { status: 500 },
        ),
      ),
    ],
  },
};

export function InDialog() {
  return <AuthDialog />;
}

InDialog.decorators = [];

InDialog.parameters = {
  msw: {
    handlers: [
      http.post('/signin', () =>
        HttpResponse.json({
          success: true,
          redirect: '/home',
        }),
      ),
    ],
  },
};
