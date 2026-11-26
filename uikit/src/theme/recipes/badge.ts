import { defineRecipe } from '@chakra-ui/react';

// Chakra compose sa variante `subtle` avec `colorPalette.fg` sur
// `colorPalette.subtle`. Sur les palettes OA, ces deux pas ne vont pas
// ensemble : `fg` est un pas MÉDIAN de la rampe (warning.600, primary.500) et
// `subtle` le pas 100, déjà saturé. Mesuré sur le rendu, le résultat va de
// 4,15:1 (danger) à 1,39:1 (warning, illisible) — en dessous du 4,5:1 que le
// RGAA demande pour du texte normal.
//
// On ne corrige pas ça dans les tokens sémantiques : `fg` sert aussi de couleur
// de texte aux boutons fantômes et aux liens, l'assombrir déplacerait des
// choses très loin de la pastille. La variante est donc redéfinie ici, sur la
// recette qui la rend — c'est l'endroit que prescrit DESIGN-SYSTEM.md.
//
// Les DEUX BOUTS de la rampe, et rien du milieu : le pas 50 pour le fond, le
// pas 900 pour le texte. Mesures : primary 15,1 · danger 11,8 · oaGray 11,0 ·
// warning 7,3 · green (Chakra) 8,5. Le mode sombre est le miroir exact, donc
// les mêmes rapports.
//
// ⚠️ La même erreur vit encore dans la recette `tag` de Chakra ; personne ne
// l'exerce en `subtle` aujourd'hui, et la corriger demande d'ajouter un
// slotRecipe entier. À faire le jour où un Tag en aura besoin.
export const badgeRecipe = defineRecipe({
  variants: {
    variant: {
      subtle: {
        bg: 'colorPalette.50',
        color: 'colorPalette.900',
        _dark: {
          bg: 'colorPalette.900',
          color: 'colorPalette.50',
        },
      },
    },
  },
});
