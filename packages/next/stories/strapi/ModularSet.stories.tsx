import ModularSet from 'components/strapi/ModularSet';
import ProvidersDecorator from '../decorators/ProvidersDecorator';

import fx from './fixtures/modular.json';

export default {
  title: 'strapi/Modular',
  decorators: [ProvidersDecorator],
};

export function Widths() {
  return (
    <ModularSet
      title="Bigger to the left"
      Components={[
        {
          id: 1,
          ...fx.default,
          grow: 2,
          description:
            'Au bord d’un lac scintillant, entouré de roseaux et de nénuphars, vivait un flamant rose nommé Félix. Félix était un flamant un peu spécial : il adorait admirer son reflet dans l’eau. Tous les matins, dès l’aube, il s’approchait du lac, ajustait ses plumes soigneusement et se contemplait, fier de son plumage éclatant.',
          card: true,
          maxWidth: { name: 'full' },
        },
        {
          id: 2,
          ...fx.default,
        },
      ]}
    />
  );
}
