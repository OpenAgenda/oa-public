/**
 * Exemple: convertir un nœud slate en simple texte.
 * (Dans un vrai cas, gérez blocs, inlines, marks, etc.)
 */
function getPlainText(node) {
  if (!node) return '';
  if (node.text) {
    return node.text;
  }
  if (node.children) {
    return node.children.map(getPlainText).join('');
  }
  return '';
}

/**
 * Exemple: extraire simplement du texte d’un HTML (hors balises).
 * Dans la vraie vie, vous pourriez vouloir récupérer la structure,
 * les balises, etc.
 */
function plainTextFromHtml(htmlString) {
  var _doc$body;
  const doc = new DOMParser().parseFromString(htmlString, 'text/html');
  return ((_doc$body = doc.body) === null || _doc$body === void 0 ? void 0 : _doc$body.textContent) || '';
}

/**
 * Transforme une string HTML en array of Slate nodes.
 */
function deserialize(htmlString) {
  // Écrivez ici votre logique de parsing HTML -> Slate Nodes
  // Par exemple avec DOMParser, ou un package de votre choix.
  // Le résultat final doit être un array de nœuds "Slate".
  //
  // Dans la version minimaliste ci-dessous, on renvoie juste
  //   [{ type: 'paragraph', children: [{ text: '...' }] }]
  // comme exemple.
  //
  // À vous d’adapter selon vos besoins réels.

  if (!htmlString || typeof htmlString !== 'string') {
    return [{
      type: 'paragraph',
      children: [{
        text: ''
      }]
    }];
  }

  // EXEMPLE DÉMO : renvoyer tout le HTML sous forme d’un seul paragraphe
  return [{
    type: 'paragraph',
    children: [{
      text: plainTextFromHtml(htmlString)
    }]
  }];
}

/**
 * Transforme un array of Slate nodes en string HTML.
 */
function serialize(nodes) {
  // Écrivez ici la logique "Slate Nodes" -> HTML
  // Minimalement, on va concaténer les textes trouvés.
  // Dans la pratique, vous gérerez <h2>, <p>, <ul>, etc.

  if (!Array.isArray(nodes) || nodes.length === 0) {
    return '';
  }

  // EXEMPLE DÉMO : on récupère tout le texte et on l’entoure de <p>...</p>.
  const text = nodes.map(node => getPlainText(node)).join('\n');
  return "<p>".concat(text, "</p>");
}
export default {
  serialize,
  deserialize
};
//# sourceMappingURL=slateHTMLSerializer.js.map