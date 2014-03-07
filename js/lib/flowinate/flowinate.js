(function(){

  var Flowinate = function(canvasElem) {

    var self = this,
    i=0,
    elem;

    this.canvasElem = canvasElem;

    // use appendChild of canvas elem to add elements to it
    // use insertAdjacentElement of canvas element to prepend to it

    canvasElem._appendChild = canvasElem.appendChild;

    canvasElem.appendChild = function(child) { self.appendChild(child); };

    canvasElem._insertAdjacentElement = canvasElem.insertAdjacentElement;

    canvasElem.insertAdjacentElement = function(where, what) {
      if (where == 'afterbegin')
        self.prependChild(what);
      else if (where == 'beforeend')
        self.appendChild(what);
      else
        canvasElem._insertAdjacentElement(where, what);
    };

    this.elems = [];
    
    while (elem = childObject(canvasElem, i++)) {
      this.elems.push(elem);
    }

    this.canvasWidth = this.getCanvasInnerWidth();
    this.canvasHeight = this.canvasElem.offsetHeight;

    this.cCount = Math.floor(this.getCanvasInnerWidth()/this.getWidth());

    this.updateColumns();

    addEvent(window, 'resize', function() {
      self.onWidthChange();
    });


  };

  Flowinate.prototype = {

    updateColumns: function() {

      var self = this,
      
      columns = this.createColumns(this.cCount);

      forEach(columns, function(column) {
        self.canvasElem._appendChild(column);
      });

      this.appendToColumns(columns, this.elems);

      if (this.columns) forEach(this.columns, function(column) {
        column.parentNode.removeChild(column);
      });

      this.columns = columns;

    },

    onWidthChange: function() {
      // if count changed, need to update

      var self = this,
      newCount = Math.floor(this.getCanvasInnerWidth()/this.getWidth());

      if (newCount != this.cCount) {

        this.cCount = newCount;

        this.updateColumns();

      }

    },

    appendChild: function(child) {

      this.elems.push(child);

      this.appendToColumns(this.columns, [child]);

    },

    prependChild: function(child) {

      this.elems.splice(0, 0, child);

      this.prependToColumns(this.columns, [child]);

    },

    createColumns: function(count) {

      // create columns

      var columns = [];

      for (var i =0; i < count; i++) {
        var colElem = document.createElement('div');
        
        extend(colElem.style, {
          display: 'inline-block',
          verticalAlign: 'top'
        });

        columns.push(colElem);
      }

      return columns;

    },

    appendToColumns: function(columns, elems) {

      var self = this;

      forEach(elems, function(elem) {

        var column = self.getSmallestColumn(columns);

        elem.style.display = 'block';

        column.appendChild(elem);

      });

    },

    prependToColumns: function(columns, elems) {
      var self = this;

      forEach(elems, function(elem) {

        var column = self.getSmallestColumn(columns);

        elem.style.display = 'block';
        column.insertAdjacentElement('afterbegin', elem);

      });
    },

    getSmallestColumn: function(columns) {
      var minHeight = false,
      chosenColumn;

      forEach(columns, function(column) {
        if (minHeight===false || column.offsetHeight < minHeight) {
          minHeight = column.offsetHeight;
          chosenColumn = column;
        }
      });

      return chosenColumn;
    },

    getWidth: function() {

      var refElem = this.getRefElem(),
      
      width = refElem.offsetWidth;

      forEach(['marginLeft', 'marginRight'], function(style){
        var computedStyle = (window.getComputedStyle?window.getComputedStyle(refElem):refElem.currentStyle)[style];
        if (computedStyle.length) width += parseInt(computedStyle, 10);
      });

      return width;
    },

    getCanvasInnerWidth: function() {
      
      var width = this.canvasElem.offsetWidth,
      
      self = this;

      forEach(['paddingLeft', 'paddingRight'], function(style) {
        var computedStyle = (window.getComputedStyle?window.getComputedStyle(self.canvasElem):self.canvasElem.currentStyle)[style];
        if (computedStyle.length) width -= parseInt(computedStyle, 10);
      });

      return width;

    },

    // get reference elem.. pick the first one.
    getRefElem: function() {

      return this.elems.length?this.elems[0]:false;

    }

  };

  window.Flowinate = Flowinate;

})();