import { http, HttpResponse } from 'msw';
import { Box } from '@openagenda/uikit';
import Consent from 'components/auth/Consent';
import fetchLocale from 'app/locales';
import ProvidersDecorator from '../../decorators/ProvidersDecorator';

function WhiteSquareDecorator(Story) {
  return (
    <Box bg="white" p="6" borderRadius="md" maxW="md" mx="auto" mt="10">
      <Story />
    </Box>
  );
}

const namedClient = http.get('/api/auth/oauth2/public-client', () =>
  HttpResponse.json({ name: 'My Calendar App' }),
);

const unknownClient = http.get('/api/auth/oauth2/public-client', () =>
  HttpResponse.json(null, { status: 404 }),
);

// A client self-asserting an official-sounding name: the unverified banner and
// the real redirect host are what let the user catch the impersonation.
const spoofClient = http.get('/api/auth/oauth2/public-client', () =>
  HttpResponse.json({ name: 'OpenAgenda Official' }),
);

export default {
  title: 'components/auth/Consent',
  component: Consent,
  loaders: [
    async () => ({
      intlMessages: await fetchLocale('fr'),
    }),
  ],
  decorators: [WhiteSquareDecorator, ProvidersDecorator],
};

export function Default() {
  return (
    <Consent
      clientId="demo-client"
      scope="openid profile email events:read events:write agendas:read"
      redirectUri="https://my-calendar-app.example.com/oauth/callback"
    />
  );
}

Default.parameters = {
  msw: { handlers: [namedClient] },
};

// A native MCP client (e.g. Claude Code) delivers the code to a loopback
// address — the host reads as localhost, which is reassuring rather than alarming.
export function LoopbackRedirect() {
  return (
    <Consent
      clientId="demo-client"
      scope="openid profile events:read"
      redirectUri="http://127.0.0.1:53682/callback"
    />
  );
}

LoopbackRedirect.parameters = {
  msw: { handlers: [namedClient] },
};

// Impersonation attempt: official-sounding name, but the redirect host is a
// stranger's domain — the signal the user is meant to catch.
export function ImpersonationAttempt() {
  return (
    <Consent
      clientId="demo-client"
      scope="openid profile email events:read"
      redirectUri="https://totally-not-phishing.example.net/grab"
    />
  );
}

ImpersonationAttempt.parameters = {
  msw: { handlers: [spoofClient] },
};

export function MinimalScopes() {
  return (
    <Consent
      clientId="demo-client"
      scope="openid email"
      redirectUri="https://my-calendar-app.example.com/oauth/callback"
    />
  );
}

MinimalScopes.parameters = {
  msw: { handlers: [namedClient] },
};

export function AllScopes() {
  return (
    <Consent
      clientId="demo-client"
      scope="openid profile email offline_access events:read events:write events:transverse agendas:read agendas:write locations:read locations:write members:read members:write"
      redirectUri="https://my-calendar-app.example.com/oauth/callback"
    />
  );
}

AllScopes.parameters = {
  msw: { handlers: [namedClient] },
};

// Public-client lookup fails → falls back to the generic application label.
export function UnknownApp() {
  return (
    <Consent
      clientId="demo-client"
      scope="openid profile"
      redirectUri="https://my-calendar-app.example.com/oauth/callback"
    />
  );
}

UnknownApp.parameters = {
  msw: { handlers: [unknownClient] },
};
