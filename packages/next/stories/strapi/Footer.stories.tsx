import { Container } from '@openagenda/uikit';
import Footer from 'components/strapi/Footer';
import ProvidersDecorator from '../decorators/ProvidersDecorator';

export default {
  title: 'strapi/Footer',
  decorators: [ProvidersDecorator],
};

export function Overview() {
  return (
    <Container maxWidth="7xl">
      <Footer
        contactUrl="/decouvrir/contactez-nous"
        Columns={[
          {
            id: '1',
            title: 'Produit',
            Links: [
              {
                id: '1-1',
                label: 'Fonctionnalités',
                url: '/features',
                isExternal: false,
              },
              {
                id: '1-2',
                label: 'Tarifs',
                url: '/pricing',
                isExternal: false,
              },
              {
                id: '1-3',
                label: 'Documentation',
                url: 'https://docs.openagenda.com',
                isExternal: true,
              },
            ],
          },
          {
            id: '2',
            title: 'Entreprise',
            Links: [
              {
                id: '2-1',
                label: 'À propos',
                url: '/about',
                isExternal: false,
              },
              {
                id: '2-2',
                label: 'Carrières',
                url: '/careers',
                isExternal: false,
              },
              {
                id: '2-3',
                label: 'Blog',
                url: 'https://blog.openagenda.com',
                isExternal: true,
              },
            ],
          },
          {
            id: '3',
            title: 'Support',
            Links: [
              {
                id: '3-1',
                label: "Centre d'aide",
                url: '/help',
                isExternal: false,
              },
              {
                id: '3-2',
                label: 'Contact',
                url: '/contact',
                isExternal: false,
              },
              {
                id: '3-3',
                label: 'Statut',
                url: 'https://status.openagenda.com',
                isExternal: true,
              },
            ],
          },
          {
            id: '4',
            title: 'Légal',
            Links: [
              {
                id: '4-1',
                label: "Conditions d'utilisation",
                url: '/terms',
                isExternal: false,
              },
              {
                id: '4-2',
                label: 'Politique de confidentialité',
                url: '/privacy',
                isExternal: false,
              },
            ],
          },
        ]}
      />
    </Container>
  );
}

export function SingleColumn() {
  return (
    <Container maxWidth="7xl">
      <Footer
        contactUrl="/decouvrir/contactez-nous"
        Columns={[
          {
            id: '1',
            title: 'Menu principal',
            Links: [
              {
                id: '1-1',
                label: 'Accueil',
                url: '/',
                isExternal: false,
              },
              {
                id: '1-2',
                label: 'À propos',
                url: '/about',
                isExternal: false,
              },
              {
                id: '1-3',
                label: 'Contact',
                url: '/contact',
                isExternal: false,
              },
              {
                id: '1-4',
                label: 'Site externe',
                url: 'https://example.com',
                isExternal: true,
              },
            ],
          },
        ]}
      />
    </Container>
  );
}

export function ExternalLinksOnly() {
  return (
    <Container maxWidth="7xl">
      <Footer
        contactUrl="/decouvrir/contactez-nous"
        Columns={[
          {
            id: '1',
            title: 'Partenaires',
            Links: [
              {
                id: '1-1',
                label: 'Google',
                url: 'https://google.com',
                isExternal: true,
              },
              {
                id: '1-2',
                label: 'GitHub',
                url: 'https://github.com',
                isExternal: true,
              },
            ],
          },
          {
            id: '2',
            title: 'Outils',
            Links: [
              {
                id: '2-1',
                label: 'Stack Overflow',
                url: 'https://stackoverflow.com',
                isExternal: true,
              },
              {
                id: '2-2',
                label: 'MDN Web Docs',
                url: 'https://developer.mozilla.org',
                isExternal: true,
              },
            ],
          },
        ]}
      />
    </Container>
  );
}

export function EmptyState() {
  return (
    <Container maxWidth="7xl">
      <Footer contactUrl="/decouvrir/contactez-nous" Columns={[]} />
    </Container>
  );
}

export function WithBackgroundColor() {
  return (
    <Footer
      contactUrl="/decouvrir/contactez-nous"
      backgroundColor={{ name: 'rosyRed' }}
      Columns={[
        {
          id: '1',
          title: 'Produit',
          Links: [
            {
              id: '1-1',
              label: 'Fonctionnalités',
              url: '/features',
              isExternal: false,
            },
            {
              id: '1-2',
              label: 'Tarifs',
              url: '/pricing',
              isExternal: false,
            },
            {
              id: '1-3',
              label: 'Documentation',
              url: 'https://docs.openagenda.com',
              isExternal: true,
            },
          ],
        },
        {
          id: '2',
          title: 'Entreprise',
          Links: [
            {
              id: '2-1',
              label: 'À propos',
              url: '/about',
              isExternal: false,
            },
            {
              id: '2-2',
              label: 'Carrières',
              url: '/careers',
              isExternal: false,
            },
            {
              id: '2-3',
              label: 'Blog',
              url: 'https://blog.openagenda.com',
              isExternal: true,
            },
          ],
        },
        {
          id: '3',
          title: 'Support',
          Links: [
            {
              id: '3-1',
              label: "Centre d'aide",
              url: '/help',
              isExternal: false,
            },
            {
              id: '3-2',
              label: 'Contact',
              url: '/contact',
              isExternal: false,
            },
            {
              id: '3-3',
              label: 'Statut',
              url: 'https://status.openagenda.com',
              isExternal: true,
            },
          ],
        },
        {
          id: '4',
          title: 'Légal',
          Links: [
            {
              id: '4-1',
              label: "Conditions d'utilisation",
              url: '/terms',
              isExternal: false,
            },
            {
              id: '4-2',
              label: 'Politique de confidentialité',
              url: '/privacy',
              isExternal: false,
            },
          ],
        },
      ]}
    />
  );
}
