# @openagenda/utils

Utilitaires partagés d'OpenAgenda. **ESM uniquement**, sources TypeScript.

## Points d'entrée

```js
import { Stopwatch, cleanString, isInteger } from '@openagenda/utils';
import { nativeImageUrl, imageAtSize } from '@openagenda/utils/images';
```

La racine réexporte tout ; `./images` regroupe la composition d'images.

## Images

Composent les URL Thumbor servies par img.openagenda.com. Voir
le dépôt privé `oa` (`docs/design-thumbor-on-demand-images.md`) pour le dessin
d’ensemble.

| Export                                      | Rôle                                                                    |
| ------------------------------------------- | ----------------------------------------------------------------------- |
| `responsiveImage(descriptor, options)`      | l'objet `Image` v3 complet : `src`, `srcTemplate`, `srcset`, dimensions |
| `responsiveImageFromSource` / `…FromServed` | même chose depuis une source nue ou une valeur telle que servie par v2  |
| `imageRefFromSource` / `…FromServed`        | l'`ImageRef` allégé `{ src, srcTemplate }`                              |
| `nativeImageUrl(value, geo, options)`       | une URL unique à une géométrie, pour les rendus serveur (mails, SSR)    |
| `imageAtSize(ref, geo)`                     | ré-alias une référence déjà normalisée vers une autre géométrie         |
| `injectResponsiveImage(options, event)`     | remplace les formes v2 d'un événement par des images prêtes à l'emploi  |
| `imageServingOptions(s3)`                   | met la configuration `s3` à la forme attendue par les composeurs        |

## Divers

- `Stopwatch()` — instrumentation grossière de durées
- `cleanString(str)` — retire les codets de contrôle d'un texte saisi
- `isInteger(num)` — vrai pour un entier, y compris sous forme de chaîne

## Développement

```sh
yarn test      # jest
yarn prepack   # tsdown → dist/
```
