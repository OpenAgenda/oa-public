(function() {var loadJs=function(a,b){if(typeof a=='string'){var c=document.createElement('script');if(c.readyState){c.onreadystatechange=function(){if(c.readyState=="loaded"||c.readyState=="complete"){c.onreadystatechange=null;if(typeof b=="function")b();b=null}}}else{c.onload=function(){if(typeof b=="function")b();b=null}}c.charset="utf-8";c.src=a;c.type='text/javascript';document.getElementsByTagName('head')[0].appendChild(c)}else{var d=0;for(var i=0;i<a.length;i++){loadJs(a[i],function(){d++;if(d==a.length){b();b=null}})}}};

  (function(){var c=function(){this.register={};this.nextId=1};c.prototype={on:function(a,b){if(typeof this.register[a]=='undefined')this.register[a]=[];this.register[a].push({func:b,funcId:this.nextId});return this.nextId++},trigger:function(a,b){if(typeof this.register[a]=='undefined')this.register[a]=[];var i=this.register[a].length;while(i--)this.register[a][i].func(b)},cancel:function(a){var i;for(eventName in this.register){i=this.register[eventName].length;while(i--)if(a==this.register[eventName][i].funcId){this.register[eventName].splice(i,1);return true}}return false},clear:function(){this.register={}},hasEvent:function(a){return typeof this.register[a]!='undefined'}};if(typeof exports!=='undefined')exports.EventHandler=c;else window.EventHandler=c})();var sEventHandler=(function(){var a;return{getInstance:function(){if(!a)a=new EventHandler();return a}}})();
  
  var handleSuggestions=function(g,h,i,j,k){var l,contextDiv,possibles=[],run=function(){k=extend({contextMenuClass:false,onSelect:false,onChange:false},k);contextDiv=document.createElement('div');contextDiv.style.display='none';if(k.contextMenuClass)addClass(contextDiv,k.contextMenuClass);g.insertAdjacentElement('afterend',contextDiv);l=handleContextMenu(g,contextDiv,sEventHandler.getInstance(),{openOnClick:false});addEvent(g,'keyup',function(e){if(e.keyCode==13)if(possibles.length)return _select(possibles[0]);if(k.onChange)k.onChange(g.value);possibles=_shortlist(g.value,h,i);if(possibles.length===0||possibles.length>10){l.hide();return}_writeSuggestions(contextDiv,possibles,j,_select);l.show()})},_writeSuggestions=function(b,c,d,e){while(b.hasChildNodes())b.removeChild(b.childNodes[0]);var f=new EJS({text:d}),newChild,ul=document.createElement('ul'),li;forEach(c,function(a){li=document.createElement('li');li.innerHTML=f.render(a);addEvent(li,'click',function(){e(a)});ul.appendChild(li)});b.appendChild(ul)},_shortlist=function(b,d,e){var f='',selection=[];forEach(b,function(c){f+='.*'+c.toLowerCase()});f=new RegExp(f);forEach(d,function(a){if(a[e].toLowerCase().match(f))selection.push(a)});return selection},_select=function(a){g.value=a[i].replace('&#039;','\'');l.hide();if(k.onSelect)k.onSelect(a)},_remove=function(){if(contextDiv)contextDiv.parentNode.removeChild(contextDiv)};run();return{remove:_remove}},
  handleContextMenu=function(b,c,d,e){var f=false,menuClicked=false,triggerClicked=false,e=extend({position:true,left:true,bodyClickEvent:'bodyclick',openOnClick:true,zIndex:2},e),init=function(){_initStyles();if(!d.hasEvent(e.bodyClickEvent))addEvent(el('body'),'click',function(){d.trigger(e.bodyClickEvent)});d.on(e.bodyClickEvent,function(){if(triggerClicked){f?_hideMenu():_displayMenu()}else if(!menuClicked){_hideMenu()};menuClicked=false;triggerClicked=false});if(e.openOnClick)addEvent(b,'click',function(){triggerClicked=true});addEvent(c,'click',function(){menuClicked=true})},_hideMenu=function(){c.style.display='none';f=false},_displayMenu=function(){c.style.display='inline-block';_displayStyle();f=true},_initStyles=function(){if(!e.position)return;if(!b.parentNode.style.position.length)b.parentNode.style.position='relative';extend(c.style,{display:'none',position:'absolute',zIndex:e.zIndex})},_displayStyle=function(){extend(c.style,{display:'inline-block',top:b.offsetHeight?b.offsetHeight+'px':'1em'});var a=b[e.left?'offsetLeft':'offsetRight']?b[e.left?'offsetLeft':'offsetRight']:'0';c.style[e.left?'left':'right']=a+'px'};init();return{show:_displayMenu,hide:_hideMenu}},
  onLoad = function(element, register) {

    var cibulSearchWidget = cibulWidget({
      name: 'search',
      sSelection: {},
      lang: 'en',
      labels: {
        fr: {
          search: 'saisissez le nom d\'un lieu ou d\'une ville'
        },
        en: {
          search: 'type the name of a place or a city'
        },
      },
      templates: {
        main: '<input type="text" placeholder="<%= labels.search %>">'
      },
      contextMenuClass: 'context-menu',
      today: false,
      sIndex: {},
      init: function(ctl, config) {

        var self = this;

        if (config.length > 1) this.lang = config[1];

        this.today = new Date();

        this.createIndex(ctl);

        this._create({labels: this.labels[this.lang]});

        handleSuggestions(el(element, 'input'), this.sIndex, 'name', '<div><%= name %></div>', {
          contextMenuClass: this.contextMenuClass,
          onSelect: function(value) { self.onSearchSelect(value); }
        });

      },
      onSearchSelect: function(value) {

        if (value.id) {

          this.sSelection = {location: value.id, neLat: null, neLng: null, swLat: null, swLng: null};

        } else {

          this.sSelection = {location: null, neLat: value.corners.ne[0], neLng: value.corners.ne[1], swLat: value.corners.sw[0], swLng: value.corners.sw[1]};

        }

        this._select(this.sSelection);

      },
      enable: function(reqParams) {

        if (reqParams.neLat) {
          if ((reqParams.neLat == this.sSelection.neLat) && (reqParams.neLng == this.sSelection.neLng) && (reqParams.swLat == this.sSelection.swLat) && (reqParams.swLng == this.sSelection.swLng)) return;
        }

        if ((reqParams.location) && (reqParams.location == this.sSelection.location)) {
          return;
        }

        el(element, 'input').value = '';

      },
      createIndex: function(ctl) {

        var locations = [];

        for (var a in ctl.a) {
          for (var l in ctl.a[a].l) {

            if (!contains(locations, l)) {

              var location = ctl.a[a].l[l];

              locations.push(l);

              this.index(location.p, location, l);

              this.index(location.ct, location);

            }

          }
        }

        var tmp = this.sIndex;

        this.sIndex = [];

        for (var name in tmp) {

          var index = {name: name, score: tmp[name].score, corners: {ne: tmp[name].ne, sw: tmp[name].sw}};

          if (tmp[name]['id']) index['id'] = tmp[name]['id'];

          this.sIndex.push(index);

        }

        this.sIndex = this.sIndex.sort(function(a, b) { return b.score - a.score; });

      },

      index: function(name, location, id) {

        if (!name || !name.length) return;

        name = name.trim();

        var point = this.hasUpcoming(location)?1:0;

        if (typeof this.sIndex[name] == 'undefined') {

          this.sIndex[name] = {ne: [location.lt, location.lg], sw: [location.lt, location.lg], score: point };

          // if this is a place, keep track of id to throw it in the callback
          if (id) this.sIndex[name].id = id;

          return;

        }

        if (this.sIndex[name].ne[0] < location.lt) this.sIndex[name].ne[0] = location.lt;
        if (this.sIndex[name].ne[1] < location.lg) this.sIndex[name].ne[1] = location.lg;
        if (this.sIndex[name].sw[0] > location.lt) this.sIndex[name].sw[0] = location.lt;
        if (this.sIndex[name].sw[1] > location.lg) this.sIndex[name].sw[1] = location.lg;

        this.sIndex[name].score += point;

      },
      hasUpcoming: function(l) {

        for (var i = l.d.length - 1; i >= 0; i--) {
          if (new Date(l.d[i]) > this.today) return true;
        }

        return false;

      }
    });

    new cibulSearchWidget(element, register);

  },

  run = function() {
    cibulControllers.loadWidget('.cbpgsc', onLoad);
  };

  if (typeof cibulControllers !== 'undefined') return run();
  
  loadJs('//cibul.net/js/embed/cibulWidgetLib.js', run);

})();