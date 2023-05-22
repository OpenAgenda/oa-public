'use strict';

exports.seed = async knex => {
  const { schemas } = knex.client.config;

  await knex.raw(`
      CREATE TABLE IF NOT EXISTS \`${schemas.rebuild_agenda}\`
      (
          \`id\`                bigint(20)   NOT NULL AUTO_INCREMENT,
          \`title\`             varchar(255) NOT NULL,
          \`owner_id\`          bigint(20)   NOT NULL,
          \`slug\`              varchar(255) NOT NULL,
          \`description\`       mediumtext,
          \`image\`             varchar(255)          DEFAULT NULL,
          \`url\`               varchar(255)          DEFAULT NULL,
          \`collaborative\`     tinyint(1)   NOT NULL DEFAULT '0',
          \`created_at\`        datetime     NOT NULL,
          \`updated_at\`        datetime     NOT NULL,
          \`uid\`               bigint(20)            DEFAULT NULL,
          \`main\`              tinyint(1)   NOT NULL DEFAULT '0',
          \`store\`             longtext,
          \`contribution_type\` tinyint(4)   NOT NULL DEFAULT '0',
          \`contribution_info\` text,
          \`official\`          tinyint(1)            DEFAULT NULL,
          \`credentials\`       text,
          \`settings\`          text,
          \`private\`           tinyint(1)   NOT NULL DEFAULT '0',
          PRIMARY KEY (\`id\`),
          UNIQUE KEY \`slug\` (\`slug\`),
          UNIQUE KEY \`uid\` (\`uid\`),
          KEY \`owner_id_idx\` (\`owner_id\`)
      ) ENGINE = InnoDB
        AUTO_INCREMENT = 8737
        DEFAULT CHARSET = utf8;
  `);

  // Deletes ALL existing entries
  await knex(schemas.rebuild_agenda).del();

  await knex(schemas.rebuild_agenda).insert([
    {
      'id': '2910',
      'title': 'So Digital',
      'owner_id': '2256',
      'slug': 'seineouestdigital',
      'description': 'L\'actualité des acteurs de l\'innovation sur le territoire de Grand Paris Seine Ouest (et ils sont nombreux !).',
      'image': 'review_seineouestdigital_01.jpg',
      'url': 'http:\/\/seineouestdigital.fr\/',
      'collaborative': '0',
      'created_at': '2014-08-06 16:15:03',
      'updated_at': '2017-03-14 16:27:52',
      'uid': '45684028',
      'main': '0',
      'store': '{"mails":true,"order":"relative","dataviz":"[{\\"sections\\":[\\"month\\"]},{\\"sections\\":[\\"place\\"]}]","moderated":true,"send_invitation_email":true,"contributorconfigstep":-1,"cFields":{"organization":[],"contact_number":[],"contact_name":[],"contact_position":[],"email":[]}}',
      'contribution_type': '1',
      'contribution_info': '',
      'official': '1',
      'credentials': '{"moderators":true,"embedsHead":false,"embedsTemplates":false,"activatingInvitations":false}',
      'settings': '{"contribution":{"type":1,"defaultState":0,"message":null,"useFields":true}}',
      'private': '0',
    },
    {
      'id': '5704',
      'title': 'Calendrier matchs FranceHandball 2017',
      'owner_id': '2',
      'slug': 'matchshand',
      'description': 'Découvrez le calendrier de l\'ensemble des matchs du Championnat du Monde de Handball 2017',
      'image': 'review_matchshand_00.jpg',
      'url': '',
      'collaborative': '0',
      'created_at': '2016-04-19 14:00:04',
      'updated_at': '2017-01-27 22:32:05',
      'uid': '3385537',
      'main': '0',
      'store': '{"order":"relative"}',
      'contribution_type': '0',
      'contribution_info': null,
      'official': null,
      'credentials': null,
      'settings': null,
      'private': '0',
    },
    {
      'id': '7707',
      'title': 'Rendez-vous aux jardins 2017 : Normandie',
      'owner_id': '24453',
      'slug': 'rdvj-2017-normandie',
      'description': 'Les Rendez-vous aux Jardins se dérouleront les 2, 3 et 4 juin 2017. Retrouvez les informations et conditions pour participer à l\'événement sur notre site.',
      'image': 'agenda71517239.jpg',
      'url': 'http:\/\/rendezvousauxjardins.fr\/',
      'collaborative': '0',
      'created_at': '2016-12-15 15:21:16',
      'updated_at': '2017-03-19 15:39:42',
      'uid': '71517239',
      'main': '0',
      'store': '{"mails":false, "publicationMessage":"Bonjour,\\n\\nVotre événement vient d\'être publié par la coordination nationale des Rendez-vous aux jardins 2017.\\n\\nSi vous n\'en avez pas déjà fait la demande, pensez à [commander les supports de communication de l\'opération.](http:\/\/rendezvousauxjardins.culturecommunication.gouv.fr\/Composants\/Demande-de-materiel).\\n\\nMerci de votre participation\\n\\nLe Ministère de la Culture et de la Communication\\n\\n[Nous contacter](http:\/\/rendezvousauxjardins.culturecommunication.gouv.fr\/Nous-contacter)","keys":[{"hash":"856f1b3a6a8e9e4c5b035dc106bd6c99"}],"eventFreeText":{"fr":"[Source: Ministère de la Culture et de la Communication](http:\/\/rendezvousauxjardins.fr)","en":"[Source: Ministère de la Culture et de la Communication](http:\/\/rendezvousauxjardins.fr)"},"form":{"fields":[{"name":"longDescription","placeholder":{"fr":"Description détaillée de l\'événement, crédit photo: nom du photographe ","en":"Detailed desecription of the event, photo credits: name of the photograph"}},{"name":"image","info":{"fr":"Ne sélectionnez que les images pour lesquelles vous disposez d\'une licence valide.","en":"Only upload images for which you have a valid license"}},{"name":"timings","activeDays":[{"startDate":"2017-06-02","endDate":"2017-06-04"}]},{"name":"keywords","display":false},{"name":"conditions","label":{"fr":"Détail des conditions","en":"Condition details"},"placeholder":{"fr":"Tarifs, limitation du nombre de places, nombre minimum de participants pour une visite de groupe, etc.","en":"Pricing, ticket availability, minimum number of participants for a group visit, etc."}}]},"order":"relative","moderated":true,"chatbox":false,"moderators":{"canPublish":true},"send_invitation_email":true,"contributorconfigstep":-1,"cFields":{"organization":[],"contact_number":[],"contact_name":[],"contact_position":[],"email":[]},"customFields":[{"name":"creditsimage","fieldType":"text","type":"public","optional":true,"label":{"fr":"Crédits de l\'image","en":"Image Credits"},"max":500}]}',
      'contribution_type': '1',
      'contribution_info': 'Quelques recommandations pour inscrire votre événement :\n\n*   **Ne regroupez pas toute votre programmation dans une même fiche.** Cela pénalisera vos événements qui ne pourront pas être interrogés par les filtres du moteur de recherche.\n\n*   **N\'écrivez pas le titre de vos événements \/ lieux en majuscules.** Les majuscules peuvent être mal interprétées par les lecteurs d\'écran utilisées par les personnes malvoyantes.\n\n*   **N\'intitulez pas le titre de votre événement avec le nom du lieu ou de la manifestation.**\n\n*   **Ajoutez une image à votre événement.** Les événements disposant d’une illustration sont deux fois plus consultés. **Attention : ces images sont mises à disposition en données ouvertes.** Vous devez obtenir l\'accord du propriétaire de l\'image pour les diffuser.\n\n*   **Saisissez une description courte qui résume votre événement.  \n    La description longue doit être plus détaillée et la plus factuelle possible.** ex : Visite libre => que peut-on observer pendant la visite, combien de temps dure t-elle, est-il proposé des audio-guides, des livrets-découverte, etc. Elle permet aussi d\'intégrer des contenus complémentaires type vidéos, images, liens.\n\n*   **Indiquez dans le champ "Conditions" les conditions de participation à l\'événement** : les offres tarifaires, les limites de places pour des visites de groupes, etc.\n\n*   **Le champ "Outils d\'inscription" ne sert que** **si vous avez coché la case "sur inscription".** Précisez les différents moyens (lien, tél, courriel) pour s\'inscrire à l\'événement.\n\n*   **Si votre lieu n\'existe pas dans notre base de données, vous pouvez créer une nouvelle fiche.** En revanche, vous ne pouvez pas modifier la fiche d\'un lieu déjà créé mais simplement suggérer une modification. Votre demande sera traitée par les modérateurs de l\'agenda.\n\n*   **Dans l\'adresse du lieu, mentionnez le n°, le nom de la voie et le nom de la commune.** Vérifiez sur la carte que le pointeur est situé au bon endroit. Vous pouvez déplacer ce pointeur manuellement.\n\n**Respectez autant que possible les consignes de saisie figurant sur les différents champs du formulaire.**\n\nLes événements proposés sur cet agenda seront validés avant publication par la coordination nationale de l\'opération.\n\nPour toute question, vous pouvez nous adresser un message via [notre formulaire de contact](http:\/\/rendezvousauxjardins.culturecommunication.gouv.fr\/Nous-contacter).\n\nPour commander des affiches à l\'unité ou des colis pré-composés de la manifestation, veuillez remplir [le formulaire de demande de matériel](http:\/\/rendezvousauxjardins.culturecommunication.gouv.fr\/Composants\/Demande-de-materiel).\n\nBonne contribution,\n\nMerci !\n\nLe Ministère de la Culture et de la Communication',
      'official': '1',
      'credentials': '{"moderators":true,"embedsHead":false,"embedsTemplates":false,"activatingInvitations":false,"aggregator":false}',
      'settings': '{"contribution":{"type":1,"defaultState":0,"message":"Quelques recommandations pour inscrire votre événement :\\n\\n*   **Ne regroupez pas toute votre programmation dans une même fiche.** Cela pénalisera vos événements qui ne pourront pas être interrogés par les filtres du moteur de recherche.\\n\\n*   **N\'écrivez pas le titre de vos événements \/ lieux en majuscules.** Les majuscules peuvent être mal interprétées par les lecteurs d\'écran utilisées par les personnes malvoyantes.\\n\\n*   **N\'intitulez pas le titre de votre événement avec le nom du lieu ou de la manifestation.**\\n\\n*   **Ajoutez une image à votre événement.** Les événements disposant d’une illustration sont deux fois plus consultés. **Attention : ces images sont mises à disposition en données ouvertes.** Vous devez obtenir l\'accord du propriétaire de l\'image pour les diffuser.\\n\\n*   **Saisissez une description courte qui résume votre événement.  \\n    La description longue doit être plus détaillée et la plus factuelle possible.** ex : Visite libre => que peut-on observer pendant la visite, combien de temps dure t-elle, est-il proposé des audio-guides, des livrets-découverte, etc. Elle permet aussi d\'intégrer des contenus complémentaires type vidéos, images, liens.\\n\\n*   **Indiquez dans le champ \\"Conditions\\" les conditions de participation à l\'événement** : les offres tarifaires, les limites de places pour des visites de groupes, etc.\\n\\n*   **Le champ \\"Outils d\'inscription\\" ne sert que** **si vous avez coché la case \\"sur inscription\\".** Précisez les différents moyens (lien, tél, courriel) pour s\'inscrire à l\'événement.\\n\\n*   **Si votre lieu n\'existe pas dans notre base de données, vous pouvez créer une nouvelle fiche.** En revanche, vous ne pouvez pas modifier la fiche d\'un lieu déjà créé mais simplement suggérer une modification. Votre demande sera traitée par les modérateurs de l\'agenda.\\n\\n*   **Dans l\'adresse du lieu, mentionnez le n°, le nom de la voie et le nom de la commune.** Vérifiez sur la carte que le pointeur est situé au bon endroit. Vous pouvez déplacer ce pointeur manuellement.\\n\\n**Respectez autant que possible les consignes de saisie figurant sur les différents champs du formulaire.**\\n\\nLes événements proposés sur cet agenda seront validés avant publication par la coordination nationale de l\'opération.\\n\\nPour toute question, vous pouvez nous adresser un message via [notre formulaire de contact](http:\/\/rendezvousauxjardins.culturecommunication.gouv.fr\/Nous-contacter).\\n\\nPour commander des affiches à l\'unité ou des colis pré-composés de la manifestation, veuillez remplir [le formulaire de demande de matériel](http:\/\/rendezvousauxjardins.culturecommunication.gouv.fr\/Composants\/Demande-de-materiel).\\n\\nBonne contribution,\\n\\nMerci !\\n\\nLe Ministère de la Culture et de la Communication","useFields":true},"translation":{"enabled":true,"source":"fr","sets":[{"source":"fr","target":["it","es","de","en"],"checked":["it","es","de","en"]}],"service":"reverso","options":"eyJ1c2VyIjoiQ1VMVFVSRSIsInBhc3N3b3JkIjoiclU3elQ3cWhhIn0="}}',
      'private': '0',
    },
  ]);
};
