# Guide d'installation sur Jelastic

Je voudrais tester: un cluster db de dev lowcost (peu de cloudlets mini), idem pour elasticsearch

Pour avoir une installation complète d'OpenAgenda sur jelastic il faut:

 * Une base de donnée: voir jelastic/mysql.md
 * Un cluster elasticsearch: voir jelastic/elasticsearch.md (variante locale)
 * Un cluster redis: voir jelastic/redis.md
 * Deux environnements pour les serveurs web
 * Un environnement pour les serveurs de tâche
 * Un environnement Traffic Distributor pour la bascule lors des mises en production
 * Un environnement pour l'application de mise en production