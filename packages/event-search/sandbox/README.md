----------------------------------------------------------------------------
Cette sandbox permet l'execution de requêtes DSL sur l'index 'dev' à l'adresse définie en configuration.

Les requêtes proposées sur la liste de choix sont définies dans le dossier "in".
Les fichiers dans se dossier sont suivis par git, à l'exception de ceux qui commencent par un caractère _

Le script reboucle sur lui même après chaque requête et lit de nouveau le contenu du dossier "in".
La liste de choix alors proposée inclus les modifications apportées depuis la dernière execution.

Les résultats d'execution sont affichés ET placés dans un fichier `result.json`
----------------------------------------------------------------------------
