/* tabs 0.3 */
/* pane indexes can be set manually */
var tabs = function(tabElems, paneElems, params) {

  var params = extend({
    activeClass: 'active', 
    displayNoneClass: 'display-none',
    onClick: false,
    dataAttr: 'data-tab-indexes'
  }, params),
  paneMap = [],
  _run = function() {

    if (typeof tabElems == 'string') tabElems = getElementsByClassName(document, tabElems);
    if (typeof paneElems == 'string') paneElems = getElementsByClassName(document, paneElems);

    // correspondence table should match tabs to panes

    for(tabIndex in tabElems) paneMap.push([]);

    for (var paneIndex in paneElems) {
      var paneElem = paneElems[paneIndex];
      if (paneElem.hasAttribute(params.dataAttr)) forEach(paneElem.getAttribute(params.dataAttr).split(','), function(tabIndex) {
        paneMap[parseInt(tabIndex, 10)].push(parseInt(paneIndex, 10));
      }); else {
        paneMap[paneIndex].push(paneIndex);
      }
        
    }

    forEach(tabElems, function(tabElem) {
      addEvent(tabElem, 'click', function(){
        _tabClicked(tabElem);
      });
    });
  },
  _tabClicked = function(chosenTab) {

    var chosenIndex;

    addClass(chosenTab, params.activeClass);

    forEach(paneElems, function(paneElem) {
      addClass(paneElem, params.displayNoneClass);
    });

    for (var tabIndex in tabElems) {
      if (chosenTab!=tabElems[tabIndex]) 
        removeClass(tabElems[tabIndex], params.activeClass);
      else
        chosenIndex = tabIndex;
    }

    forEach(paneMap[chosenIndex], function(paneIndex) {
      removeClass(paneElems[paneIndex], params.displayNoneClass);
    });      

    if (params.onClick) params.onClick();
  };

  _run();
}