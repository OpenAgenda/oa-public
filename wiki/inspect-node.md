## 🛠️ Étape 1 : Identifier rapidement le PID responsable

**Liste les processus consommant beaucoup de CPU :**

```bash
top
# ou mieux :
htop
```

Ça te permet d'identifier rapidement le processus Node.js en cause.

---

## 📌 Étape 2 : Inspecter le processus Node.js en détail avec `pm2`

Si tu utilises `pm2`, vérifie l'état :

```bash
pm2 list
```

Puis identifie précisément le processus fautif avec :

```bash
pm2 monit
```

Tu verras immédiatement lequel consomme du CPU ou sature.

---

## 🔍 Étape 3 : Analyse approfondie (avec `clinic`, `0x` ou natif Node.js)

Tu peux faire un profilage **sans redémarrage ni déploiement** en connectant un profiler sur le process déjà en exécution (si Node.js a démarré avec l’option par défaut permettant l’inspection distante, sinon il faut au moins que ce soit possible via `SIGUSR1`).

Vérifie la version Node :

```bash
node -v
```

### ➡️ Méthode recommandée : Utiliser `node --inspect`

Si ton Node est récent (≥ v8), tu peux activer l’inspecteur distant sans relancer ton app :

1.  Active l’inspection à chaud en envoyant `SIGUSR1` au processus Node fautif :

```bash
kill -SIGUSR1 <PID_NODE>
```

- Remplace `<PID_NODE>` par le PID récupéré avec `pm2 pid <id_pm2>`.

Node affichera un message dans ses logs avec un port inspecteur ouvert (`9229`, ou le suivant disponible).

2.  Fais un port-forward vers ton poste local :

```bash
ssh -L 9229:localhost:9229 user@server
```

Pour un noeud Infomaniak:

```bash
ssh -L 9229:localhost:9229 128237-2943@gate.jpe.infomaniak.com -p 3022
```

Cette méthode ne nécessite aucun changement particulier sur ton serveur, elle s’appuie uniquement sur SSH.

3.  Ouvre Chrome à l’adresse :

```arduino
chrome://inspect
```

Et clique sur le lien "Inspect".  
Tu as accès à l'inspecteur Node.js (CPU profiler, memory, stack-traces en direct).

---

## 🚀 Alternative si pas d’accès à distance via Chrome : Générer un profil CPU avec `clinic` ou `0x`

### Exemple avec `0x` :

**Installation :**

```bash
npm install -g 0x
```

**Profilage à chaud (sans interruption) :**

```bash
0x --pid=<PID_NODE>
```

L'outil va générer un profiling pendant quelques secondes puis sortir automatiquement.  
Tu obtiens ensuite une visualisation graphique interactive HTML.

---

## 🚩 Vérifier les appels bloquants côté Node.js (en shell rapide) :

Tu peux aussi vérifier rapidement les appels bloquants avec `lsof` ou `strace` pour voir en temps réel les appels systèmes :

```bash
sudo strace -p <PID_NODE>
```

C’est brut, mais ça te montre si ton process est bloqué sur un appel réseau, IO, etc.

---

## 📈 Étape 4 : Examiner précisément les stacks avec `gstack` (moins commun, mais utile)

Si tu veux une capture immédiate de la stack courante pour identifier un blocage :

```bash
sudo gstack <PID_NODE> > stacktrace.log
```

- Inspecte `stacktrace.log` pour identifier la fonction ou la librairie posant problème.

---

## ✅ Résumé rapide (méthode la plus simple sans déploiement) :

- Identifier PID avec `htop` ou `pm2 monit`.

- Activer inspection à chaud : `kill -SIGUSR1 <PID_NODE>`

- Inspecter depuis Chrome : `chrome://inspect`.

Ça te donne rapidement un aperçu précis de ce qui consomme du CPU.

---

**👉 Recommandation finale :**

Utilise l’inspecteur Node natif (`--inspect`) via `SIGUSR1` pour un diagnostic immédiat en production sans redémarrage.

Ça permet une analyse complète et rapide, en particulier pour les problèmes difficiles à reproduire.
