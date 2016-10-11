# Overview

Le widget d'aperçu permet d'afficher les prochains événements de votre agenda OpenAgenda sur n'importe quelle page web. Pour ajouter le widget, effectuez les étapes suivantes:

1. Récuperez l'identifiant unique de votre agenda ( uid ) sur le bas de la barre latérale de la page agenda ( notation <uid:UIDAGENDA> )
2. Editez le code suivant en remplacant UIDAGENDA par l'identifiant unique de votre agenda:

    ```<div class="oa-preview cbpgpr" data-oapr data-cbctl="UIDAGENDA|fr">
        <a href="https://openagenda.com/agendas/UIDAGENDA">Voir l'agenda</a>
     </div><script src="//openagenda.com/js/embed/oaPreviewWidget.js"></script>```
3. Placez le code sur n'importe quelle page html

# Personnalisation

Voici quelques opérations simple à effectuer qui vous permettrons de personnaliser votre widget:

 * **Désactiver le style par défaut**: si vous voulez utiliser de manière exclusive votre propre feuille de style, vous pouvez désactiver le style par défaut du widget en retirant la class `oa-preview` du code du widget. Ne retirez **jamais** la classe `cbpgpr` nécessaire au fonctionnement du widget.
 * **Changement de langue**: Modifiez la deuxième section de l'attribut `data-cbctl` pour changer la langue. Les valeurs possibles sont 'fr' ou 'en'
 * **Nombre d'événements**: Définissez le nombre d'événements à afficher sur le widget en ajoutant l'attribut `data-count` au <div> de votre widget ( ex: data-count="2" )
 * **Lier le widget à votre agenda integré**: Si vous avez un agenda intégré sur votre site et voulez que les liens du widget pointent dessus, placez l'url de la page hébergant l'agenda dans l'attribut `href` de l'élément <a> présent dans le corps du widget.

## Personnalisation avancée: filtrer les événements

Vous pouvez connecter l'export json de votre agenda à votre widget, ce qui vous permettra ensuite de définir vos propres filtres et d'afficher la sélection de votre choix dans le widget. Voici les 3 étapes à suivre:

 * Sur votre page agenda OpenAgenda, filtrez la liste d'événements pour définir la sélection de votre choix à l'aide des contrôles de la page.
 * Cliquez sur 'Exporter', puis sur le bouton JSON de la section 'Exportez votre dernière recherche'. Copiez le lien qui s'ouvre alors dans votre navigateur.
 * Ajoutez un attribut **data-json** sur le <div> de votre widget avec pour valeur le lien que vous venez de copier. Votre widget récuperera alors les événements du flux spécifié.

## Personnalisation avancée: gabarit personnalisé

Vous pouvez définir votre propre gabarit dans le corps du widget, en commentaire sous le lien de l'agenda. Le moteur de gabarit utilisé pour le widget est un clone de celui existant sur **Tumblr**. L'exemple suivant illustre un cas d'utilisation de gabarit:

    <div class="oa-preview cbpgpr" data-oapr data-cbctl="UIDAGENDA|fr">
      <a href="https://openagenda.com/agendas/UIDAGENDA">See the calendar</a>
      <!-- 
        Evénements à venir: {TotalEvents}
        <ul>
          {block:Events}
          <li>
            <a href="{Link}">
              <span class="title">{Title}</span>
              {block:ImageUrl}
              <img src="{ImageUrl}"/>
              {/block:ImageUrl}
              <span class="desc">{Description}</span>
              <span class="range">{DateRange}</span>
              <span class="place">{LocationName}</span>
            </a>
          </li>
          {/block:Events}
        </ul>
      -->
    </div><script src="//openagenda.com/js/embed/oaPreviewWidget.js"></script>

Fonctionnement du gabarit en 3 points:

 * Les valeurs variables ( le titre d'un événement par exemple ) sont affichées avec la syntaxe suivante dans le gabarit: `{ValueName}`
 * Les événements sont décrits dans un sous-gabarit encapsulé par {block:Events} .. {/block:Events}. Le sous-gabarit sera automatiquement répété autant de fois qu'il y aura d'événements à afficher.
 * La notation `block' sert également pour les affichages conditionnels. Placez du HTML dans un bloc `{block:ValueName}` si vous ne voulez pas l'afficher quand `{ValueName}` n'est pas définie ( voir `{block:ImageUrl}` dans l'exemple )

Voici une liste des valeurs utilisables dans le gabarit:

 * **TotalEvents**: Le total des événements de la sélection courante
 * **Events**: La liste des événements à afficher. A utiliser en tant que balise `{bloc:Events}` uniquement.
 * **Title**: Titre d'un événement
 * **Description**: Description courte d'un événement
 * **Link**: Lien vers l'événement ( OA ou page intégrée )
 * **ImageUrl**: Url de l'image de l'événement
 * **ThumbnailUrl**: Url de l'image petit format de l'événement
 * **LocationName**: Lieu de l'événement
 * **City**: Ville de l'événement
 * **PricingInfo**: Conditions d'accès
 * **TicketUrl**: Lien de réservation de l'événement

## Problèmes connus

Le code a été ajouté sur votre page mais rien ne s'affiche.

 * Assurez-vous que le script du widget est bien présent sur votre page: `<script src="//openagenda.com/js/embed/oaPreviewWidget.js"></script>`
 * Assurez-vous que la classe `cbpgpr` est présente sur votre code widget. Il peut également arriver que le CMS utilisé filtre les classes du widget avant son affichage sur votre site. Dans ce cas, ajoutez l'attribut 'data-oapr' au <div> de votre code widget, celui-ci servira d'ancre au script.
