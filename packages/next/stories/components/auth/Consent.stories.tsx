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
    />
  );
}

Default.parameters = {
  msw: { handlers: [namedClient] },
};

export function MinimalScopes() {
  return <Consent clientId="demo-client" scope="openid email" />;
}

MinimalScopes.parameters = {
  msw: { handlers: [namedClient] },
};

export function AllScopes() {
  return (
    <Consent
      clientId="demo-client"
      scope="openid profile email offline_access events:read events:write events:transverse agendas:read agendas:write locations:read locations:write members:read members:write"
    />
  );
}

AllScopes.parameters = {
  msw: { handlers: [namedClient] },
};

// Public-client lookup fails → falls back to the generic application label.
export function UnknownApp() {
  return <Consent clientId="demo-client" scope="openid profile" />;
}

UnknownApp.parameters = {
  msw: { handlers: [unknownClient] },
};
