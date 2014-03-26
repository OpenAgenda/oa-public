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

    canvasElem._removeChild = canvasElem.removeChild;

    canvasElem.removeChild = function(child) { self.removeChild(child); };

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

    this.cCount = this.evaluateColumnCount();

    if (!this.cCount) this.cCount = 1;

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

      newCount = this.evaluateColumnCount();

      if (newCount && (newCount !== this.cCount)) {

        this.cCount = newCount;

        this.updateColumns();

      }

    },

    appendChild: function(child) {

      this.elems.push(child);

      if (!this.columns.length) this.updateColumns();

      this.appendToColumns(this.columns, [child]);

    },

    prependChild: function(child) {

      this.elems.splice(0, 0, child);

      this.prependToColumns(this.columns, [child]);

    },

    // remove all elems of column before popping it out as well

    removeChild: function(child) {

      if (this.columns) for (var i = this.columns.length - 1; i >= 0; i--) {
        if (this.columns[i]==child) {
          
          var elem = childObject(this.columns[i],0);

          while (elem) {

            for (var j = this.elems.length - 1; j >= 0; j--) {
              if (this.elems[j]==elem) {
                this.elems.splice(j, 1);
                break;
              }
            }

            this.columns[i].removeChild(elem);

            elem = childObject(this.columns[i],0);

          }

          this.columns.splice(i, 1);

          break;
        }
      }

      this.canvasElem._removeChild(child);

    },

    createColumns: function(count) {

      if (count > 100) throw 'Too many columns: ' + count;

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

      var refElem = this.getRefElem();

      if (!refElem) return 0;
      
      var width = refElem.offsetWidth;

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

    },

    evaluateColumnCount: function() {

      var width = this.getWidth(),

      canvasWidth = this.getCanvasInnerWidth();

      if (width === 0) return false;

      return Math.floor(canvasWidth/width);

    }

  };

  window.Flowinate = Flowinate;

})();