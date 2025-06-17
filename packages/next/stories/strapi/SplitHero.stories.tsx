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
        title="Fini les fastidieux copier-coller !"
        image={{
          url: '/thumbnail_Main_Image_A3_0cc920c64c.jpg',
          alternativeText: 'Guy writing something on a calendar',
        }}
        text={`###
* Préparez votre programmation *en équipe*
* Connectez votre agenda avec d'autres *outils métiers* (SIT, SIGB, billetteries …) grâce à notre API
* *Affichez votre agenda* sur votre site web grâce à notre Iframe ou les extensions que nous avons développés pour les principaux CMS
* *Diffusez en un clic* votre programmation auprès des agendas de territoire ou d'autres réseaux
* *Exportez votre agenda* vers tous vos autres supports de communication : réseaux sociaux, affichage papier, etc.`}
      />
    </Container>
  );
}

export function MobileWidth() {
  return (
    <div
      style={{
        maxWidth: '375px',
        border: '2px dashed #ccc',
        padding: '16px',
        width: '375px',
        overflow: 'hidden',
      }}
    >
      <p
        style={{
          fontSize: '12px',
          color: '#666',
          marginBottom: '16px',
          textAlign: 'center',
        }}
      >
        📱 Mobile viewport simulation (375px width) - Title → Image → Text
      </p>
      <div
        style={{
          width: '100%',
          maxWidth: '343px',
          overflow: 'hidden',
          wordWrap: 'break-word',
        }}
      >
        <SplitHero
          title="Fini les fastidieux copier-coller !"
          image={{
            url: '/thumbnail_Main_Image_A3_0cc920c64c.jpg',
            alternativeText: 'Guy writing something on a calendar',
          }}
          text={`###
* Préparez votre programmation *en équipe*
* Connectez votre agenda avec d'autres *outils métiers* (SIT, SIGB, billetteries …) grâce à notre API
* *Affichez votre agenda* sur votre site web grâce à notre Iframe ou les extensions que nous avons développés pour les principaux CMS
* *Diffusez en un clic* votre programmation auprès des agendas de territoire ou d'autres réseaux
* *Exportez votre agenda* vers tous vos autres supports de communication : réseaux sociaux, affichage papier, etc.`}
        />
      </div>
    </div>
  );
}

export function TabletWidth() {
  return (
    <div
      style={{ maxWidth: '768px', border: '2px dashed #ccc', padding: '16px' }}
    >
      <p
        style={{
          fontSize: '12px',
          color: '#666',
          marginBottom: '16px',
          textAlign: 'center',
        }}
      >
        📱 Tablet viewport simulation (768px width)
      </p>
      <SplitHero
        title="Fini les fastidieux copier-coller !"
        image={{
          url: '/thumbnail_Main_Image_A3_0cc920c64c.jpg',
          alternativeText: 'Guy writing something on a calendar',
        }}
        text={`###
* Préparez votre programmation *en équipe*
* Connectez votre agenda avec d'autres *outils métiers* (SIT, SIGB, billetteries …) grâce à notre API
* *Affichez votre agenda* sur votre site web grâce à notre Iframe ou les extensions que nous avons développés pour les principaux CMS
* *Diffusez en un clic* votre programmation auprès des agendas de territoire ou d'autres réseaux
* *Exportez votre agenda* vers tous vos autres supports de communication : réseaux sociaux, affichage papier, etc.`}
      />
    </div>
  );
}
