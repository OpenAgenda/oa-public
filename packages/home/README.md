# Home

Oh la home (pour un type connecté)

# Backend

Two object types will be queried by the front app: agendas and events. The agendas listed on the home are the ones for which the user is a member.

La première implémentation du service backend la home/agendas va requêter directement dans la structure de la base actuelle pour ressortir les agendas mis à jour le plus récemment en premier.

La requête ressemble à ça:

select a.leschampsutilesseulement, rr.credential
from review as a left join reviewer as rr on rr.review_id=a.id
where rr.user_id = ${userId}
order by a.updated_at desc


credential:

 1. Contributeur
 2. Admin
 3. Modérateur


Le service doit être accessible de cette manière:

    const svc = require( 'home' );

    // image = { default, path }
    // schemas = { agendas, member }
    
    svc.init( { mysql, schemas, image } );

    svc( userId ).agendas.list( query, offset, limit, [ options ], ( err, agendas, total ) => {

      // tu auras besoin de faire une première requète pour le total, une deuxième pour le détail offsetlimité

    } );


/*
  image: {
    path: '//cibul.s3.amazonaws.com/',
    default: '//s3.eu-central-1.amazonaws.com/oastatic/graylogo140.png'
  },
*/
