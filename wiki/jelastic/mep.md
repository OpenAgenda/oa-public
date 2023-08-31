# Mise en production

La procédure:

1. Aller sur jelastic https://app.jpe.infomaniak.com/
2. En entête sélectionner le groupe d'environnements "openagenda" pour une meilleure lisibilité. Sont présentés alors la poignée d'environnements qui font tourner le bazar.
3. Regarder entre web-blue et web-orange lequel est lancé. Lancer celui qui est éteint. C'est celui à cibler par la mise en production
3 bis. Si quelqu'un a oublié de éteindre l'environnement déconnecté à la dernière mep, ou a décidé de filer plus de biff à infomaniak, il faut identifier quel environnement -web est déconnecté, soit en regardant la charge, soit en regardant l'addon "Traffic distributor" de l'environnement "td". Celui qui est débranché est celui qui prend 0% du traffic.
4. En ssh sur le noeud MEP de l'environnement "admin", lancer le script ./blue.sh ou ./orange.sh, le script choisi ciblant l'environnement à cibler par la mep (celui qui est actuellement débranché)
5. Une fois l'exécution du script terminée, basculer le traffic vers l'environnement ciblé depuis l'addon traffic distributor de l'environnement td
6. Vérifier qu'OpenAgenda n'est pas planté
7. Éteindre l'environnement qui vient d'être débranché lors de la bascule