# Publication du MCP sur le registry officiel (et au-delà)

Comment `com.openagenda/mcp` est publié sur le
[MCP Registry officiel](https://registry.modelcontextprotocol.io) et ce qu'il
faut maintenir. Le registry n'héberge que des **métadonnées** : la source de
vérité est `public/mcp/server.json` ; l'artefact npm est `@openagenda/mcp`.

## Vue d'ensemble

- **Namespace** : `com.openagenda/*`, prouvé par **authentification DNS**
  (TXT sur `openagenda.com`). Indépendant de GitHub, pérenne.
- **Manifest** : `public/mcp/server.json` (schéma
  `https://static.modelcontextprotocol.io/schemas/2025-12-11/server.schema.json`).
  Il déclare le **remote** Streamable HTTP (`https://mcp.openagenda.com/mcp`,
  la voie principale) et le package npm (`runtimeHint: npx`, chemin stdio
  self-host).
- **Lien npm ↔ registry** : `package.json` du mcp porte
  `"mcpName": "com.openagenda/mcp"` — le registry vérifie que le package npm
  référencé lui appartient. Ne pas le retirer.
- **CI** : l'étape `Publish to MCP Registry` de `.github/workflows/release.yml`
  s'exécute quand changesets vient de publier `@openagenda/mcp` sur npm. Elle
  réaligne les champs `version` de `server.json` sur la version npm publiée
  (réécriture jq, non commitée), s'authentifie en DNS et publie. La version
  committée dans `server.json` n'a donc pas besoin d'être bumpée à la main.

## Mise en place initiale (une fois, à la main)

1. **Générer la paire de clés Ed25519** (la clé privée ne se commit jamais) :

   ```sh
   openssl genpkey -algorithm Ed25519 -out mcp-registry-key.pem
   PUBLIC_KEY="$(openssl pkey -in mcp-registry-key.pem -pubout -outform DER | tail -c 32 | base64)"
   echo "openagenda.com. IN TXT \"v=MCPv1; k=ed25519; p=${PUBLIC_KEY}\""
   ```

2. **Poser le TXT** affiché ci-dessus sur la zone `openagenda.com` (apex, pas un
   sous-domaine). Propagation : quelques minutes. Vérifier :
   `dig +short TXT openagenda.com | grep MCPv1`.

3. **Stocker la clé privée** :

   - coffre 1Password (référence durable) ;
   - secret GitHub Actions `MCP_PUBLISHER_PRIVATE_KEY` sur `OpenAgenda/oa`,
     au format hex attendu par `mcp-publisher` :

     ```sh
     openssl pkey -in mcp-registry-key.pem -noout -text | grep -A3 "priv:" | tail -n +2 | tr -d ' :\n'
     ```

4. **Première publication manuelle** (optionnelle — la CI le fera au premier
   release npm de `@openagenda/mcp`, mais un dry-run manuel valide la chaîne) :

   ```sh
   curl -fsSL "https://github.com/modelcontextprotocol/registry/releases/latest/download/mcp-publisher_$(uname -s | tr '[:upper:]' '[:lower:]')_$(uname -m | sed 's/x86_64/amd64/;s/aarch64/arm64/').tar.gz" | tar xz mcp-publisher
   cd public/mcp
   ../../mcp-publisher login dns --domain openagenda.com --private-key "<hex>"
   ../../mcp-publisher publish
   ```

5. **Vérifier** :

   ```sh
   curl "https://registry.modelcontextprotocol.io/v0.1/servers?search=com.openagenda/mcp"
   ```

## Maintenance

- **Nouvelle version** : rien à faire — changeset sur `@openagenda/mcp` →
  release npm → l'étape CI republie le registry avec la bonne version.
- **Changement d'URL du remote, description, variables d'env du chemin stdio** :
  éditer `public/mcp/server.json` (la prochaine release propage).
- **Rotation de clé** : régénérer la paire, remplacer le TXT et le secret
  GitHub. L'ancien TXT peut être retiré une fois le nouveau propagé.

## Distribution au-delà du registry officiel

- **Annuaire de connecteurs Anthropic (claude.ai)** : soumission manuelle du
  serveur remote (URL + OAuth). C'est le canal grand public Claude — à faire
  une fois le flux OAuth validé de bout en bout depuis un client tiers.
- **Annuaires tiers** (PulseMCP, Glama, mcp.so, Smithery…) : la plupart
  moissonnent le registry officiel ; sinon soumission manuelle de l'URL
  `https://mcp.openagenda.com/mcp` + lien GitHub `OpenAgenda/oa-public`.
- **Page d'accueil** : `GET https://mcp.openagenda.com/` sert la landing avec
  les snippets de connexion par client (`public/mcp/src/landing.js`).
