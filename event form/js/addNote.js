var addNote = function(canvas, content, options) {

  options = extend({
    className: false,
    position: 'beforeend',
    tag: 'p'
  }, typeof options=='undefined'?{}:options);

  var noteElem = document.createElement(options.tag);

  noteElem.innerHTML = content;

  canvas.insertAdjacentElement(options.position, noteElem);

};