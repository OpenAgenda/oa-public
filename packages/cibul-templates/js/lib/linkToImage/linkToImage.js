var linkToImage = function(linkElem, options) {

  var href = linkElem.getAttribute('href');

  if (!href) return;

  if (!href.match(/(.jpg|.png|.bmp|.jpeg|.gif)$/)) return;

  var imgElem = document.createElement('img');

  imgElem.onload = function() {

    linkElem.style.display = 'block';
    linkElem.style.textAlign = 'center';

    if (imgElem.width > linkElem.offsetWidth) imgElem.style.width = '100%';

    linkElem.innerHTML = '';

    linkElem.appendChild(imgElem);

    if (options.onComplete) options.onComplete(linkElem);

  };

  imgElem.setAttribute('src', href);

}