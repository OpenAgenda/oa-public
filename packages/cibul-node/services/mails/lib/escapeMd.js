export default function escapeMd(input = '') {
  return (
    String(input)
      // 1. Escape HTML
      .replace(
        /[&<>"']/g,
        (c) =>
          ({
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#39;',
          })[c],
      )
      // 2. Escape Markdown
      .replace(/([\\`*_{}[\]()#+\-.!>|])/g, '\\$1')
  );
}
