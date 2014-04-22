(function() {var loadJs=function(a,b){if(typeof a=='string'){var c=document.createElement('script');if(c.readyState){c.onreadystatechange=function(){if(c.readyState=="loaded"||c.readyState=="complete"){c.onreadystatechange=null;if(typeof b=="function")b();b=null}}}else{c.onload=function(){if(typeof b=="function")b();b=null}}c.charset="utf-8";c.src=a;c.type='text/javascript';document.getElementsByTagName('head')[0].appendChild(c)}else{var d=0;for(var i=0;i<a.length;i++){loadJs(a[i],function(){d++;if(d==a.length){b();b=null}})}}};

  (function(){var c=function(){this.register={};this.nextId=1};c.prototype={on:function(a,b){if(typeof this.register[a]=='undefined')this.register[a]=[];this.register[a].push({func:b,funcId:this.nextId});return this.nextId++},trigger:function(a,b){if(typeof this.register[a]=='undefined')this.register[a]=[];var i=this.register[a].length;while(i--)this.register[a][i].func(b)},cancel:function(a){var i;for(eventName in this.register){i=this.register[eventName].length;while(i--)if(a==this.register[eventName][i].funcId){this.register[eventName].splice(i,1);return true}}return false},clear:function(){this.register={}},hasEvent:function(a){return typeof this.register[a]!='undefined'}};if(typeof exports!=='undefined')exports.EventHandler=c;else window.EventHandler=c})();var sEventHandler=(function(){var a;return{getInstance:function(){if(!a)a=new EventHandler();return a}}})();
  
  var handleSuggestions=function(g,h,i,j,k){var l,contextDiv,possibles=[],run=function(){k=extend({contextMenuClass:false,onSelect:false,onChange:false,maxResults:10,match:'loose',},k);contextDiv=document.createElement('div');contextDiv.style.display='none';if(k.contextMenuClass)addClass(contextDiv,k.contextMenuClass);g.insertAdjacentElement('afterend',contextDiv);l=handleContextMenu(g,contextDiv,sEventHandler.getInstance(),{openOnClick:false});addEvent(g,'keyup',function(e){if(e.keyCode==13)if(possibles.length)return _select(possibles[0]);if(k.onChange)k.onChange(g.value);possibles=_shortlist(g.value,h,i);if(possibles.length===0||possibles.length>k.maxResults){l.hide();return}_writeSuggestions(contextDiv,possibles,j,_select);l.show()})},_writeSuggestions=function(b,c,d,e){while(b.hasChildNodes())b.removeChild(b.childNodes[0]);var f=new EJS({text:d}),newChild,ul=document.createElement('ul'),li;forEach(c,function(a){li=document.createElement('li');li.innerHTML=f.render(a);addEvent(li,'click',function(){e(a)});ul.appendChild(li)});b.appendChild(ul)},_shortlist=function(b,c,d){var e=_buildRegex(b),selection=[];forEach(c,function(a){if(a[d].toLowerCase().match(e))selection.push(a)});return selection},_buildRegex=function(a){var b='';if(k.match=='direct'){b=a.toLowerCase()}else{forEach(a.toLowerCase(),function(c){b+='.*'+c})}return new RegExp(b)},_select=function(a){g.value=a[i].replace('&#039;','\'');l.hide();if(k.onSelect)k.onSelect(a)},_remove=function(){if(contextDiv)contextDiv.parentNode.removeChild(contextDiv)};run();return{remove:_remove}},
  handleContextMenu=function(b,c,d,e){var f=false,menuClicked=false,triggerClicked=false,e=extend({position:true,left:true,bodyClickEvent:'bodyclick',openOnClick:true,zIndex:2},e),init=function(){_initStyles();if(!d.hasEvent(e.bodyClickEvent))addEvent(el('body'),'click',function(){d.trigger(e.bodyClickEvent)});d.on(e.bodyClickEvent,function(){if(triggerClicked){f?_hideMenu():_displayMenu()}else if(!menuClicked){_hideMenu()};menuClicked=false;triggerClicked=false});if(e.openOnClick)addEvent(b,'click',function(){triggerClicked=true});addEvent(c,'click',function(){menuClicked=true})},_hideMenu=function(){c.style.display='none';f=false},_displayMenu=function(){c.style.display='inline-block';_displayStyle();f=true},_initStyles=function(){if(!e.position)return;if(!b.parentNode.style.position.length)b.parentNode.style.position='relative';extend(c.style,{display:'none',position:'absolute',zIndex:e.zIndex})},_displayStyle=function(){extend(c.style,{display:'inline-block',top:b.offsetHeight?b.offsetHeight+'px':'1em'});var a=b[e.left?'offsetLeft':'offsetRight']?b[e.left?'offsetLeft':'offsetRight']:'0';c.style[e.left?'left':'right']=a+'px'};init();return{show:_displayMenu,hide:_hideMenu}},
  onLoad = function(element, register) {

    var cibulSearchWidget = cibulWidget({
      name: 'search',
      sSelection: {},
      lang: 'en',
      offset: 0.08, // fixed to include neighboring smaller cities
      labels: {
        fr: {
          search: 'saisissez le nom d\'un lieu ou d\'une ville'
        },
        en: {
          search: 'type the name of a place or a city'
        },
      },
      templates: {
        main: '<label for="geosearch"><%= labels.search %></label><input type="text" placeholder="<%= labels.search %>" name="geosearch">'
      },
      contextMenuClass: 'context-menu',
      today: false,
      sIndex: {},
      defaultStyle: [
        '.cibulSearch input { border: 1px solid #ccc; padding: 0em 0.4em; }',
        '.cibulSearch label { display: none; }',
        '.cibulSearch .context-menu { background: white; border: 1px solid #eee; padding: 0.2em 0.4em; margin-top: 0.4em; text-align: left; }',
        '.cibulSearch .context-menu > ul { padding: 0; margin: 0; }',
        '.cibulSearch .context-menu > ul li { padding: 0.1em 0.2em; list-style-type: none; cursor: pointer; }'
      ].join(''),
      init: function(ctl, config) {

        var self = this;

        if (config.length > 1) this.lang = config[1];

        this.today = new Date();

        this.createIndex(ctl);

        this._create({labels: this.labels[this.lang]});

        handleSuggestions(el(element, 'input'), this.sIndex, 'name', '<div><%= name %></div>', {
          contextMenuClass: this.contextMenuClass,
          match: 'direct',
          onSelect: function(value) { self.onSearchSelect(value); },
          maxResults: 20
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

              this.index(location.pc, location);

              this.index(location.ct, location);

              this.index(location.rg, location);

              this.index(location.dp, location);

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

        var point = this.hasUpcoming(location)?1:0,

        coords = [parseFloat(location.lt), parseFloat(location.lg)];

        if (typeof this.sIndex[name] == 'undefined') {

          this.sIndex[name] = {ne: [coords[0]+this.offset, coords[1]+this.offset], sw: [coords[0]-this.offset, coords[1]-this.offset], score: point };

          // if this is a place, keep track of id to throw it in the callback
          if (id) this.sIndex[name].id = id;

          return;

        } else {

          if (typeof this.sIndex[name].id !== id) this.sIndex[name].id = undefined;

        }

        if (this.sIndex[name].ne[0] < coords[0]) this.sIndex[name].ne[0] = coords[0] + this.offset;
        if (this.sIndex[name].ne[1] < coords[1]) this.sIndex[name].ne[1] = coords[1] + this.offset;
        if (this.sIndex[name].sw[0] > coords[0]) this.sIndex[name].sw[0] = coords[0] - this.offset;
        if (this.sIndex[name].sw[1] > coords[1]) this.sIndex[name].sw[1] = coords[1] - this.offset;

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