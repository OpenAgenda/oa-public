var handleLanguages = function(options) {

	var langs = [],

	run = function() {

		_extractLangs();

		// remove language menu if there is only 1 language
		if (langs.length <= 1) return options.tabsElem.parentNode.removeChild(options.tabsElem);

		_createSelectMenu();

		_addMenuClickBehavior(function(lang) {
			
			_toggleContentDisplay(lang);

		});

		if ( typeof options.defaultLang !== 'undefined' ) _toggleContentDisplay( options.defaultLang );

		handleContextMenu(getElementsByClassName(document, 'js_lang_select')[0], getElementsByClassName(document, 'js_language_menu')[0], sEventHandler.getInstance());
	},

	_extractLangs = function() {

		forEach(options.contentElems, function(contentElem) {

			var lang = contentElem.getAttribute('data-lang');

			if (!contains(langs, lang)) langs.push(lang);
			
		});

	},

	_createSelectMenu = function() {

		var tabData = [];

		forEach(langs, function(lang) {
			tabData.push({label: options.labels[lang], active: false});
		});

		tabData[0].active = true;

		var ejs = new EJS({ text: options.template });

		options.tabsElem.innerHTML = ejs.render({tabs: tabData});

	},

	_addMenuClickBehavior = function(callback) {

		var liItems = options.tabsElem.getElementsByTagName('li');

		forEach(liItems, function(li) {
			addEvent(li, 'click', function() {
				callback(langs[getChildIndex(li)]);
				
				if (options.onClick) options.onClick();

				forEach(liItems, function(liItem) { removeClass(liItem, 'active')});

				addClass(li, 'active');

			});
		});
	},

	_toggleContentDisplay = function(lang) {

		forEach(options.contentElems, function(contentElem) {

			(contentElem.getAttribute('data-lang') == lang?removeClass:addClass)(contentElem, 'disabled');

		});

	};

	run();

}