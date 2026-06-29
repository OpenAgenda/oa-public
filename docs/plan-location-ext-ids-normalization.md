# Plan — Normaliser le stockage des `extIds` de location

> Objectif : remplacer l'encodage in-band `{"identifiers":["key->value"]}` de la
> colonne `location.ext_ids` (JSON) par une **modélisation structurée** de la
> paire `(key, value)`. Le délimiteur `->` non échappé crée trois classes de
> bugs (collision, troncature, coercion `'null'`) et le stockage ne garantit pas
> l'unicité (résolution non déterministe). La route v3 `GET …/locations/ext/
{extKey}/{extId}` (PR #197) fait de l'ext id une **clé de lookup publique** —
> ce qui justifie d'arrêter de la traiter comme un blob et de lui donner une
> vraie modélisation + un vrai index + une contrainte d'unicité.
>
> **Analyse + plan, pas d'implémentation.** À sortir en PR dédiée (migration de
> schéma + refonte des écritures + décision produit d'unicité), hors de #197.

---

## Le constat (vérifié dans le code, juin 2026)

Format de stockage actuel : colonne `location.ext_ids` `json`, forme
`{"identifiers":["import->loc-42", …]}`. Le **contrat API** exposé est déjà
`extIds: [{ key, value }]` — le `key->value` n'est qu'un détail de stockage
interne, donc **changer le stockage est invisible pour les clients**.

Points de contact du format, **tous confinés à `packages/agenda-locations`** :

| Rôle     | Fichier                                              | Détail                                                                                                                        |
| -------- | ---------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| Écriture | `lib/formatExtIds.js` (`convertApiToDb`)             | `acc.identifiers.push(\`${key}->${value}\`)`                                                                                  |
| Écriture | `update.js:89`                                       | même `push(\`${key}->${value}\`)` (2ᵉ site)                                                                                   |
| Lecture  | `lib/formatExtIds.js` (`convertDbToApi`)             | `const [key, value] = id.split('->')`                                                                                         |
| Requête  | `lib/addGetQuery.js:22`                              | `whereRaw("? MEMBER OF (ext_ids->'$.identifiers')", \`${key}->${value}\`)`                                                    |
| Requête  | `lib/addListQuery.js:173`                            | idem (filtre liste)                                                                                                           |
| Schéma   | `migrations/20260422120001_create_location_table.js` | colonne `ext_ids json` + index multi-valué `ext_ids_idx` sur `CAST(JSON_EXTRACT(ext_ids,'$.identifiers') AS CHAR(255) ARRAY)` |

- **MySQL 8.0.17+** (l'usage de `MEMBER OF` + index multi-valué le prouve).
- **Aucun consommateur brut** de `ext_ids` hors de ces fichiers : l'export flat
  (`services/agendaLocations/lib/transformLocationForFlatExport.js`) lit la forme
  API déjà convertie (`location.extIds.map(e => e.value)`).
- Les **events n'utilisent pas** cet encodage (leur lookup by-ext passe par ES) —
  rien à factoriser cross-resource, juste à documenter la divergence.
- La table `location` a été (re)créée en **avril 2026** : la dette `->` est jeune,
  c'est le bon moment pour la solder avant qu'elle ne grossisse.

## Le diagnostic (la racine, pas le symptôme)

Le bug n'est pas « il faut échapper `->` ». C'est qu'on **encode une paire
structurée dans une string à délimiteur in-band**. Toute solution qui garde une
string — échapper `->`, percent-encoder, séparateur de contrôle `\u001F`,
préfixe de longueur — est une demi-mesure : elle impose un encode/decode
symétrique partout à jamais, et ne corrige **ni** la coercion `'null'`→`null`
**ni** le non-déterminisme. Rejeter `->` en entrée est pire : ça casse des
source-ids légitimes.

Les quatre défauts à éliminer :

1. **Collision** — `(key='a', value='b->c')` et `(key='a->b', value='c')`
   sérialisent tous deux en `a->b->c` → le lookup résout la mauvaise location.
2. **Troncature** — `split('->')` garde 2 segments : une `value` contenant `->`
   est tronquée en lecture (ne round-trip pas le contrat API que #197 teste).
3. **Coercion `'null'`** — `convertDbToApi` fait `value === 'null' ? null : value`
   → un source-id littéral `"null"` est indistinguable d'un `value` absent.
4. **Non-déterminisme** — rien n'interdit deux locations avec la même paire ; le
   get fait `first: true` sans `ORDER BY` → résultat arbitraire (et le filtre de
   liste se comporte de façon surprenante sur collision cross-agenda).

## La cible : table normalisée

Sortir les ext ids dans une table dédiée — la modélisation relationnelle
correcte d'une relation 1-N à attributs structurés.

```sql
CREATE TABLE location_ext_id (
  id          BIGINT AUTO_INCREMENT PRIMARY KEY,
  location_id BIGINT NOT NULL,
  `key`       VARCHAR(190) NOT NULL,
  `value`     VARCHAR(190) NULL,           -- NULL réel : fin de la coercion 'null'
  CONSTRAINT fk_loc FOREIGN KEY (location_id)
    REFERENCES location(id) ON DELETE CASCADE,
  UNIQUE KEY uq_location_key (location_id, `key`),  -- une valeur par (location, key)
  KEY lookup_key_value (`key`, `value`)             -- le lookup by-ext, indexé exact
);
```

Ce que ça élimine **par construction, pas par convention** :

- collision `->` : `key` et `value` sont deux colonnes, plus aucune concaténation ;
- troncature : plus de `split('->')` ;
- coercion `'null'` : `value` est `NULL` ou la string `'null'`, distinctes ;
- non-déterminisme : une **contrainte `UNIQUE`** rend l'ambiguïté _impossible à
  insérer_ au lieu de la « gérer » en lecture ;
- le lookup `WHERE key=? AND value=?` est exact et indexé (fini le `MEMBER OF`
  sur un `CAST … CHAR(255)` qui tronque aussi à 255 caractères).

Le contrat `extIds: [{key, value}]` se reconstitue à la lecture via
`JSON_ARRAYAGG(JSON_OBJECT('key',`key`,'value',`value`))` (ou agrégation
applicative dans `transformAndDecorateItems`).

## La décision à acter (produit, bloquante)

**Quel est le périmètre d'unicité d'un ext id ?** C'est _la_ question que le
format string a laissée implicite (et la cause du non-déterminisme). Pour du
sync « je tiens mon source-id », l'unicité naturelle est probablement par
**agenda / location-set** :

```sql
UNIQUE KEY uq_scope_key_value (agenda_id /* ou set_uid */, `key`, `value`)
```

→ un même `(source, id)` ne désigne qu'une location dans un périmètre donné.
À trancher explicitement avant l'implémentation (impacte le DDL et le backfill,
qui révélera les doublons existants à arbitrer).

## Déploiement — expand / contract (pas de double format qui traîne)

1. **Expand** : créer `location_ext_id` + backfill depuis `ext_ids` JSON. Le
   backfill est le moment où on solde la dette : **détecter et loguer** les
   lignes dont la `value` contient `->` ou vaut `'null'`, et les doublons que la
   future contrainte d'unicité rejetterait → décider la règle de reprise au lieu
   de la deviner.
2. **Bascule** : double-écriture (table + colonne JSON) le temps d'une release ;
   lectures (`get`/`list`) basculées sur la table ; vérif preprod.
3. **Contract** : drop de la colonne `ext_ids` + de l'index multi-valué, et des
   4 points de contact `->`.

## Tests (matérialisent les invariants)

- `(key='a', value='b->c')` vs `(key='a->b', value='c')` → deux paires distinctes.
- `value` contenant `->` → round-trip API exact.
- `value = null` vs `value = 'null'` → distincts.
- insert d'un doublon dans le périmètre d'unicité → **rejeté par la contrainte**.
- (régression #197) by-ext : 200 + extIds, égalité by-uid, 404 inconnu, 404 merged,
  isolation par agenda — déjà couverts, à reporter sur le nouveau backend.

## Alternative écartée (et pourquoi)

Rester en colonne JSON mais passer à `[{key,value}]` + requête
`JSON_CONTAINS(ext_ids, JSON_OBJECT('key',?,'value',?))`. Tue collision +
troncature + null, mais : un **index multi-valué n'indexe pas des objets**
(seulement un tableau de scalaires `CAST … AS … ARRAY`), donc le lookup par
_paire_ n'est plus indexable proprement, et **l'unicité reste non garantie par
la base**. Deux des quatre défauts restent ouverts → demi-mesure.

## Hors scope / séquençage

- **Pas dans #197** : cette PR est le révélateur, pas le véhicule (granularité PR
  = unité de déploiement/rollback). Migration de schéma + refonte écritures +
  décision d'unicité → PR/ticket dédié.
- Référence : PR #197 `feat/v3-location-get-by-ext-id` (route by-ext locations).
