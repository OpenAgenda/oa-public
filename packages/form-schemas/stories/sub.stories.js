import FormSchemaComponent from '../client/src/index.js';
import SimpleRowDecorator from './decorators/SimpleRow.js';

import '@openagenda/bs-templates/compiled/main.css';

if (import.meta.webpackHot) {
  import.meta.webpackHot.accept();
}

export default {
  title: 'Fields/Sub',
  decorators: [SimpleRowDecorator],
};

export function SubWithMarkdown() {
  const props = {
    res: {
      post: '',
      redirect: '/',
    },
    lang: 'fr',
    schema: {
      fields: [
        {
          field: 'plainSub',
          fieldType: 'text',
          optional: true,
          label: {
            fr: 'Texte simple',
          },
          sub: {
            fr: 'Un texte sub sans markdown',
          },
        },
        {
          field: 'markdownSub',
          fieldType: 'text',
          optional: true,
          label: {
            fr: 'Avec lien markdown',
          },
          sub: {
            fr: 'Consultez [notre guide](https://example.com) pour plus de détails',
          },
        },
        {
          field: 'boldSub',
          fieldType: 'text',
          optional: true,
          label: {
            fr: 'Avec texte en gras',
          },
          sub: {
            fr: 'Ce champ est **obligatoire** pour la publication',
          },
        },
        {
          field: 'imageSub',
          fieldType: 'image',
          optional: true,
          label: {
            fr: 'Image',
          },
          info: {
            fr: "Chargez une image d'au moins 300 pixels de large",
          },
          sub: {
            fr: '**Droit des images**\n\nEn insérant un visuel dans OpenAgenda, vous certifiez détenir les droits nécessaires à la publication de celui-ci sous le régime de la licence ouverte. [En savoir plus](https://doc.openagenda.com/fr/article/guide-dutilisation-des-images-sur-openagenda-1t8zlc4/)',
          },
          allowURL: true,
          extensions: ['jpg', 'png', 'jpeg', 'webp'],
        },
      ],
    },
  };

  return (
    <div className="container wsq top-margined col-lg-offset-4 col-lg-4 col-md-offset-3 col-md-6 col-sm-offset-2 col-sm-8">
      <div className="row margin-v-md margin-h-sm">
        <p>Sub field with markdown rendering</p>
        <FormSchemaComponent {...props} />
      </div>
    </div>
  );
}
