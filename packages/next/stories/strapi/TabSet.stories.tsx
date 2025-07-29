import TabSet from 'components/strapi/TabSet';
import ProvidersDecorator from '../decorators/ProvidersDecorator';
import tabSetFixture from './fixtures/TabSet.json';

export default {
  title: 'strapi/TabSet',
  component: TabSet,
  decorators: [ProvidersDecorator],
};

export function Overview() {
  return (
    <TabSet
      title="Des solutions adaptées à vos besoins"
      description="Découvrez nos différentes offres conçues pour répondre à vos besoins spécifiques"
      Tabs={[
        {
          id: 2,
          title: "Organisateurs d'événements",
          content: {
            id: 2,
            title:
              'Vous organisez des évènements et vous souhaitez simplifier votre circuit de communication ?',
            text: "### **Fini les fastidieux copier-coller !**\n\n* Préparez votre programmation *en équipe*\n* Connectez votre agenda avec d'autres *outils métiers* (SIT, SIGB, billetteries …) grâce à notre API\n* *Affichez votre agenda* sur votre site web grâce à notre Iframe ou les extensions que nous avons développés pour les principaux CMS\n* *Diffusez en un clic* votre programmation auprès des agendas de territoire ou d'autres réseaux\n* *Exportez votre agenda* vers tous vos autres supports de communication : réseaux sociaux, affichage papier, etc.",
            imagePosition: 'left',
            image: {
              url: '/phteven.jpg',
            },
          },
        },
      ]}
      CTAs={[
        {
          label: "J'aime les pieuvres",
          link: 'https://pieuvres.fr',
          variant: 'solid',
          colorPalette: {
            name: 'strapi.blueGreen',
          },
        },
        {
          label: "J'aime les agendas",
          link: 'https://agendas.fr',
          variant: 'outline',
          colorPalette: {
            name: 'strapi.mutedPlum',
          },
        },
      ]}
    />
  );
}

export function WithFixtureData() {
  return (
    <TabSet
      title={tabSetFixture.title}
      description={tabSetFixture.description}
      Tabs={tabSetFixture.Tabs.map((tab) => ({
        id: tab.id,
        title: tab.title,
        content: {
          id: tab.content.id,
          title: tab.content.title,
          text: tab.content.text,
          imagePosition: tab.content.imagePosition,
          image: {
            url: tab.content.image.url,
            alternativeText: tab.content.image.alternativeText,
          },
        },
      }))}
    />
  );
}

export function WithSubtleBackground() {
  return (
    <TabSet
      title={tabSetFixture.title}
      backgroundColor={{ name: 'rosyRed' }}
      colorVariant="subtle"
      description={tabSetFixture.description}
      Tabs={tabSetFixture.Tabs.map((tab) => ({
        id: tab.id,
        title: tab.title,
        content: {
          id: tab.content.id,
          title: tab.content.title,
          text: tab.content.text,
          imagePosition: tab.content.imagePosition,
          image: {
            url: '/phteven.jpg',
            alternativeText: tab.content.image.alternativeText,
          },
        },
      }))}
    />
  );
}
