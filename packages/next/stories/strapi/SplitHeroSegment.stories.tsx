import SplitHeroSegment from 'components/strapi/SplitHeroSegment';
import ProvidersDecorator from '../decorators/ProvidersDecorator';

export default {
  title: 'strapi/SplitHeroSegment',
  component: SplitHeroSegment,
  decorators: [ProvidersDecorator],
};

export function Overview() {
  return (
    <SplitHeroSegment
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
      CTAs={[
        {
          label: "J'aime les bateaux",
          link: 'https://bateau.fr',
          variant: 'solid',
          colorPalette: {
            name: 'strapi.blueGreen',
          },
        },
        {
          label: "J'aime les avions",
          link: 'https://avions.fr',
          variant: 'outline',
          colorPalette: {
            name: 'strapi.mutedPlum',
          },
        },
      ]}
    />
  );
}

export function WithBackground() {
  return (
    <SplitHeroSegment
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
      background={{
        name: 'frenchBlue',
      }}
      fontColor={{
        name: 'oaWhite',
      }}
      CTAs={[
        {
          label: "J'aime les bateaux",
          link: 'https://bateau.fr',
          variant: 'solid',
          colorPalette: {
            name: 'strapi.rosyRed',
          },
        },
        {
          label: "J'aime les avions",
          link: 'https://avions.fr',
          variant: 'outline',
          colorPalette: {
            name: 'strapi.rosyRed',
          },
        },
      ]}
    />
  );
}

export function WithGradientBackground() {
  return (
    <SplitHeroSegment
      title="Fini les fastidieux copier-coller !"
      image={{
        url: '/thumbnail_Main_Image_A3_0cc920c64c.jpg',
        alternativeText: 'Guy writing something on a calendar',
      }}
      imagePosition="right"
      text={`###
* Préparez votre programmation *en équipe*
* Connectez votre agenda avec d'autres *outils métiers* (SIT, SIGB, billetteries …) grâce à notre API
* *Affichez votre agenda* sur votre site web grâce à notre Iframe ou les extensions que nous avons développés pour les principaux CMS
* *Diffusez en un clic* votre programmation auprès des agendas de territoire ou d'autres réseaux
* *Exportez votre agenda* vers tous vos autres supports de communication : réseaux sociaux, affichage papier, etc.`}
      background={{
        name: 'myFirstGradient',
        css: 'linear-gradient(to right bottom, frenchBlue, 80%, moonStone)',
      }}
      fontColor={{
        name: 'azure',
      }}
      CTAs={[
        {
          label: "J'aime les bateaux",
          link: 'https://bateau.fr',
          variant: 'solid',
          colorPalette: {
            name: 'strapi.rosyRed',
          },
        },
        {
          label: "J'aime les avions",
          link: 'https://avions.fr',
          variant: 'outline',
          colorPalette: {
            name: 'strapi.rosyRed',
          },
        },
      ]}
    />
  );
}

export function ImageLeftAsBackground() {
  return (
    <SplitHeroSegment
      background={{
        name: 'spotAliceBlue',
      }}
      title="Pour les organisateurs d'événements"
      image={{
        url: '/contributrice.jpg',
        alternativeText: 'Contributrice',
      }}
      coverImage={true}
      text={`**Artistes, lieux culturels, associations, etc.**

Fini les fastidieux copier-coller !

* Saisissez vos événements en ligne une seule fois

* Alimentez tous vos supports de communication

* Partagez en un clic votre programmation avec des collectivités, administrations et médias
`}
      CTAs={[
        {
          label: 'Créer un agenda',
          link: 'https://bateau.fr',
          variant: 'solid',
        },
        {
          label: "Découvrir l'offre",
          link: 'https://avions.fr',
          variant: 'outline',
        },
      ]}
    />
  );
}

export function ImageRightAsBackground() {
  return (
    <SplitHeroSegment
      background={{
        name: 'spotAliceBlue',
      }}
      title="Pour les organisateurs d'événements"
      image={{
        url: '/contributrice.jpg',
        alternativeText: 'Contributrice',
      }}
      imagePosition="right"
      coverImage={true}
      text={`**Artistes, lieux culturels, associations, etc.**

Fini les fastidieux copier-coller !

* Saisissez vos événements en ligne une seule fois

* Alimentez tous vos supports de communication

* Partagez en un clic votre programmation avec des collectivités, administrations et médias
`}
      CTAs={[
        {
          label: 'Créer un agenda',
          link: 'https://bateau.fr',
          variant: 'solid',
        },
        {
          label: "Découvrir l'offre",
          link: 'https://avions.fr',
          variant: 'outline',
        },
      ]}
    />
  );
}
