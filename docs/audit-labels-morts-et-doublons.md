# Audit des labels de traduction — labels morts et doublons

_Généré le 11 juin 2026. Analyse multi-agents (58 agents, ~1 800 recherches dans le code) :
un agent de scan par package/namespace, puis vérification adversariale de chaque candidat
« mort » sur tout le monorepo (usages dynamiques, cross-package, historique git), et
évaluation des 398 groupes de doublons inter-packages._

## Périmètre et méthode

Deux patterns audités :

1. **Dossiers `locales/`** (react-intl) : 2 238 ids dans 26 packages (`packages/*` et `public/*`),
   définis via `defineMessages`/ids inline, catalogues JSON par langue.
2. **`packages/labels`** (`@openagenda/labels`, legacy) : 2 369 clés dans 103 fichiers CJS,
   consommées via `makeLabelGetter`/`getLabel('clé')`, imports directs ou `all.js`.

Plus `public/common-labels` (54 messages `common.*`).

Un label n'est compté « mort confirmé » que si le scan ET le vérificateur adversarial
concluent à l'absence d'usage — le vérificateur cherche explicitement les accès dynamiques
(`messages[x]`, ids construits, itérations), les usages cross-package et, pour
`packages/labels`, les consommateurs de `all.js` et l'historique git. En cas de doute,
le label est classé « incertain », pas « mort ».

## Chiffres clés

|                         |  Examinés | Morts confirmés | Incertains | Candidats réfutés par la vérification |
| ----------------------- | --------: | --------------: | ---------: | ------------------------------------: |
| `locales/` (react-intl) |     2 238 |         **122** |          3 |                                    31 |
| `packages/labels`       |     2 369 |         **605** |        408 |                                    28 |
| `common-labels`         |        54 |           **2** |          0 |                                     0 |
| **Total**               | **4 661** |         **729** |        411 |                                    59 |

Doublons : **398 groupes inter-packages** (même texte anglais dans ≥ 2 packages) →
**49 cas déjà couverts par un `common.*` existant**, **129 candidats à un déplacement
vers common-labels**, 220 à laisser (coïncidences, doublons legacy-only, artefacts
d'agrégation de catalogues). S'y ajoutent 454 groupes de doublons intra-package
(dont 251 dans `packages/labels` et 67 dans `next`).

Hygiène des catalogues : excellente — seulement 2 clés orphelines (présentes dans une
langue mais absentes de `en.json`), toutes deux dans les mails cibul-node
(`inactiveNewUser`, `inboxMessage`).

---

## 1. Labels morts

### 1.1 Pattern `locales/` — 122 ids confirmés morts

Par package (détail complet en annexe A) :

| Package                         | Morts | Faits notables                                                                                                                                                                                                                                                                                                                                                                         |
| ------------------------------- | ----: | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- | ---------------------------------------------------------------------------------------------------------------------------- |
| `packages/next` (app)           |    25 | Le catalogue `events/[eventSlug]/_components/locales/` est **entièrement périmé** (5 ids `next.views.AgendaShow.AdditionalFields.*` sans définition — remplacés par `next.views.EventShow.AdditionalFields.*`) ; l'export `shareModal` (16 ids `EventShow.ShareModal.*`) n'est plus importé (le partage embed passe par `window.oaIFrame.callParent`)                                  |
| `packages/agenda-locations-app` |    21 | Dont les 6 `AgendaLocations.IT.adminLevel*`                                                                                                                                                                                                                                                                                                                                            |
| `packages/aggregator-sources`   |    21 | Surtout `DefineRules.*` (13) et `Dashboard.*`                                                                                                                                                                                                                                                                                                                                          |
| `packages/event-admin-apps`     |    16 | Le catalogue `messages/status                                                                                                                                                                                                                                                                                                                                                          | relative | attendanceModes`(12 ids) n'a **plus aucun importeur** — et duplique`common.event.statuses._`/`attendanceModes._` (cf. § 2.1) |
| `packages/cibul-node` (mails)   |     9 | Clés de templates `eventUpdate`/`myEventUpdate` (`tocontrol`, `controlled`, `published`, `refused`) jamais référencées par les EJS ; **`callToAction/locales/*.json` sont tous des objets vides `{}`** (catalogue à supprimer)                                                                                                                                                         |
| `public/pdf-exports`            |     7 | 7/13 ids morts (`location`, `online`, `tags`, `access`, `additionalLinks`, `status`, `conditions`)                                                                                                                                                                                                                                                                                     |
| `packages/legacy` (embeds)      |     6 | Tout `LegacyEmbed.Presentation.*` sauf le reste du catalogue                                                                                                                                                                                                                                                                                                                           |
| `public/react-filters`          |     4 | Dont `messages.valid.undefined`                                                                                                                                                                                                                                                                                                                                                        |
| `packages/agenda-settings`      |     4 | Les 4 dans `PassSettings`                                                                                                                                                                                                                                                                                                                                                              |
| `packages/agenda-stats`         |     3 |                                                                                                                                                                                                                                                                                                                                                                                        |
| `public/react-timingspicker`    |     3 | `multiRecurrencerForm.day/repeatThe/occurrences`                                                                                                                                                                                                                                                                                                                                       |
| `public/common-labels`          |     2 | Cas subtil : `ReactFilters.messages.attendanceMode.offline/mixed` définis dans `common-labels/messages/event/attendanceModes.js` sont **shadowés** — les seuls importeurs (les 2 `EventItem.tsx` de next) n'utilisent que `online`, et au runtime ces ids sont servis par le catalogue propre de react-filters, que `external.ts` merge après (donc par-dessus) celui de common-labels |
| `packages/next` (components)    |     1 | `next.components.Strapi.contact`                                                                                                                                                                                                                                                                                                                                                       |

Packages sains (0 mort) : `activity-apps`, `agenda-contribute`, `public/react`,
`public/react-shared`, `abilities`, `cibul-templates`, `member-apps`,
`agenda-schemas-app`, `mails`, `mails-editor`.

Incertains (3) — usages dynamiques plausibles mais non prouvés statiquement :

- `aggregator-sources.AggregatorRulesModal.next` (accès `messages[buttonLabel]`) ;
- `ActivityApps.notifications.agendaChangeEventState` (le verbe `agenda.changeEventState`
  est émis en prod par cibul-node) ;
- `AgendaStats.form.remove` (`intl.formatMessage(form[metric])`).

### 1.2 `packages/labels` — 605 clés confirmées mortes (+ 370 incertaines « corpo »)

#### 38 fichiers entièrement morts — 412 clés, suppression de fichiers complets

Aucun importeur dans le monorepo (vérifié : imports `@openagenda/labels/...`, chemins
relatifs, `all.js`, templates EJS/pug, bundles cibul-templates — `event/show.ejs` et
`event/embedShow.ejs` sont d'ailleurs commentés dans `cibul-templates/map.js`) :

| Domaine           | Fichiers (clés)                                                                                                                                                                                                                                                                                          |
| ----------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| activities        | `notifications` (34), `user` (31), `agenda` (30), `admin` (28), `event` (14), `eventFields` (6), `summaryEmail` (4) — **147 clés, le namespace entier**                                                                                                                                                  |
| auth              | `signup` (27), `activation` (13), `errors` (11), `signin` (9), `manual` (4), `lostPassword` (2) — 66 clés (supplantées par les écrans better-auth/next)                                                                                                                                                  |
| event             | `references` (17), `tagsForm` (12), `duplicate` (11), `translation` (9), `contributors` (4), `addEvent` (3), `shareErrorDetails` (1), `timings` (1)                                                                                                                                                      |
| agenda-tags       | `editor` (33), `selector` (6) — namespace entier                                                                                                                                                                                                                                                         |
| agenda-categories | `editor` (13), `selector` (4) — namespace entier                                                                                                                                                                                                                                                         |
| aggregators       | `sources` (16, supplanté par les messages react-intl de `packages/aggregator-sources`), `mail` (6) — namespace entier                                                                                                                                                                                    |
| autres            | `home/notifications` (17), `members/invitation` (12), `agendas/invitations` (7), `agendas/total` (6), `agenda-admin/facebook` (6), `agenda-admin-events/filters` (6), `contributors/credentials` (4), `surveys/index` (2), `agenda-admin/search` (1), `errors/unauthorized` (1), `components/mailer` (1) |

#### 26 fichiers partiellement morts — 193 clés (détail en annexe B)

Les plus touchés : `inboxes/index` (25/145), `agenda-contribute/event` (**24/25**),
`agenda-settings/agendaEdition` (21/114), `event/show` (20/114), `form-schemas/builder`
(18/160), `users/settings` (17/81), `auth/messages` (7/9), `contributors/exportHeaders`
(6/9), `widgets/relative` (6/11).

#### Incertains — 408 clés, décision à prendre côté humain

- **`corpo/*` : 370 clés, soit le namespace entier.** Zéro usage dans le monorepo
  (ids, segments, dynamique, `all.js`, historique). Mais `@openagenda/labels` est publié
  sur npm et ses dumps `.crowdin/locales/` peuvent servir le site corporate / front PHP
  legacy hors monorepo — invérifiable ici. **À trancher en confirmant côté site corpo** ;
  si mort, c'est le plus gros gisement de l'audit.
- `agendas/calendar` (12) + une partie d'`agendas/show` (21) : l'ex-consommateur
  `packages/agenda-calendar-apps` a été retiré du monorepo en 2021, mais la page
  `/calendar` est toujours liée par `cibul-templates/agenda/head.part.ejs:64` rendue pour
  le front PHP legacy — consommation externe possible.
- `components/syncButton` (5) : aucun consommateur passé ou présent dans le repo,
  usage externe legacy possible.

#### Réfutés notables (faux positifs évités par la 2ᵉ passe)

- Les 31 candidats d'`abilities`/`cibul-templates` (ids `ReactShared.ImageInput.*`,
  `common.event.fields.*` agrégés dans le catalogue cibul-templates) : vivants via
  `react-shared` et `common-labels` — l'agrégation de catalogues n'est pas de la duplication.
- 23 clés `agendas/*` et 4 `form-schemas/*` retrouvées vivantes via usages dynamiques
  ou consommateurs indirects (`date-range`, widgets cibul-templates, etc.).
- `labels/agenda-locations` : `countries.js` (245 clés) et `exportHeaders.js` consommés
  dynamiquement — **aucune clé déclarable morte** dans ce namespace.

---

## 2. Doublons et common-labels

### 2.1 Déjà couvert par `common-labels` — 49 cas : consommer l'existant au lieu de redéfinir

Concentré sur deux familles, avec deux consommateurs à migrer en priorité :

- **`public/react-filters`** redéfinit dans son propre catalogue les statuts
  (`cancelled`, `rescheduled`, `postponed`, `movedOnline`, `full`, `scheduled` + leurs
  `*Info`), états (`published`, `refused`, `readyToPublish`, `toModerate`), champs
  (`title`, `image`, `location`, `description`, `keywords`…), `common.geo.*`
  (`city`, `region`, `department`, `adminLevel3`), `common.roles.*` (les 4) et les
  `accessibilities` (les 5) — alors que `common.event.*`, `common.geo.*`, `common.roles.*`
  existent déjà. Précédent dans le code : les `attendanceModes` sont déjà partagés.
- **`packages/event-admin-apps`** : son catalogue `messages/status|relative|attendanceModes`
  est déjà sans importeur (cf. § 1.1) et recouvre `common.event.statuses.*` — suppression
  pure et simple.

À noter : `common.errors.required` existe mais « Required » est redéfini dans 4 packages.

### 2.2 À déplacer vers common-labels — 129 groupes

Par ordre d'impact (texte × occurrences × nombre de packages) :

**Actions UI génériques** — le gros du gisement, proposable en `common.actions.*` :
`cancel` (×36, 9 pkgs), `save` (×18, 7), `close` (×18, 9), `remove` (×15, 8), `search`
(×15, 8), `edit` (×14, 5), `update` (×12, 5), `delete` (×11, 6), `confirm` (×10, 6),
`submit` (×10, 4), `next` (×10, 5), `copy`/`copied` (×8/×7), `select`/`selected`/
`not selected`/`unselect`, `add`, `ok`, `send`, `apply`, `download`, `show`, `see`,
`accept`/`decline`, `export`, `import`, `confirm deletion`, `select all`, `none`…

**Termes transverses métier** :

- `sign in` (×16, 4 pkgs), `sign up`, `create an account`, `reset my password` ;
- `add an event` (×12, 4), `create an agenda` (×8, 4), `search an agenda` (×11, 4),
  `my agendas`/`my events` (×5, 4), `official agenda` (×9, 4), `private agenda` (×7, 3),
  `featured` (×10, 4), `go to openagenda` ;
- erreurs : `there was a problem during the processing of the operation, retry shortly`
  (×10, 4 — message d'erreur générique idéal en `common.errors.*`) ;
- modération : `to control`, `motive`, `motive of refusal`, `request edition rights`,
  `this event comes from another agenda…` (×4, 3) ;
- filtres temporels : `current`/`upcoming`/`passed` (mêmes ids `relative.*` dans
  event-admin-apps et react-filters), `day`/`week`/`month`, `this week`/`this month`,
  `chronological order` ;
- géo : `district` (×6, 4).

**Famille « export »** (event-admin-apps + `public/react` `AgendaExportModal`) :
`export every field`, `export in all languages`, `select the fields to export`,
`fields with options: display one value per column`, `add geographical sections`,
`highlight the location`, `segments`, `category field (optional)`, `sort by`,
`updated at` → proposable en `common.exports.*`.

### 2.3 Doublons à ne PAS traiter via common-labels

- **Catalogues agrégés** : `cibul-templates/locales` agrège les catalogues react-shared
  et common-labels (mêmes ids) ; `mails-editor` embarque le catalogue de `mails` pour la
  prévisualisation. Source unique déjà en place, rien à migrer.
- **Composant copié** : le `ConsentBanner` de `packages/next` est une copie de celui de
  `public/react-shared` (3 messages identiques). La bonne dédup est de réutiliser le
  composant react-shared, pas de passer par common-labels.
- **Doublons legacy-only** : ~150 groupes dont la seule « contrepartie » moderne est
  unique (l'autre occurrence étant dans `packages/labels`, qui ne migrera pas vers
  react-intl) — sans objet tant qu'un 2ᵉ package moderne n'apparaît pas.

### 2.4 Doublons intra-package

454 groupes (même texte répété sous plusieurs ids dans un même package) : 251 dans
`packages/labels` (attendu pour du legacy), **67 dans `packages/next`** — à garder en
tête lors des prochains passages sur next, sans en faire un chantier dédié.
Nettoyages annexes relevés : `next/strapi/messages.tsx` définit `defaultUser` jamais
accédé via l'objet (l'id vit via un descripteur inline dans `LoggedUserWelcome.tsx`) ;
`event-admin-apps` définit `Dashboard.previous/next` à la fois dans
`containers/Dashboard.js` (inutilisés) et `components/Pager.js` (utilisés).

---

## 3. Limites et précautions

- **Consommateurs externes** : `@openagenda/labels` est publié sur npm et ses dumps
  crowdin peuvent alimenter le front PHP legacy / site corpo hors monorepo. Tous les cas
  suspects ont été classés « incertains » (corpo, agendas/calendar, syncButton) plutôt
  que morts. Confirmer côté infra avant suppression.
- **Usages dynamiques** : les fichiers consommés dynamiquement (`countries.js`,
  `custom/types.js`, scopes OAuth de `Consent.tsx`, `messages[code]` des erreurs/mots de
  passe) ont été exclus de la détection — un label réellement mort dans ces familles ne
  serait pas détecté statiquement.
- **Crowdin** : la suppression de clés dans `packages/labels` doit passer par la
  régénération des dumps (`node .crowdin/aggregate.js`) pour rester synchrone avec crowdin.

## 4. Actions recommandées (par ordre de rendement/risque)

1. **Quick wins sans risque** (~480 entrées) : supprimer les 38 fichiers morts de
   `packages/labels` (412 clés), le dossier `events/[eventSlug]/_components/locales/` de
   next, le catalogue `messages/` mort d'event-admin-apps (12 ids), les locales vides
   `callToAction` de cibul-node, les 7 ids morts de pdf-exports.
2. **Trancher « corpo »** auprès du site corporate : potentiellement −370 clés d'un coup.
3. **Nettoyer les 122 ids locales/ morts** package par package (annexe A) — chaque
   suppression retire ~11 lignes de traduction (une par langue).
4. **Migrer react-filters vers `common.*`** (statuts, états, champs, geo, rôles,
   accessibilités) — le précédent `attendanceModes` montre la voie.
5. **Enrichir common-labels** : `common.actions.*` (cancel/save/close/…),
   `common.errors.*` (erreur générique de traitement), `common.exports.*`
   (famille export event-admin-apps + public/react), filtres `relative.*`.
6. **Réutiliser le ConsentBanner react-shared** dans next au lieu de la copie locale.

---

## Annexe A — ids `locales/` morts confirmés (122)

_Suppression = retirer la définition (`messages.js`/inline) + l'entrée dans chaque
`<lang>.json` (puis `yarn extract-messages` pour next)._

### packages/next (app router) (25)

- `next.views.AgendaShow.AdditionalFields.noFile` _(sans définition)_
- `next.views.AgendaShow.AdditionalFields.noImage` _(sans définition)_
- `next.views.AgendaShow.AdditionalFields.noInput` _(sans définition)_
- `next.views.AgendaShow.AdditionalFields.noSelection` _(sans définition)_
- `next.views.AgendaShow.AdditionalFields.restrictedInformation` _(sans définition)_
- `next.views.AgendaShow.AgendaHeader.officialAgenda`
- `next.views.AgendaShow.closeButton`
- `next.views.AgendaShow.signin`
- `next.views.EventShow.Timings.calendarNavigation`
- `next.views.EventShow.ShareModal.onOA`
- `next.views.EventShow.ShareModal.shareEvent`
- `next.views.EventShow.ShareModal.shareOnSocialNetworks`
- `next.views.EventShow.ShareModal.shareByEmail`
- `next.views.EventShow.ShareModal.shareByEmailPlaceholder`
- `next.views.EventShow.ShareModal.byEmailSub`
- `next.views.EventShow.ShareModal.send`
- `next.views.EventShow.ShareModal.shareCalendar`
- `next.views.EventShow.ShareModal.selectTiming`
- `next.views.EventShow.ShareModal.import`
- `next.views.EventShow.ShareModal.shareLink`
- `next.views.EventShow.ShareModal.copy`
- `next.views.EventShow.ShareModal.copied`
- `next.views.EventShow.ShareModal.mustSignIn`
- `next.views.EventShow.ShareModal.signIn`
- `next.views.EventShow.ShareModal.online`

### packages/agenda-locations-app (21)

- `AgendaLocations.AgendaAdminLocation.closeModal`
- `AgendaLocations.AgendaAdminLocation.contactSupport`
- `AgendaLocations.AgendaAdminLocation.information`
- `AgendaLocations.AgendaAdminLocation.mergeDescription`
- `AgendaLocations.AgendaAdminLocation.mergeInProgress`
- `AgendaLocations.AgendaAdminLocation.postalCode`
- `AgendaLocations.AgendaAdminLocation.search`
- `AgendaLocations.AgendaAdminLocation.somethingWentWrong`
- `AgendaLocations.LocationForm.saving`
- `AgendaLocations.LocationForm.loadingError`
- `AgendaLocations.LocationForm.geocodeFieldCancel`
- `AgendaLocations.LocationForm.geocodeFieldSave`
- `AgendaLocations.LocationForm.geocodeNoResults`
- `AgendaLocations.LocationItem.refLocationMerge`
- `AgendaLocations.LocationItem.unselect`
- `AgendaLocations.IT.adminLevel1`
- `AgendaLocations.IT.adminLevel2`
- `AgendaLocations.IT.adminLevel3`
- `AgendaLocations.IT.adminLevel4`
- `AgendaLocations.IT.adminLevel5`
- `AgendaLocations.IT.adminLevel6`

### packages/aggregator-sources (21)

- `aggregator-sources.AddSourceModal.enterALink`
- `aggregator-sources.AddSourceModal.makeASearch`
- `aggregator-sources.AddSourceModal.removeConfirmMessage`
- `aggregator-sources.Dashboard.aggregatorExplanation`
- `aggregator-sources.Dashboard.createAggregator`
- `aggregator-sources.Dashboard.sourceAgendas`
- `aggregator-sources.Dashboard.sourcesHelp`
- `aggregator-sources.UpdateSourceModal.cancel`
- `aggregator-sources.DefineRules.addARule`
- `aggregator-sources.DefineRules.newRule`
- `aggregator-sources.DefineRules.noDefinedRules`
- `aggregator-sources.DefineRules.noFilter`
- `aggregator-sources.DefineRules.ruleDescription`
- `aggregator-sources.DefineRules.updateARule`
- `aggregator-sources.DefineRules.allEvents`
- `aggregator-sources.DefineRules.allowOnlineEvent`
- `aggregator-sources.DefineRules.choiceFilter`
- `aggregator-sources.DefineRules.editForDetail`
- `aggregator-sources.DefineRules.locationFilter`
- `aggregator-sources.DefineRules.otherFilter`
- `aggregator-sources.DefineRules.withActions`

### packages/event-admin-apps (16)

- `EventAdminApp.Dashboard.groupedActions`
- `EventAdminApp.Dashboard.state`
- `EventAdminApp.SpreadsheetOptions.input-field`
- `EventAdminApp.EventItem.addedBy`
- `EventAdminApp.messages.status.programmed`
- `EventAdminApp.messages.status.rescheduled`
- `EventAdminApp.messages.status.movedOnline`
- `EventAdminApp.messages.status.postponed`
- `EventAdminApp.messages.status.full`
- `EventAdminApp.messages.status.cancelled`
- `EventAdminApp.messages.relative.current`
- `EventAdminApp.messages.relative.passed`
- `EventAdminApp.messages.relative.upcoming`
- `EventAdminApp.messages.attendanceModes.offline`
- `EventAdminApp.messages.attendanceModes.online`
- `EventAdminApp.messages.attendanceModes.mixed`

### packages/cibul-node (templates mails) (9)

- `eventUpdate/tocontrol`
- `eventUpdate/controlled`
- `eventUpdate/published`
- `eventUpdate/refused`
- `myEventUpdate/tocontrol`
- `myEventUpdate/controlled`
- `myEventUpdate/published`
- `myEventUpdate/refused`
- `inboxMessage/actionDescription`

### public/pdf-exports (7)

- `pdf-exports.location`
- `pdf-exports.online`
- `pdf-exports.tags`
- `pdf-exports.access`
- `pdf-exports.additionalLinks`
- `pdf-exports.status`
- `pdf-exports.conditions`

### packages/legacy (embeds) (6)

- `LegacyEmbed.Presentation.create`
- `LegacyEmbed.Presentation.legacyEmbedTitle`
- `LegacyEmbed.Presentation.legacyEmbedSummary`
- `LegacyEmbed.Presentation.legacyEmbedPresentation`
- `LegacyEmbed.Presentation.legacyEmbedWarning`
- `LegacyEmbed.Presentation.legacyEmbedWarningDetail`

### public/react-filters (4)

- `ReactFilters.DefinedRangeFilter.startDate`
- `ReactFilters.DefinedRangeFilter.endDate`
- `ReactFilters.filters.searchFilter.previewLabel`
- `ReactFilters.messages.valid.undefined`

### packages/agenda-settings (4)

- `AgendaSettings.Components.PassSettings.currentSiren`
- `AgendaSettings.Components.PassSettings.defaultVenue`
- `AgendaSettings.Components.PassSettings.selectDefaultVenue`
- `AgendaSettings.Components.PassSettings.clearSettingsConfirm`

### packages/agenda-stats (3)

- `AgendaStats.LoadMore.nothingMore`
- `AgendaStats.RangeTypeFilter.sameDayRange`
- `AgendaStats.RangeTypeFilter.range`

### public/react-timingspicker (3)

- `rtp.multiRecurrencerForm.day`
- `rtp.multiRecurrencerForm.repeatThe`
- `rtp.multiRecurrencerForm.occurrences`

### public/common-labels (2)

- `ReactFilters.messages.attendanceMode.offline`
- `ReactFilters.messages.attendanceMode.mixed`

### packages/next (components) (1)

- `next.components.Strapi.contact`

## Annexe B — clés mortes des fichiers `packages/labels` partiellement morts (193)

### `inboxes/index.js` — 25/145

`conversation`, `conversations`, `ongoingConversations`, `showAllConversations`, `lastMessagePostedRelativeDate`,
`creationSuccess`, `creationFail`, `aboutEvent`, `conversationInitiatedOn`, `youreAdminOrModerator`,
`youreNotAdminOrModerator`, `youCannotWriteToThisMember`, `contactAdministrator`, `by`, `conversationInitiatedBy`,
`contactConversationInitiated`, `createdBy`, `sendMessageToContributor`, `sendMessageToMember`, `wouldLikeToContribute`,
`requestForContribution`, `required`, `message`, `wantContributeMakeRequest`, `sendMessageToName`

### `agenda-contribute/event.js` — 24/25

`title`, `submit`, `create`, `draft`, `update`, `editEvent`, `updateDraft`, `deleteDraft`, `undraft`, `addEvent`,
`shareEvent`, `takeEvent`, `fromAgenda`, `toAgenda`, `confirmAdd`, `noEditionRights`, `onlyAdditionalFieldsCanBeEdited`,
`requestEditionRights`, `onlyAdditionalFieldsCanBeEditedInfo`, `requestEditionRightsInfo`, `shareRestrictionInfo`,
`suggestChange`, `cancelShare`, `close`

### `agenda-settings/agendaEdition.js` — 21/114

`contribution`, `contribType`, `contribTypeChoosen`, `contribTypeAll`, `agendaProfile`, `contribUseFields`,
`removeAgenda`, `removeAgendaWarning`, `agendaRemoved`, `advanced`, `requestOfficialDescription`, `makeARequest`,
`limitDates`, `requestLimitDates`, `customMessage`, `requestCustomMessage`, `personalization`, `editEventsDescription`,
`matomoUrl`, `eventStatusKnowMore`, `askForActivation`

### `event/show.js` — 20/114

`addToAgenda`, `export`, `shareOnOA`, `ticketingLink`, `startToFinish`, `onAt`, `about`, `descriptionAvailableIn`,
`dateDetails`, `createdBy`, `eventState`, `changeFeaturedState`, `fromTo`, `category`, `locationChangeRequest`,
`couldYouBringFollowingChanges`, `activity`, `inbox`, `contactForm`, `accessibilityImpairments`

### `form-schemas/builder.js` — 18/160

`draggableField`, `editFieldLabels`, `editFieldSave`, `editFieldCancel`, `addLanguages`, `fieldLabelLanguages`,
`orderCancel`, `orderEdit`, `orderInstruction`, `orderSave`, `orderTitle`, `confirmFieldType`, `backToFieldType`,
`optionDrag`, `optionOrder`, `optionOrderEndAction`, `isSulgDuplicateError`, `isReservedError`

### `users/settings.js` — 17/81

`changeEmailFail`, `close`, `areYouSure`, `deleteModalButton`, `validationEmailSubject`, `validationEmailContent`,
`validationEmailAction`, `generateNewApiKey`, `generateNewApiKeyModalText`, `generateNewApiKeyModalButton`, `generate`,
`agendaEventUpdate`, `agendaEventPublished`, `agendaNewAggregator`, `notificationsSummary`, `emailUnsubscription`,
`allNotifications`

### `auth/messages.js` — 7/9

`authRequired`, `limitedAccessEvent`, `limitedAccessAgenda`, `abortedAuth`, `facebookEmailMissing`, `genericError`,
`accountEmailAlreadyExists`

### `contributors/exportHeaders.js` — 6/9

`name`, `email`, `organization`, `phone`, `position`, `credential`

### `widgets/relative.js` — 6/11

`yesterday`, `relativeToNowPast`, `relativeToNowUpcoming`, `days`, `months`, `years`

### `event/remove.js` — 5/7

`eventRemoveTitle`, `eventRemoveDetails`, `eventDeleteTitle`, `eventDeleteDetails`, `confirm`

### `form-schemas/fileUpload.js` — 5/9

`error`, `tip`, `replace`, `loading`, `or`

### `form-schemas/imageUpload.js` — 5/10

`error`, `tip`, `replace`, `loading`, `or`

### `event/registration.js` — 4/6

`info`, `placeholder`, `error`, `invalid`

### `agendas/actions.js` — 4/5

`ownershipTransfered`, `spreadsheetTitle`, `allLanguages`, `spreadsheetDescription`

### `agendas/show.js` — 4/42

`noResultForSearchWithLink`, `reloadPage`, `agendaHasNotUpcomingEvents`, `export`

### `agenda-contribute/member.js` — 4/10

`title`, `subtitle`, `description`, `submit`

### `agenda-settings/agendaCreation.js` — 3/29

`contribType`, `contribTypeChoosen`, `contribTypeAll`

### `home/index.js` — 3/36

`messages`, `notifications`, `support`

### `unsubscription/index.js` — 3/5

`tokenNotFound`, `tokenAlreadyUsed`, `tokenMalformed`

### `agendas/errors.js` — 2/3

`eventAlreadyAdded`, `selectActionBefore`

### `agenda-contribute/authorization.js` — 2/5

`noAccessToDraft`, `eventNotLinkedToAgenda`

### `agendas/range.js` — 1/27

`prefix`

### `agendas/head.js` — 1/7

`export`

### `agenda-admin/gettingStarted.js` — 1/17

`addProfileImage`

### `errors/index.js` — 1/29

`unlinkFacebookErrorTitle`

### `newsletter/subscribe.js` — 1/3

`unsubscribed`

## Annexe C — fichiers de données intermédiaires

Les données brutes de l'audit sont dans `/tmp` (régénérables) :
`oa-label-inventory.json` (inventaire complet), `oa-label-duplicates.json`
(398 groupes inter-packages), `oa-label-intra-dups.json`, `oa-dead-confirmed.json`,
`oa-dead-uncertain.json`, `oa-dead-refuted.json`, `oa-dup-move.json`,
`oa-dup-useexisting.json`, `oa-audit-result.json` (sortie complète du workflow,
avec preuves détaillées par label).
