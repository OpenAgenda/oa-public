(function(){

  var Flowinate = function(canvasElem, options) {

    var self = this,
    i=0,
    elem;

    this.params = extend({
      sectionElemClass: false // in case section elements should break the flow
    }, options);

    this.canvasElem = canvasElem;

    this.canvasTag = this.canvasElem.nodeName.toLowerCase();

    // external scripts may use 'appendChild' of canvas element to add list items
    // flowinate provides that method for the canvas

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

    // reference array of all list elements handled by the script
    this.elems = [];

    // reference array of section list elements
    this.sectionElems = [];
    
    // initialize script by adding children to reference array
    while (elem = childObject(canvasElem, i++)) {

      this.elems.push(elem);

      if (this.params.sectionElemClass && hasClass(elem, this.params.sectionElemClass)) this.sectionElems.push(elem);

    }

    this.canvasWidth = this.getCanvasInnerWidth();
    this.canvasHeight = this.canvasElem.offsetHeight;

    this.cCount = this.evaluateColumnCount();

    if (!this.cCount) this.cCount = 1;

    this.updateColumnSets();

    addEvent(window, 'resize', function() {

      self.onWidthChange();

    });


  };

  Flowinate.prototype = {

    refresh: function() {

      this.updateColumnSets();
      
    },

    updateColumnSets: function() {

      // create new column sets
      
      var columnSets = [];

      // clear any element that is not on page anymore (has been removed since last refresh)
      for (var i = this.elems.length - 1; i >= 0; i--)
        if (this.elems[i].parentNode===null)
          this.elems.splice(i, 1);

      // append all list items to new column sets
      this.appendTo(this.elems, columnSets);
      
      this.removeColumnSets();

      this.columnSets = columnSets;

    },

    removeColumnSets: function() {

      if (typeof this.columnSets == 'undefined') return;

      var columnSet = this.columnSets.pop();

      while (typeof columnSet !== 'undefined') {

        while (columnSet.length) {
          
          var column = columnSet.pop();

          column.parentNode.removeChild(column);

        }

        columnSet = this.columnSets.pop();

      }

    },

    onWidthChange: function() {
      // if count changed, need to update

      var self = this,

      newCount = this.evaluateColumnCount();

      if (newCount && (newCount !== this.cCount)) {

        this.cCount = newCount;

        this.updateColumnSets();

      }

    },


    /**
     * append child to canvas element
     */
    
    appendChild: function(child) {

      this.elems.push(child);

      if (!this.columnSets.length) this.updateColumnSets();

      this.appendTo([child]);

    },

    prependChild: function(child) {

      this.elems.splice(0, 0, child);

      if (!this.columnSets.length) this.updateColumnSets();

      this.prependTo([child]);

    },

    columnChild: function(column, index) {

      var columnCanvas = column;

      if (this.canvasTag=='ul') columnCanvas = el(column, 'ul');

      return childObject(columnCanvas,index);

    },

    // remove all elems of column before popping it out as well

    removeChild: function(child) {

      // if child is a column, all column children should be removed.

      if (this.columnSets) for (var i = this.columnSets.length - 1; i >= 0; i--) {
        for (var j = this.columnSets[i].length - 1; j >= 0; j--) {
          
          if (this.columnSets[i][j]==child) {
            

            var elem = this.columnChild(this.columnSets[i][j], 0);

            while (elem) {

              for (var k= this.elems.length - 1; k >= 0; k--) {
                if (this.elems[k]==elem) {
                  this.elems.splice(k, 1);
                  break;
                }
              }

              (this.canvasTag=='ul'?el(this.columnSets[i][j], 'ul'):this.columnSets[i][j]).removeChild(elem);

              elem = this.columnChild(this.columnSets[i][j], 0);

            }

            // all children of column where removed, column can now be removed.

            this.columnSets[i].splice(j, 1);

            if (!this.columnSets[i].length) this.columnSets.splice(i, 1);

            break;
            break;

          }
        }
      }

      this.canvasElem._removeChild(child);

    },


    /**
     * create a column set
     */

    createColumnSet: function(prepend) {

      if (typeof prepend == 'undefined') var prepend = false;

      var count = this.cCount;

      if (count > 100) throw 'Too many columns: ' + count;

      // create columns

      var columns = [];

      for (var i =0; i < count; i++) {

        var colElem = document.createElement(this.canvasTag=='ul'?'li':'div');
        
        extend(colElem.style, {
          display: 'inline-block',
          verticalAlign: 'top'
        });

        // if col is li item, it will need a ul subitem to shove in the elements
        if (this.canvasTag=='ul') colElem.innerHTML = '<ul></ul>';

        columns.push(colElem);

        if (prepend) {

          this.canvasElem._insertAdjacentElement('afterbegin', colElem);

        } else {

          this.canvasElem._appendChild(colElem);

        }

      }

      return columns;

    },


    /**
     * loop through list elements, assign them to column sets when applicable and add them to canvas
     */

    appendTo: function(elems, columnSets) {

      if (typeof columnSets == 'undefined') columnSets = this.columnSets;

      for (var i = 0; i < elems.length; i++) {

        if (this.isSectionElem(elems[i])) {

          this.canvasElem._appendChild(elems[i]);

        } else {

          var followingElem = this.elems[this.elems.length-(elems.length-i)-1];

          if (!columnSets.length || (followingElem && this.isSectionElem(followingElem))) {
            columnSets.push(this.createColumnSet());
          }


          var column = this.getSmallestColumn(this.getLastColumnSet(columnSets));

          elems[i].style.display = 'block';

          column.appendChild(elems[i]);

        }

      }

    },


    /**
     * loop through list elements, add them to column sets when applicable and set at beginning of canvas
     */

    prependTo: function(elems, columnSets) {

      if (typeof columnSets == 'undefined') columnSets = this.columnSets;

      for (var i = elems.length - 1; i >= 0; i--) {

        // this is a section element
        if (this.isSectionElem(elems[i])) {

          this.canvasElem._insertAdjacentElement('afterbegin', elems[i]);

        } else {

          if (!columnSets.length || this.isSectionElem(this.elems[i+1])) columnSets.splice(0, 0, this.createColumnSet(true));

          var column = this.getSmallestColumn(columnSets[0]);

          elems[i].style.display = 'block';

          column.insertAdjacentElement('afterbegin', elems[i]);

        }
        
      }

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

      // when list items are li, they must be put in the ul of the column
      return (this.canvasTag=='ul'?el(chosenColumn, 'ul'):chosenColumn);

    },

    getLastColumnSet: function(columnSets) {

      if (typeof columnSets == 'undefined') columnSets = this.columnSets;

      return columnSets[columnSets.length-1];

    },

    isSectionElem: function(elem) {

      return this.params.sectionElemClass && hasClass(elem, this.params.sectionElemClass);

    },


    /**
     * get width of regular (non-section) list item
     */

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


    /**
     * get the canvas width once padding has been stripped
     */

    getCanvasInnerWidth: function() {
      
      var width = this.canvasElem.offsetWidth,
      
      self = this;

      forEach(['paddingLeft', 'paddingRight'], function(style) {
        var computedStyle = (window.getComputedStyle?window.getComputedStyle(self.canvasElem):self.canvasElem.currentStyle)[style];
        if (computedStyle.length) width -= parseInt(computedStyle, 10);
      });

      return width;

    },

    // get reference elem.. pick the first one which is not a section.
    getRefElem: function() {

      // sections are not used
      if (!this.params.sectionElemClass) return this.elems.length?this.elems[0]:false;

      // sections are used, pick first which is not a section
      for (var i = 0; i < this.elems.length; i++)
        if (!hasClass(this.elems[i], this.params.sectionElemClass))
          return this.elems[i];

      // there are no elements which are not a section
      return false;

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