(function(w,d) {

  if (typeof w.cibulStyle !== 'undefined') return;

  var styles = {
    disabledColor: '#ccc',
    defaultColor: '#333',
    activeColor: '#333',
    selectedColor: 'blue',
    preselectedColor: '#f0f0f0'
  },

  style = [],

  format = function(tpl, ctx) {
    return tpl.replace(/\{\{([a-zA-Z ]*)\}\}/g, function(m, g) {
        return ctx[g.trim()] || '';
    });
  };

  w.cibulStyle = true;

  // default category styles

  style = style.concat([
    '.cibulCategories ul { margin: 0; padding: 0; }',
    '.cibulCategories li { display: inline-block; cursor: pointer; padding-right: 1em; color: {{ disabledColor }}; }',
    '.cibulCategories li.active { color: {{ activeColor }}; }',
    '.cibulCategories li.selected { color: {{ selectedColor }}; }',
    '.cibulCategories.disabled li { cursor: wait; color: {{ disabledColor }} }'
  ]);

  style = style.concat([
    '.cibulTags ul { margin: 0; padding: 0; }',
    '.cibulTags li { display: inline-block; cursor: pointer; padding-right: 1em; color: {{ disabledColor }}; font-size: 0.9em; }',
    '.cibulTags li.active { color: {{ activeColor }}; }',
    '.cibulTags li.selected { color: {{ selectedColor }}; }',
    '.cibulTags.disabled li { cursor: wait; color: {{ disabledColor }} }'
  ]);

  style = style.concat([
    '.ccal { width: 18em; font-size: 0.8em; text-align: center; display: inline-block; }',
    '.ccal div { display: block;}',
    '.ccal ul { margin: 0; padding: 0; text-align: left; }',
    '.ccal li { list-style-type: none; display: inline-block; width: 13.2%; cursor: pointer; text-align: center; border: 1px solid transparent; }',
    '.ccal li span { display: inline-block; line-height: 1.8em; }',
    '.ccal li.calmonth { width: 69%; cursor: pointer; }',
    '.ccal li span { padding: 0.1em 0.05em; display: block; }',
    '.ccal li.calprev span, .ccal li.calnext span { background: #eee; color: #aaa; }',
    '.ccal li.calprev, .ccal li.calnext { border: 1px solid #eee; }',
    '.ccal .calbody li { cursor: pointer; }',
    '.ccal .calbody li span { color: #999; }',
    '.ccal .calbody li.today { border: 1px solid #eee; }',
    '.ccal .calbody li.selected span { background: #666; color: white; }',
    '.ccal .calbody li.preselected span { background: {{ preselectedColor }}; }',
    '.ccal * { -moz-user-select: -moz-none; -khtml-user-select: none; -webkit-user-select: none; -ms-user-select: none; user-select: none; }',
    '.ccal .calbody li.hasdates span { color: {{ defaultColor }}; }'
  ]);

  style = style.concat([
    '.cibulMap { height: 300px; width: 100%; }',
    '.cibulMap .map-canvas { height: 100%; }',
    '.cibulMap .map-sync { text-align: right; }',
    '.cibulMap .map-sync > * { vertical-align: middle; }'
  ]);

  style = format(style.join(' '), styles);

  sheet = d.createElement('style');

  sheet.type = 'text/css';

  sheet.media = 'all';

  if (sheet.styleSheet) {
    sheet.styleSheet.cssText = style;
  } else {
    sheet.innerHTML = style;
  }

  var add = function() {
    d.body.appendChild(sheet);
  };

  if (document.readyState === "complete")
    add();
  else
    addEvent(window, 'load', add);

  

})(window, document);