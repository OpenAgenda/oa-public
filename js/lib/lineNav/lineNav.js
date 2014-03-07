(function(w,d){

  var lineNav = function(elem, options){

    var self = this
      , initStep = 0;

    this.options = extend({
      step: false,
      offset: false,
      nav: {previous: '&lt;', next: '&gt;'},
      classes: { previous: 'lineprev', next: 'linenext', canvas: 'linecanvas', strip: 'linestrip' }
    }, options);

    this.createCanvas(elem);

    this.setCanvasWidth(elem);

    this.mapSteps();

    if (this.options.step !== false)
      initStep = this.options.step;
    else
      if (this.options.offset !== false)
        initStep = this.findStepFromOffset(this.options.offset);

    this.positionStrip(initStep);

    addEvent(this.elems.previous, 'click', function(){
      self.positionStrip(self.step-1);
    });

    addEvent(this.elems.next, 'click', function(){
      self.positionStrip(self.step+1);
    });

    addEvent(window, 'resize', function() {
      self.setCanvasWidth(elem);
      self.mapSteps();
      self.positionStrip();
    });

  };

  extend(lineNav.prototype, {
    createCanvas: function(elem) {

      var canvas = d.createElement('div')
        , strip = d.createElement('div')
        , previous = d.createElement('div')
        , next = d.createElement('div')
        , i = 0
        , size = 0
        ;

      // append all child elements to strip and fix strip height on tallest child

      while (elem.childNodes.length) {
        if (elem.childNodes[0].nodeType==1) {
          var childSize = elem.childNodes[0].offsetHeight;
          forEach(['paddingTop', 'paddingBottom'], function(style){
            var computedStyle = (window.getComputedStyle?window.getComputedStyle(elem.childNodes[0]):elem.childNodes[0].currentStyle)[style];
            
            if (computedStyle.length) childSize += parseInt(computedStyle,10);
          });
          if (childSize > size) size = childSize;
          strip.appendChild(elem.childNodes[0]);
        } else {
          elem.removeChild(elem.childNodes[0]);
        }
        i++;
      }

      extend(strip.style, {
        height: size + 'px',
        width: '9999px',
        position: 'absolute'
      });

      // apply element classes and stick navigation markup

      addClass(strip, this.options.classes.strip);
      addClass(canvas, this.options.classes.canvas);
      addClass(next, this.options.classes.next);
      addClass(previous, this.options.classes.previous);

      previous.innerHTML = this.options.nav.previous;
      next.innerHTML = this.options.nav.next;

      // adjust default display styles and stick nav and canvas elements to page

      previous.style.display = next.style.display = canvas.style.display = 'inline-block';
      next.style.visibility = previous.style.visibility = 'hidden';
      next.style.verticalAlign = previous.style.verticalAlign = 'middle';

      elem.appendChild(previous);
      elem.appendChild(canvas);
      elem.appendChild(next);

      extend(canvas.style, {
        height: size + 'px',
        position: 'relative',
        overflow: 'hidden',
        verticalAlign: 'middle'
      });

      canvas.appendChild(strip);

      // keep track of elements for later use

      this.elems = {
        canvas: canvas,
        strip: strip,
        previous: previous,
        next: next
      };

    },
    setCanvasWidth: function(elem) {
      this.elems.canvas.style.width = Math.max(0,(elem.offsetWidth - this.elems.previous.offsetWidth - this.elems.next.offsetWidth -1)) + 'px';
    },


    // map section steps with section start elements (offset indexes by step)
    mapSteps: function() {

      var cursor = 1
        , refWidth = this.elems.canvas.offsetWidth
        , steps = [0]
        , self = this;

      forEach(this.elems.strip.childNodes, function(child) {

        if (child.offsetLeft + self.getChildWidth(child) > refWidth*cursor) {
          cursor++;
          steps.push(getChildIndex(child));
        }

      });

      // if there is a pre exisiting steps array, should re-adjust it here
      // according to first displayed child (current offset)

      if (this.steps && this.step) {
        var currentOffset = this.steps[this.step];

        for (var i=0; i<steps.length; i++) {
          if (steps[i] > currentOffset) {
            this.step = i-1;
            break;
          }
        }
      }

      this.steps = steps;

    },

    findStepFromOffset: function(offset) {

      for (var i=0;i<this.steps.length; i++) {
        if (this.steps[i] <= offset) {
          if (i==this.steps.length-1) return i;
          if (this.steps[i+1] > offset) return i;
        }
      }

      return 0;

    },

    // position strip to defined step
    // offset position is calculated based on length of child elements

    positionStrip: function(step) {

      if (step!==undefined) this.step = step;

      var i = 0
        , count = 0
        , left = 0
        , elem = this.elems.strip
        , offset = this.steps[this.step];

      while(count<offset) {

        left += this.getChildWidth(elem.childNodes[i], true);

        if (elem.childNodes[i].nodeType==1) {
          count++;
          elem.childNodes[i].style.visibility = 'visible';
        }

        i++;
      }

      this.elems.strip.style.left = '-' + left + 'px';

      // elements overflowing over canvas width should be hidden
      // left + width of canvas

      var limitWidth = this.elems.canvas.offsetWidth;

      while(i<elem.childNodes.length) {
        limitWidth -= this.getChildWidth(elem.childNodes[i], true);

        if (elem.childNodes[i].nodeType==1)
          elem.childNodes[i].style.visibility = limitWidth<0?'hidden':'visible';

        i++; 
      }

      this.elems.next.style.visibility = this.step<this.steps.length-1?'visible':'hidden';
      
      this.elems.previous.style.visibility = this.step?'visible':'hidden';
      

    },
    getChildWidth: function(child, includeMargin) {
      if (includeMargin===undefined) includeMargin = false;

      var width = child.offsetWidth;

      if (includeMargin) if (child.nodeType==1) {
        forEach(['marginLeft', 'marginRight'], function(style){
          var computedStyle = (window.getComputedStyle?window.getComputedStyle(child):child.currentStyle)[style];
          if (computedStyle.length) width += parseInt(computedStyle, 10);
        });
      }

      return width;
    }
  });

  w.lineNav = lineNav;

})(window, document);

function makeLineNavs(elements, options) {

  var lineNavs = [];

  forEach(elements, function(element) {

    lineNavs.push(new lineNav(element, options));

  });

  return lineNavs;

};