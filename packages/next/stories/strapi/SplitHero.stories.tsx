import { Container } from '@openagenda/uikit';
import SplitHero from 'components/strapi/SplitHero';
import ProvidersDecorator from '../decorators/ProvidersDecorator';

export default {
  title: 'strapi/SplitHero',
  decorators: [ProvidersDecorator],
};

export function Overview() {
  return (
    <Container maxWidth="5xl">
      <SplitHero
        title="SplitHero title"
        image={{
          url: '/thumbnail_Main_Image_A3_0cc920c64c.jpg',
          alternativeText: 'Guy writing something on a calendar',
        }}
        text={`### **Fini les fastidieux copier-coller !**

* Préparez votre programmation *en équipe*
* Connectez votre agenda avec d’autres *outils métiers* (SIT, SIGB, billetteries …) grâce à notre API
* *Affichez votre agenda* sur votre site web grâce à notre Iframe ou les extensions que nous avons développés pour les principaux CMS
* *Diffusez en un clic* votre programmation auprès des agendas de territoire ou d’autres réseaux
* *Exportez votre agenda* vers tous vos autres supports de communication : réseaux sociaux, affichage papier, etc.`}
      />
    </Container>
  );
}
