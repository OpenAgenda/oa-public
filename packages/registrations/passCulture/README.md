# Pass Culture

## Généralités

Le package `registration-apps` tient le code de l'app React.
Le package `registations` le code serveur utile à OA pour lancer des opérations Pass. S'y trouve aussi les fonctions de transfo pour passer d'un format OA à un format Pass

De base sur le modèle événement OA, `registrations` affiche une liste de liens, numéros de téléphone ou email. Il est logique que quand on a plus d'informations lié une billetterie, il héberge les données utiles pour lier l'événement à la-dite billetterie.

Sur l'API, la donnée `registrations` est une liste d'objets, chacun comportant une paire de clés: `type` et `value`.

`[{ type: 'phone', value: '06', type: 'email', value: 'email@domain.com' }]`

Les données utiles pour le pass peuvent s'intégrer à cette structure en la complétant avec une troisième clé `data`:

`[{ type: 'link', value: 'http://liendeloffrepass', data: { service: 'passCulture', ... }}]`

Les données rendues par l'API sont plus complètes et ne cassent pas les intégrations existentes: pas de régression avec cette évolution.

En base, la donnée est actuellement stoquée sous forme d'une liste de chaines de caractères. La conversion entre cette liste et la structure `[{ type, value }]` se fait au moment de l'indexation dans le package `event-search`, dans la fonction `formatEvent`. L'évolution du formulaire impose que à minima, le validateur soit capable de traiter puis de garder une donnée dans la liste d'un type autre qu'un texte (tél, mail ou lien) et avec une clé data.

Le formulaire lui doit avoir ce qui lui sera utile pour charger le composant `registrations` avec les données de billetterie. Une nouvelle option au `get` de l'événement peut instruire l'appel pour qu'il rende la variante 'objet' (détaillée) du champ registration.

Lorsque une offre Pass est chargée sur le formulaire, le champ registration enregistre sous l'item `passCulture` les données utiles à la création d'une offre pass dérivant d'un événement OA: dans le package `registrations` une fonction `createEventOffer` prend, en plus du client pass et de l'événement OA, la donnée utile à la création de l'offre pass par API. Elle ressemble à ça (copie du test `createEventOffer.test.mjs`):

```
{
  venueId,
  category: 'CINE_PLEIN_AIR',
  priceCategories: [{
    label: 'Tarif réduit',
    price: 8,
  }, {
    label: 'Plein tarif',
    price: 14
  }],
  dates: [{
    timingId,
    priceCategoryIndex: 0,
    quantity: 3,
  }, {
    timingId,
    priceCategoryIndex: 1,
    quantity: 6,
  }],
}
```

La fonction rend les objets Pass créés: `eventOffer`, `priceCategories`, `dates`. Seule l'identifiant Pass de l'offre est utile à stoquer coté OA. Quand on a besoin du reste (par ex au moment de charger l'édition de l'offre Pass), un get sur l'API peut être fait pour récupérer les données utiles.

## Le champ registration

La partie `dates` des données Pass dérive des `timings` de l'événement, saisis en amont sur le même formulaire. `form-schemas` a une notion de champs liés avec les clés `optionalWith` et `enableWith`. Seulement dans le cas du pass le lien est une relation moins simplement définies. Une clé `relatedTo` peut apparaitre dans `form-schemas` pour couvrir ce cas. La définition de `registration` ressemblera alors à:

```
[{
  field: 'registration',
  fieldType: 'registration',
  relatedTo: 'timings',
  ...
}]
```

## Traitement de la donnée Pass par OA

A la création, les données pass sont passées sous la clé `registration`. La config de l'agenda est chargée et les paramètres pass sont stockés dans le schéma de l'agenda, sous la clé `registration`. Une clé `settings` du champ donne les infos utiles à l'établissement de la passerelle: le code INSEE, etc. Après la validation des données de l'événement et avant sa création, la création de l'offre pass est tentée, un identifiant pass et un lien sont récupérés pour être placés sous la clé `registration`.

Est-ce qu'on a le lien de l'offre à la création? Non, mais à regarder, les liens ressemblent à ça: https://integration.passculture.app/offre/39524 - il suffit de l'id de l'offre, qu'on a.

## Todo

 * Le registration-apps doit lire et placer les données pass dans un item de la liste registration
 * Un validateur d'une donnée pass doit savoir controler la structure de la donnée pass pour qu'elle soit évaluée parmi les items de registration
 
 * Le validateur de registration dans le formulaire event doit garder les données pass et les considérer comme étant valides
 * Le package events doit stocker les données pass sous forme de liste
 * L'API doit pouvoir prendre des données Pass lors de la création d'un événement et lancer la création. Ça simplifiera les tests.
 * form-schemas doit savoir gérer relatedTo en plus de optionalWith et enableWith
 * La lib core doit faire appel a une instance de registrations pour lancer la création de l'offre pass juste avant la création de l'événement
 * Premier test intégré