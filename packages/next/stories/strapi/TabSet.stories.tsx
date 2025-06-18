import TabSet from 'components/strapi/TabSet';
import ProvidersDecorator from '../decorators/ProvidersDecorator';

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
          title: 'Organisateurs d’événements',
          content: {
            id: 2,
            title:
              'Vous organisez des évènements et vous souhaitez simplifier votre circuit de communication ?',
            text: '### **Fini les fastidieux copier-coller !**\n\n* Préparez votre programmation *en équipe*\n* Connectez votre agenda avec d’autres *outils métiers* (SIT, SIGB, billetteries …) grâce à notre API\n* *Affichez votre agenda* sur votre site web grâce à notre Iframe ou les extensions que nous avons développés pour les principaux CMS\n* *Diffusez en un clic* votre programmation auprès des agendas de territoire ou d’autres réseaux\n* *Exportez votre agenda* vers tous vos autres supports de communication : réseaux sociaux, affichage papier, etc.',
            direction: 'row',
            image: {
              url: '/phteven.jpg',
            },
          },
        },
      ]}
    />
  );
}
