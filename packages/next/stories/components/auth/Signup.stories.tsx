import { http, HttpResponse } from 'msw';
import { Box } from '@openagenda/uikit';
import Signup from 'components/auth/Signup';
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
  title: 'components/auth/Signup',
  component: Signup,
  loaders: [
    async () => ({
      intlMessages: await fetchLocale('fr'),
    }),
  ],
  decorators: [WhiteSquareDecorator, ProvidersDecorator],
};

const successHandler = http.post('/signup', () =>
  HttpResponse.json({
    success: true,
    redirect: '/signup/complete?email=jane.doe%40example.com',
  }),
);

// Mock password evaluator: maps password length to a fake strength score.
// Mirrors the cibul-templates testPostEvaluate stub.
const passwordEvaluateHandler = http.post(
  '/api/password/evaluate',
  async ({ request }) => {
    const body = (await request.json()) as {
      password: string;
      identifiers?: { full_name?: string; email?: string };
    };
    const pwd = body.password ?? '';
    const ids = [body.identifiers?.full_name, body.identifiers?.email].filter(
      Boolean,
    );
    if (ids.some((id) => id && pwd.includes(id))) {
      return HttpResponse.json({
        message: { type: 'error', code: 'isSameAs' },
      });
    }
    if (!pwd) {
      return HttpResponse.json({
        message: { type: 'error', code: 'required' },
      });
    }
    if (pwd.length < 4) {
      return HttpResponse.json({
        message: { type: 'error', code: 'tooWeak' },
      });
    }
    if (pwd.length < 6) {
      return HttpResponse.json({
        message: { type: 'warning', code: 'weak' },
      });
    }
    if (pwd.length < 8) {
      return HttpResponse.json({
        message: { type: 'warning', code: 'weakish' },
      });
    }
    if (pwd.length < 12) {
      return HttpResponse.json({
        message: { type: 'ok', code: 'good' },
      });
    }
    return HttpResponse.json({
      message: { type: 'ok', code: 'great' },
    });
  },
);

const captchaProps = {
  mtCaptchaEnabled: true,
  mtCaptchaSiteKey: 'STORY_KEY',
  captchaProvider: 'mock' as const,
};

export function Default() {
  return <Signup {...captchaProps} />;
}

Default.parameters = {
  msw: { handlers: [successHandler, passwordEvaluateHandler] },
};

export function Loading() {
  return <Signup {...captchaProps} defaultLoading />;
}

export function Success() {
  return <Signup {...captchaProps} defaultSuccess />;
}

export function WithErrors() {
  return <Signup {...captchaProps} />;
}

WithErrors.parameters = {
  msw: {
    handlers: [
      http.post('/signup', () =>
        HttpResponse.json(
          {
            success: false,
            errors: {
              fullName: 'fieldCannotBeEmpty',
              email: 'usedEmail',
              password: 'tooWeak',
              repeat: 'passwordNotEqual',
              captcha: 'captchaTryAgain',
            },
            message: null,
          },
          { status: 400 },
        ),
      ),
      passwordEvaluateHandler,
    ],
  },
};

export function ServerError() {
  return <Signup {...captchaProps} />;
}

ServerError.parameters = {
  msw: {
    handlers: [
      http.post('/signup', () =>
        HttpResponse.json(
          {
            success: false,
            message: 'Internal server error',
          },
          { status: 500 },
        ),
      ),
      passwordEvaluateHandler,
    ],
  },
};

export function WithAgenda() {
  return <Signup {...captchaProps} agenda={{ slug: 'demo', uid: '1' }} />;
}

export function CaptchaDisabled() {
  return <Signup />;
}

CaptchaDisabled.parameters = {
  msw: { handlers: [successHandler, passwordEvaluateHandler] },
};

export function SignupCompleteFlow() {
  return <AuthDialog mtCaptchaSiteKey="STORY_KEY" captchaProvider="mock" />;
}

SignupCompleteFlow.decorators = [];

SignupCompleteFlow.parameters = {
  msw: {
    handlers: [
      http.post('/signup', () =>
        HttpResponse.json({
          success: true,
          email: 'jane.doe@example.com',
          redirect: '/signup/complete?email=jane.doe%40example.com',
          resendUrl: '/activate/resend?email=jane.doe%40example.com',
        }),
      ),
      passwordEvaluateHandler,
      http.post('/signin', () =>
        HttpResponse.json({ success: true, redirect: '/home' }),
      ),
      http.get('/activate/resend', () => HttpResponse.json({ success: true })),
    ],
  },
};

export function SignupCompleteResendError() {
  return <AuthDialog mtCaptchaSiteKey="STORY_KEY" captchaProvider="mock" />;
}

SignupCompleteResendError.decorators = [];

SignupCompleteResendError.parameters = {
  msw: {
    handlers: [
      http.post('/signup', () =>
        HttpResponse.json({
          success: true,
          email: 'jane.doe@example.com',
          redirect: '/signup/complete?email=jane.doe%40example.com',
          resendUrl: '/activate/resend?email=jane.doe%40example.com',
        }),
      ),
      passwordEvaluateHandler,
      http.post('/signin', () =>
        HttpResponse.json({ success: true, redirect: '/home' }),
      ),
      http.get('/activate/resend', () =>
        HttpResponse.json(
          { success: false, message: 'Internal server error' },
          { status: 500 },
        ),
      ),
    ],
  },
};

WithAgenda.parameters = {
  msw: {
    handlers: [
      http.post('/demo/signup', () =>
        HttpResponse.json({
          success: true,
          redirect: '/signup/complete?email=jane.doe%40example.com',
        }),
      ),
      passwordEvaluateHandler,
    ],
  },
};

export function InDialog() {
  return <AuthDialog mtCaptchaSiteKey="STORY_KEY" captchaProvider="mock" />;
}

InDialog.decorators = [];

InDialog.parameters = {
  msw: {
    handlers: [
      successHandler,
      passwordEvaluateHandler,
      http.post('/signin', () =>
        HttpResponse.json({ success: true, redirect: '/home' }),
      ),
    ],
  },
};
