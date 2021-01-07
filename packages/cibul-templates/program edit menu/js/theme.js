function iframeSubmit(formElems, callback) {

  if (typeof formElems.nodeType != 'undefined') formElems = [formElems]

  var callbackName = 'iframe' + Math.ceil(Math.random()*10000);

  forEach(formElems, function(formElem) {
    formElem.setAttribute('enctype', 'multipart/form-data');
    formElem.setAttribute('target', callbackName);
    var attribute = formElem.getAttribute('action')===null?'href':'action';
    formElem.setAttribute(attribute, formElem.getAttribute(attribute).addUrlParameter('callback', callbackName));
  });

  var iframe = document.createElement('iframe');
  iframe.setAttribute('name', callbackName);
  iframe.style.display = 'none';

  formElems[0].parentNode.appendChild(iframe);

  window[callbackName] = callback;

};

function applyTheme(mainElem, themeDivClass, themeSettings, params) {

  params = extend({
    imageRoot: false,
    backgroundRemoveClass: false,
    backgroundColorIndicatorClass: false
  }, params);

  if (typeof themeSettings == 'undefined') themeSettings = {};

  if (!params.imageRoot) return;

  var themeDiv = getElementsByClassName(document, themeDivClass);

  if (!themeDiv.length) {
    var themeDiv = document.createElement('div');
    themeDiv.className = themeDivClass;
    mainElem.parentNode.insertBefore(themeDiv, mainElem);
  } else {
    themeDiv = themeDiv[0];
  }

  if (themeSettings.image) {
    themeDiv.style.backgroundImage = 'url(\'' + params.imageRoot + themeSettings.image + '?' + themeSettings.suffix + '\')';
    if (params.backgroundRemoveClass) removeClass(getElementsByClassName(document, params.backgroundRemoveClass)[0], 'display-none');
  } else {
    themeDiv.style.backgroundImage = '';
    if (params.backgroundRemoveClass) addClass(getElementsByClassName(document, params.backgroundRemoveClass)[0], 'display-none');
  }

  if (themeSettings.anchorage) {
    themeDiv.style.backgroundPosition =  {left: '0 0', center: '50% 0', right: '100% 0'}[themeSettings.anchorage];
  } else {
    themeDiv.style.backgroundPosition = '0 0';
  }

  if (themeSettings.repeat) {
    themeDiv.style.backgroundRepeat = themeSettings.repeat=='repeat'?'repeat':'no-repeat';
  } else {
    themeDiv.style.backgroundRepeat = 'no-repeat';
  }

  if (themeSettings.canvasposition) {
    mainElem.style.textAlign = themeSettings.canvasposition;
    mainElem.style.marginLeft = 'auto';
    mainElem.style.marginRight = 'auto';
    if (themeSettings.canvasposition=='left') {
      mainElem.style.marginLeft = '60px';
    } else if (themeSettings.canvasposition=='right') {
      mainElem.style.marginRight = '60px';
    }
    
  }

  var colorIndicator = params.backgroundColorIndicatorClass?getElementsByClassName(document, params.backgroundColorIndicatorClass)[0]:false;

  if (themeSettings.bgcolor) {
    themeDiv.style.backgroundColor = themeSettings.bgcolor;
    if (colorIndicator) colorIndicator.style.backgroundColor = themeSettings.bgcolor;
  } else {
    themeDiv.style.backgroundColor = 'transparent';
    if (colorIndicator) colorIndicator.style.backgroundColor = 'transparent';
  }

  if (themeSettings.offset) {
    mainElem.style.marginTop = themeSettings.offset + 'px';
  } else {
    mainElem.style.marginTop = '';
  }

  // go through settings and apply rules

};