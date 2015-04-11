(function(){

  function main() {

    jQuery(document).ready(function($) {

      var cibulProgramWidget = new programWidget('.cibul-pw', {
        //test: true,
        templates: {
          review: '<div class="review-item">' +
                    '<a href="{reviewurl}"><img class="pic-small" alt="{reviewtitle}" src="{reviewimage}"/></a>' +
                      '<div class="review-content">' +
                        '<div class="review-name"><a href="{reviewurl}">{reviewtitle}</a></div>' +
                        '<div class="bio">{reviewbio}</div>' +
                      '</div>' +
                    '</div>',
          article:  '<div class="cibul-stream-item">' +
                      '<div class="cibul-article-item">{%optional/infoname}' +
                        '<div class="cibul-activist-info">' +
                          '<img class="pic-nano" alt="{infoname}" src="{infoimage}"/>' +
                          '<span class="cibul-review-name"><a {embedtarget} href="{reviewurl}">{reviewtitle}</a></span>' +
                        '</div>' +
                        '<div class="cibul-article-text">{reviewarticle}</div>' +
                      '{optional/infoname%}</div>' +
                      '<div class="cibul-activity-container">' +
                        '<div class="cibul-activity-content">' +
                          '<div class="cibul-event-in-stream cibul-drop-shadow cibul-border-shadow">' +
                            '<div class="cibul-event-item">' +
                              '<a href="{url}"><img class="cibul-event-pic-small cibul-event-link" alt="{title}" src="{image}"></a>' +
                              '<div class="cibul-event-content">' +
                                '<div class="cibul-event-name"><a href="{url}">{title}</a></div>' +
                                '<div class="cibul-event-description"><a href="{url}">{description}</a></div>' +
                                '<div class="cibul-whenwhere">{spacetimeinfo}</div>' +
                                '<div class="cibul-actions">' +
                                  '{%optional/pricing}{pricing} · {optional/pricing%}' +
                                  '{%optional/ticket}<a class="cibul-url" href="{ticket}">r&eacute;server</a>{optional/ticket%}' +
                                '</div>' +
                              '</div>' +
                            '</div>' +
                          '</div>' +
                        '</div>' +
                      '</div>' +
                    '</div>'
        }
      });

    });
  };

  if (typeof String.prototype.getUrlParameters == 'undefined') String.prototype.getUrlParameters = function(){var map = {};var parts = this.replace(/[?&]+([^=&]+)=([^&#]*)/gi, function(m,key,value) {map[key] = value;});return map;};
  if (typeof Object.size == 'undefined') Object.size = function(obj) {var size = 0, key;for (key in obj) {if (obj.hasOwnProperty(key)) size++;}return size;};
  /* queryClient */ eval(function(p,a,c,k,e,r){e=function(c){return(c<a?'':e(parseInt(c/a)))+((c=c%a)>35?String.fromCharCode(c+29):c.toString(36))};if(!''.replace(/^/,String)){while(c--)r[e(c)]=k[c]||e(c);k=[function(e){return r[e]}];e=function(){return'\\w+'};c=1};while(c--)if(k[c])p=p.replace(new RegExp('\\b'+e(c)+'\\b','g'),k[c]);return p}('r S=3(e,f){0.D=3(a,b){1(9 b.7==\'8\')0.7=$;m 0.7=b.7;0.2=0.7.q({},0.7.q(0.7.q({},0.G),b));0.6=5;0.k=5;0.l=5;0.7=0.2.7;0.v=E O();1(0.2.6)0.6=E V(0.2.6);0.J(a);0.j={};1(0.2.w)0.u()};0.G={6:5,A:5,w:5,h:5,y:5,4:{},s:5,t:5,x:5};0.N=3(a,b,c){r d=5;1(9 0.4[a]==\'8\'){d=n}m 1(0.4[a]!=b){d=n}1(d){0.4[a]=b;0.B();1(0.2.w)0.u(c)}};0.P=3(a,b){r c=5;R(p T a){1(!c){1(9 0.4[p]==\'8\'){c=n}m 1(0.4[p]!=a[p]){c=n}}0.4[p]=a[p]}1(c){0.B();1(0.2.w)0.u(b)}};0.Z=3(a,b){1(9 0.4[a]==\'8\')i b;i 0.4[a]};0.1h=3(){i 0.4};0.u=3(a){1(0.k){1(0.2.h)0.2.h(0.j);1(9 a!=\'8\')a(0.j)}m{0.F(a)}};0.F=3(d){1(0.l)i 5;0.l=n;1(0.6&&0.2.A)0.6.C(0.4);1(0.2.H)0.2.H();1(0.2.y!==5){Q(0.7.I(3(){1(0.2.o)0.2.o();0.l=5;0.j=0.2.y;0.z();1(9 d!=\'8\')d(0.j);1(0.2.h)0.2.h(0.j)},0),U)}m{0.7.1o({W:\'X\',Y:0.K,10:0.4,L:12,13:0.2.x?"x":"14",15:3(a,b){1(b==\'L\'){0.l=5;1(0.2.o)0.2.o()}},16:0.7.I(3(a,b){1(0.2.o)0.2.o();0.l=5;0.j=a;0.z();1(9 d!=\'8\')d(a);1(0.2.h)0.2.h(a);1(0.v.17){r c=0.v.18();c()}},0)})}};0.19=3(a){1(0.6)0.6.1a(a)};0.1b=3(){i 0.l};0.1c=3(a){0.v.1d(a)};0.1e=3(){i 0.k};0.1f=3(a){0.2.h=a};0.1g=3(){0.4={}};0.J=3(a){1(9 a!=\'8\'){0.K=a.M(/\\?.+/,\'\');a=a.M(/\\+/g,\'%1i\');r b=1j(a).1k();0.4=0.7.q(0.2.4,b)}m{0.4=0.2.4}1(0.6){0.4=0.7.q(0.4,0.6.1l());1(0.2.A)0.6.C(0.4)}};0.1m=3(a){1(0.6){0.6.C(0.4);1(9 a!=\'8\')a()}};0.B=3(){1(!0.k)i;0.k=5;1(0.2.t)0.2.t()};0.z=3(){1(0.k)i;0.k=n;1(0.2.s)0.2.s()};0.1n=3(a){0.2.t=a};0.11=3(a){0.2.s=a};0.D(e,f)};',62,87,'this|if|options|function|parameters|false|anchor|jQuery|undefined|typeof||||||||onResponse|return|searchData|synced|loading|else|true|loadingOff|name|extend|var|syncedCallback|unSyncedCallback|getData|loadingDoneCallbackStack|autoSync|jsonp|testData|setSynced|autoAnchor|setUnSynced|setAll|init|new|loadData|defaults|loadingOn|proxy|initLinkAndParameters|link|timeout|replace|setParameter|Array|setParameters|setTimeout|for|queryClient|in|3000|anchorSet|type|get|url|getParameter|data|setSyncedCallback|20000|dataType|json|complete|success|length|pop|setOnExternalChange|setOnChange|isLoading|addLoadingDoneCallback|unshift|isSynced|setOnResponse|resetParameters|getParameters|20|decodeURIComponent|getUrlParameters|getAll|loadAnchor|setUnsyncedCallback|ajax'.split('|'),0,{}));
  /* htmlizer */ //eval(function(p,a,c,k,e,r){e=function(c){return(c<a?'':e(parseInt(c/a)))+((c=c%a)>35?String.fromCharCode(c+29):c.toString(36))};if(!''.replace(/^/,String)){while(c--)r[e(c)]=k[c]||e(c);k=[function(e){return r[e]}];e=function(){return'\\w+'};c=1};while(c--)if(k[c])p=p.replace(new RegExp('\\b'+e(c)+'\\b','g'),k[c]);return p}('5 14=t(o,p){1.X=t(a,b){8(D b.q==\'w\')1.q=$;J 1.q=b.q;1.T=a;1.M=\'\';1.O={};1.2=1.q.S({},1.q.S(1.q.S({},1.V),b))};1.V={K:\'1a\',W:\'1c\',A:{r:\'{\',s:\'}\'},4:{u:\'{%\',v:\'}\',F:\'{\',x:\'%}\'},y:\'18\\/\',z:{r:\'{%Z}\',s:\'{Z%}\'},B:\'13\\/\',};1.1d=t(a){5 b=\'\';5 c;C(3 E a){8(D a[3][1.2.K]==\'w\'){c=1.2.W}J{c=a[3][1.2.K]}b+=1.P(a[3],1.T[c])}1.M=b;1.O=a;G 15};1.16=t(){G 1.M};1.17=t(){G 1.O};1.P=t(a,b){5 c;5 d;5 e;5 f;5 g;8(D a.H!=\'w\')C(3 E a.H){N=a.H[3];f=6 7(1.2.4.u+1.2.y+3+1.2.4.v+\'.+\'+1.2.4.F+1.2.y+3+1.2.4.x,\'g\');5 h=b.R(f);8(h!==19){5 i=b.R(f)[0];5 j=b.10(i);8(!11.12(a.H[3])){b=b.I(0,j)+b.I(j+i.U)}J{g=6 7(1.2.z.r+\'.+\'+1.2.z.s,\'g\');5 k=i.R(g)[0];5 l=k.9(6 7(1.2.z.r+\'|\'+1.2.z.s,\'g\'),\'\');5 m=i.9(6 7(1.2.4.u+1.2.y+3+1.2.4.v+\'|\'+1.2.4.F+1.2.y+3+1.2.4.x,\'g\'),\'\');5 n=\'\';C(Y E N){n=n+1.P(N[Y],l)}m=m.9(6 7(k,\'g\'),n);b=b.I(0,j)+m+b.I(j+i.U)}}}8(D a.Q!=\'w\')C(3 E a.Q){c=a.Q[3];d=6 7(1.2.A.r+3+1.2.A.s,\'g\');b=b.9(d,c)}8(D a.L!=\'w\')C(3 E a.L){c=a.L[3];8(c===1b){e=6 7(1.2.4.u+1.2.B+3+1.2.4.v+\'.+\'+1.2.4.F+1.2.B+3+1.2.4.x,\'g\');b=b.9(e,\'\')}J{d=6 7(1.2.A.r+3+1.2.A.s,\'g\');b=b.9(d,c);e=6 7(1.2.4.u+1.2.B+3+1.2.4.v+\'|\'+1.2.4.F+1.2.B+3+1.2.4.x,\'g\');b=b.9(e,\'\')}}G b};1.X(o,p)};',62,76,'|this|options|index|setBrackets|var|new|RegExp|if|replace|||||||||||||||||jQuery|opening|closing|function|openingOpening|openingClosing|undefined|closingClosing|listPrefix|listItem|varBrackets|optionalPrefix|for|typeof|in|closingOpening|return|lists|substr|else|templateIndexName|optionals|html|listItemData|inputData|processItem|values|match|extend|templates|length|defaults|defaultTemplate|init|subindex|listitem|indexOf|Object|size|optional|htmlizer|true|getHtml|getData|list|null|template|false|item|processList'.split('|'),0,{}));

  var htmlizer = function(templates, options) {

    this.init = function(templates, options){

      if (typeof options.jQuery == 'undefined') this.jQuery = $;
      else this.jQuery = options.jQuery;

      this.templates = templates;
      this.html = '';
      this.inputData = {};
      
      this.options = this.jQuery.extend({}, this.jQuery.extend(this.jQuery.extend({}, this.defaults), options));
    };

    this.defaults = {
      templateIndexName: 'template',
      defaultTemplate: 'item',
      varBrackets: {opening: '{', closing: '}'},
      setBrackets: {openingOpening: '{%', openingClosing: '}', closingOpening: '{', closingClosing: '%}'},
      listPrefix: 'list\/',
      listItem: {opening: '{%listitem}', closing: '{listitem%}'},
      optionalPrefix: 'optional\/',
    };

    this.processList = function(data){
      
      var newListItems = '';
      var templateName;
      
      for (index in data) {
        
        // find the template name for the current item
        if (typeof data[index][this.options.templateIndexName] == 'undefined') {

          templateName = this.options.defaultTemplate;

        }
        else {

          templateName = data[index][this.options.templateIndexName];
        
        }

        newListItems += this.processItem(data[index], this.templates[templateName]);
      }

      this.html = newListItems;
      this.inputData = data;

      return true;
    };

    this.getHtml = function(){
      return this.html;
    };

    this.getData = function(){
      return this.inputData;
    };

    this.processItem = function(itemData, itemHtml) {

      // get template content
      var value; var simpleRegex; var optionalRegex; var listRegex; var listItemRegex;

      // process lists
      if (typeof itemData.lists != 'undefined') for (var index in itemData.lists) {
        listItemData = itemData.lists[index];

        // extract sublist
        listRegex = new RegExp(this.options.setBrackets.openingOpening + this.options.listPrefix + index + this.options.setBrackets.openingClosing + '.+' + this.options.setBrackets.closingOpening + this.options.listPrefix + index + this.options.setBrackets.closingClosing, 'g');

        var match = itemHtml.match(listRegex);

        if (match !== null) {

          var listTemplate = itemHtml.match(listRegex)[0];
          var listTemplateIndex = itemHtml.indexOf(listTemplate);

          if (!Object.size(itemData.lists[index])) { // no items to list, template should be removed

            itemHtml = itemHtml.substr(0,listTemplateIndex) + itemHtml.substr(listTemplateIndex+listTemplate.length);

          } else {
            
            listItemRegex = new RegExp(this.options.listItem.opening + '.+' + this.options.listItem.closing, 'g');
            var listItemTemplate = listTemplate.match(listItemRegex)[0];

            //if (index=='sharing') //console.log('1. listTemplate: ' + listTemplate);
            //if (index=='sharing') //console.log('2. listItemTemplate: ' + listItemTemplate);

            var listItemTemplateStripped = listItemTemplate.replace(new RegExp(this.options.listItem.opening + '|' + this.options.listItem.closing, 'g'), '');

            //if (index=='sharing') //console.log('3. listItemTemplateStripped: ' + listItemTemplateStripped);

            var listTemplateStripped = listTemplate.replace(new RegExp(this.options.setBrackets.openingOpening + this.options.listPrefix + index + this.options.setBrackets.openingClosing + '|' + this.options.setBrackets.closingOpening + this.options.listPrefix + index + this.options.setBrackets.closingClosing, 'g'), '');

            // if (index=='sharing') //console.log('4. listTemplateStripped regex: ' + this.options.setBrackets.openingOpening + this.options.listPrefix + index + this.options.setBrackets.openingClosing + '|' + this.options.setBrackets.closingOpening + this.options.listPrefix + index + this.options.setBrackets.closingClosing);
            // if (index=='sharing') //console.log('5. listTemplateStripped: ' + listTemplateStripped);

            // for each list item, run makeListItem and add to result string

            var listString = '';

            for (subindex in listItemData) {
              //if (index=='sharing') //console.log('6. subindex: ' + subindex);
              //if (index=='sharing') //console.log(listItemData);
              listString = listString + this.processItem(listItemData[subindex], listItemTemplateStripped);
            }

            // if (index=='sharing')  //console.log('7. listString: ' + listString);

            listTemplateStripped = listTemplateStripped.replace(new RegExp(listItemTemplate, 'g'), listString);

            // if (index=='sharing') //console.log('8. new listItemStripped: ' + listTemplateStripped);
            
            itemHtml = itemHtml.substr(0,listTemplateIndex) + listTemplateStripped + itemHtml.substr(listTemplateIndex+listTemplate.length);
          }

        }
      }

      // process values
      if (typeof itemData.values != 'undefined') for (index in itemData.values) {
        value = itemData.values[index];

        simpleRegex = new RegExp(this.options.varBrackets.opening + index + this.options.varBrackets.closing, 'g');

        itemHtml = itemHtml.replace(simpleRegex, value);
      }

      // process optionals
      if (typeof itemData.optionals != 'undefined') for (index in itemData.optionals) {
        value = itemData.optionals[index]; 

        if (value === false) { // optional is not set, section needs to be removed

          optionalRegex = new RegExp(this.options.setBrackets.openingOpening + this.options.optionalPrefix + index + this.options.setBrackets.openingClosing + '.+' + this.options.setBrackets.closingOpening + this.options.optionalPrefix + index + this.options.setBrackets.closingClosing, 'g');
          itemHtml = itemHtml.replace(optionalRegex, '');

        } else {
          simpleRegex = new RegExp(this.options.varBrackets.opening + index + this.options.varBrackets.closing, 'g');

          itemHtml = itemHtml.replace(simpleRegex, value);

          optionalRegex = new RegExp(this.options.setBrackets.openingOpening + this.options.optionalPrefix + index + this.options.setBrackets.openingClosing+ '|' + this.options.setBrackets.closingOpening + this.options.optionalPrefix + index + this.options.setBrackets.closingClosing, 'g');
          itemHtml = itemHtml.replace(optionalRegex, '');
        }
      }

      return itemHtml;
    };

    this.init(templates, options);
  };













  if (typeof window.jQuery == 'undefined' || window.jQuery.fn.jquery !== '1.7.1') {

    var script_tag = document.createElement('script');
    
    script_tag.setAttribute("type", "text/javascript");
    script_tag.setAttribute("src", "http://ajax.googleapis.com/ajax/libs/jquery/1.4.2/jquery.min.js");

    if (script_tag.readyState) {
      
      script_tag.onreadystatechange = function () { // For old versions of IE
        
        if (this.readyState == 'complete' || this.readyState == 'loaded') scriptLoadHandler();
        
      };

    } else { // Other browsers
      
      script_tag.onload = scriptLoadHandler;
    
    }
    // Try to find the head, otherwise default to the documentElement
    (document.getElementsByTagName("head")[0] || document.documentElement).appendChild(script_tag);

  } else {
    
    jQuery = window.jQuery;

    main();

  }


  function scriptLoadHandler() {
    
    // Restore $ and window.jQuery to their previous values and store the
    // new jQuery in our local jQuery variable
    jQuery = window.jQuery.noConflict(true);

    // Call our main function
    main();
  }


  var programWidget = function(dom, options) {

    this.init = function(dom){

      this.domClass = dom.substr(1);
      
      this.elem = jQuery(dom);

      if (this.options.test) {
        
        this.options.link = this.options.testLink;
        this.options.defaultCssPath = this.options.defaultTestCssPath;

      }

      this.qClient = new queryClient(this.options.link, {
        jsonp: true,
        jQuery: jQuery,
        onResponse: jQuery.proxy(this.onProgramReceive, this)
      });

      this.htmlizer = new htmlizer(this.options.templates, {jQuery: jQuery});

      this.elem.each(jQuery.proxy(function(index, item){

        this.fetchProgram(index);

      }, this));

    };

    this.fetchProgram = function(index) {

      if (!this.elem.eq(index).hasClass(this.domClass)) return;

      this.elem.eq(index).removeClass(this.domClass); // won't execute twice
      
      // extract slug from url, put in queryClient, fetch data.

      var link = jQuery('a.cibul-pw-link', this.elem).eq(index).attr('href');

      if (link.indexOf('/program/')==-1) {
        if (link.indexOf('/openagenda.com/')==-1) return;
        var offset = link.indexOf('/openagenda.com/') + '/openagenda.com/'.length;
      } else {
        var offset = link.indexOf('/program/') + '/program/'.length;
      }

      var end = link.indexOf('/', offset);

      if (end == -1) {
        var slug = link.substr(offset);
      } else {
        var slug = link.substr(offset, end - offset);
      }

      if (!slug.length) return;

      // extract language from url

      var sf_culture = 'fr';

      if (end != -1) sf_culture = link.substr(end +1,2);


      // do this when the qClient is ready only

      if (!this.qClient.isLoading()) {

        this.loadClient(jQuery.extend({index: index, slug: slug, sf_culture: sf_culture }, link.getUrlParameters()));

        // get the query client ready

        this.qClient.getData();
      
      } else {

        this.qClient.addLoadingDoneCallback(jQuery.proxy(function(){

          this.loadClient(jQuery.extend({index: index, slug: slug, sf_culture: sf_culture }, link.getUrlParameters()));
          
          this.qClient.getData();

        }, this));

      }

    };

    this.loadClient = function(parameters) {
      
      this.qClient.resetParameters();

      this.qClient.setParameters(parameters);

    };

    this.onProgramReceive = function(programData) {

      if (programData.success) {

        var html = '';

        if (!programData.noHeader) html = html + this.htmlizer.processItem(programData['data']['review'], this.options.templates.review);
        
        this.htmlizer.processList(programData['data']['articles']);

        html = html + this.htmlizer.getHtml();

        html = html + '<div class="cibul-footer"><a href="http://openagenda.com">powered by <img alt="cibul" src="https://s3-eu-west-1.amazonaws.com/cibulstatic/verysmalllogo.png"/></a></div>';

        html = html.replace(/<a/g,'<a target="_blank" ');

        if (this.options.test) {
          
          html = html.replace(/\/\/cibultest/g, 'http://cibul'); // for template sake

        } else {

          html = html.replace(/"\/\//g, '"http:\/\/');

        }
                   
        if (programData.customClass) {
          
          html = '<div class="' + programData.customClass + '">' + html + '</div>';
        
        } else {

          this.addDefaultStylesheet();
          
          html = '<div class="' + this.options.defaultClass + '">' + html + '</div>';

        }

        // pop out any image that has a cibul local image as reference
        
        this.elem.eq(programData.index).replaceWith(html.replace(/<img([^<]*?(src="\/image(.*?(>))))/g, ''));

      }

    };

    this.addDefaultStylesheet = function() {

      if (!document.getElementById(this.options.defaultClass)) {
      
        var head  = document.getElementsByTagName('head')[0];
        var link  = document.createElement('link');
        link.id   = this.options.defaultClass;
        link.rel  = 'stylesheet';
        link.type = 'text/css';
        link.href = this.options.defaultCssPath;
        link.media = 'all';
        head.appendChild(link);
      }

    };

    this.options = jQuery.extend({
      test: false,
      link: 'http://openagenda.com/api/programwidget',
      testLink: 'http://d.openagenda.com/frontend_dev.php/api/programwidget',
      defaultClass: 'cibul-program-widget',
      defaultCssPath: 'http://s3-eu-west-1.amazonaws.com/cibulstatic/cibul-program-widget.css',
      defaultTestCssPath: 'cibul-program-widget.css'
    }, options);

    this.init(dom);
  };

})();