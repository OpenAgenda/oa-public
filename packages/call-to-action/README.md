# Call to action

Ce repo est composé de 2 parties:

  - une app react permettant de faire une demande d'activation de fonction
  - une méthode qui peut être appelée de n'importe où pour ouvrir le modal de requête
  
  
### App
  
L'app react s'ajoute automatiquement à la fin du body, elle contient le modal permettant de faire une requête à l'adresse commercial@openagenda.com (par défaut).
Elle ne doit être appelée qu'une seule fois dans le layout.


### openRequestForm

C'est la méthode à appeler pour ouvrir un formulaire de demande, elle peut s'utiliser de plusieurs manières:

  - Sur des élements contenants la classe `.js_call_to_action`, avec au moins l'attribut `data-subject`, et optionnellement l'attribut `data-agenda`. `data-subject` prend un code de label du repo labels du fichier call-to-action/index'. Ne pas mettre de prefixe `requestTitle` ou `requestDescription` au code, il sera ajouté par le service et le tout sera camel-casifié.
  - Sur un *onClick*, d'une des deux manières suivantes:
    - `onclick={openRequestForm}` avec les attributs `data-subject` et `data-agenda` sur l'élément, ils seront récupérés grâce à l'`Event.target` du *onClick*
    - `onclick={() => openRequestForm( { subject, agenda } )}`