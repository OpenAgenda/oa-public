import { Container, Separator } from '@openagenda/uikit';
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
      <Separator m={12} />
      <SplitHero
        title="Fini les fastidieux copier-coller !"
        imagePosition="right"
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
              name: 'strapi.ruddyBlue',
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
          {
            label: 'Pas fan des bagnoles',
            link: 'https://bagnoles.fr',
            variant: 'link',
            colorPalette: {
              name: 'strapi.blueGreen',
            },
          },
        ]}
      />
      <Separator m={12} />
      <SplitHero
        title="Fini les fastidieux copier-coller !"
        image={{
          url: '/guyWritingOnACalendar.50.resized.png',
          alternativeText: 'Guy writing something on a calendar',
        }}
        imageMaxWidth={45}
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

export function ImageLeftWithBulletPointsAndNumbers() {
  return (
    <Container maxWidth="5xl" background="{colors.strapi.frenchBlue.500}">
      <SplitHero
        title="Complete Event Management Solution"
        fontColor={{ name: 'azure' }}
        image={{
          url: '/thumbnail_Main_Image_A3_0cc920c64c.jpg',
          alternativeText: 'Professional event planning workspace',
        }}
        text={`Transform your event management process with our comprehensive platform that combines powerful features with intuitive design.

## Key Features:
* **Real-time collaboration** - Work seamlessly with your team members
* **Advanced scheduling** - Smart calendar integration and conflict detection  
* **Multi-platform publishing** - Distribute events across all your channels
* **Analytics dashboard** - Track engagement and performance metrics
* **Custom branding** - Maintain your organization's visual identity

## Getting Started Process:
1. **Account Setup** - Create your organization profile and invite team members
2. **Event Creation** - Use our intuitive form builder to design your events
3. **Content Management** - Upload images, descriptions, and promotional materials
4. **Distribution Strategy** - Configure your publishing channels and social media
5. **Launch & Monitor** - Go live and track your event's performance in real-time

## Additional Benefits:
* Automated email notifications and reminders
* Mobile-responsive event pages
* Integration with popular ticketing platforms
* 24/7 customer support and training resources`}
      />
    </Container>
  );
}

export function NoImage() {
  return (
    <Container maxWidth="5xl">
      <SplitHero
        title="No Image Example"
        text={`###
This is an example of the SplitHero component when no image is provided.

* The component should display only the text content
* The layout should adjust to fill the available space
* All other functionality (title, text, CTAs) should work normally

This demonstrates how the component handles the absence of an image while maintaining its core functionality.`}
        CTAs={[
          {
            label: 'Primary Action',
            link: 'https://example.com',
            variant: 'solid',
            colorPalette: {
              name: 'strapi.ruddyBlue',
            },
          },
          {
            label: 'Secondary Action',
            link: 'https://example.com',
            variant: 'outline',
            colorPalette: {
              name: 'strapi.mutedPlum',
            },
          },
        ]}
      />
    </Container>
  );
}
