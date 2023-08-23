import {
  Heading,
  UIKitProvider,
  HStack,
  Menu,
  MenuButton,
  Button,
  MenuItem,
  MenuList,
} from '@openagenda/uikit';
import PricingCard from 'components/PricingCard';

export default {
  title: 'components/Landing',
};

const HeadingComponent = () => (
  <>
    <Heading size="xl" color="black">Le réseau d&apos;agendas</Heading>
    <Menu>
      <MenuButton color="black" as={Button} variant="link">
        Jusque 2000 événements publiés par an <strong>v</strong>
      </MenuButton>
      <MenuList color="black">
        <MenuItem>5000 événements</MenuItem>
        <MenuItem>10000 événements</MenuItem>
        <MenuItem>Encore plus</MenuItem>
      </MenuList>
    </Menu>
  </>
);

export function PricingCardComponent() {
  return (
    <UIKitProvider>
      <HStack m="8" spacing="8" align="start">
        <PricingCard
          visual="agenda"
          name="L'agenda collaboratif"
          cost="Gratuit"
          features={[{
            key: 'collab',
            label: 'Un agenda en ligne collaboratif',
          }, {
            key: 'search',
            label: 'Filtres géographiques, par dates, par thématiques',
          }, {
            key: 'opendata',
            label: 'Des événements publiés en données ouvertes',
          }, {
            key: 'exports',
            label: 'Exports tableur, json, pdf, ics',
          }, {
            key: 'validation',
            label: 'Circuit de validation',
          }, {
            key: 'members',
            label: 'Répertoire de contributeurs',
          }, {
            key: 'locations',
            label: 'Répertoire de lieux',
          }, {
            key: 'integration',
            label: 'Intégrable sous Wordpress, Drupal ou en Iframe',
          }]}
        />
        <PricingCard
          visual="agendaPlus"
          name="L'agenda collaboratif +"
          cost="12 092.99 € HT / an"
          before="Les fonctions de l'agenda collaboratif"
          features={[{
            key: 'event-form',
            label: 'Formulaire événement personnalisable',
          }, {
            key: 'member-form',
            label: 'Formulaire membre personnalisable',
          }, {
            key: 'moderator',
            label: 'Accès modérateur',
          }]}
        />
        <PricingCard
          visual="network"
          HeadingComponent={HeadingComponent}
          cost="3 500 € HT / an"
          before="Les fonctions de l'agenda collaboratif + sur tous les agendas du réseau"
          features={[{
            key: 'location-set',
            label: 'Un répertoire de lieux mutualisé',
          }, {
            key: 'aggregation',
            label: 'Agrégation filtrée d\'événements',
          }]}
        />
      </HStack>
    </UIKitProvider>
  );
}
