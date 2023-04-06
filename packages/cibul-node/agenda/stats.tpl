<div class="row">
  <h3>Quelques stats</h3>
  <pre><code><%- JSON.stringify( { db, legacySearch, agendaEvents, search, hasFormSchema }, null, 2 ) %></code></pre>
</div>

<div class="row">
  <h3 class="margin-bottom-sm">Soucis d'affichages page agenda ou exports</h3>
  <div class="margin-v-lg">
    <p>Il y un problème d'affichage sur un widget malgré une donnée valide sur la liste ( carte, calendrier, tags ... )</p>
    <a class="btn btn-default" href="<%= actions.resyncControlData %>">Recharger les données pour widgets</a>
  </div>
</div>

<div class="row">
  <h3>La saisie est faite sur le nouveau formulaire</h3>
  <h4 class="margin-v-lg">Transfer de configuration</h4>
  <div class="margin-v-lg">
    <p>Un groupe de tags ou un tag n'apparait pas sur les exports ou les widget malgré les resyncro. Le groupe ou tag n'apparait pas non plus sur l'ancien onglet de personnalisation du backoffice de l'agenda</p>
    <a class="btn btn-danger" href="<%= actions.formSchemaToTagSet %>">Mettre à jour le jeu de tags</a>
  </div>
  <div class="margin-v-lg">
    <p>Une ou plusieurs catégories n'apparaissent pas sur les exports ou les widget malgré les resyncro. Les categories n'apparaissent pas non plus sur l'ancien onglet de personnalisation du backoffice de l'agenda</p>
    <a class="btn btn-danger" href="<%= actions.formSchemaToCategorySet %>">Mettre à jour le jeu de catégories</a>
  </div>
  <div class="margin-v-lg">
    <p>Idem mais pour les champs custom</p>
    <a class="btn btn-danger" href="<%= actions.formSchemaToCustom %>">Mettre à jour les anciennes valeurs custom</a>
  </div>
  <h4 class="margin-v-lg">Transfer de données</h4>
  <div class="margin-v-lg">
    <p>Les saisies semblent bien présentes dans les bon champs dans le formulaire mais ne s'affichent pas sur la page d'un événement.</p>
    <a class="btn btn-danger" href="<%= actions.resyncCustomDatasetToLegacy %>">Transférer le jeu de données pour tous les événements</a>
  </div>
</div>

<div class="row">
  <h3>Autres</h3>
  <a class="margin-v-sm btn btn-default" href="<%= actions.rebuildSearch %>">rebuildSearch</a>
  <a class="margin-v-sm btn btn-default" href="<%= actions.resyncInbox %>">resyncInbox</a>
  <a class="margin-v-sm btn btn-default" href="<%= actions.resyncActivityFeeds %>">resyncActivityFeeds</a>
</div>
