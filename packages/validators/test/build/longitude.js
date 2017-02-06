"use strict"; // ES5

var utils = require('utils');

module.exports = function (config) {

  var params = utils.extend({
    field: false,
    optional: true
  }, config || {});

  return utils.extend(validate, {
    field: params.field,
    type: 'longitude'
  });

  function validate(value) {

    var clean = parseFloat(value);

    if (isNaN(clean)) {

      throw [{
        field: params.field,
        code: 'longitude.invalid',
        message: 'not a number',
        origin: value
      }];
    }

    if (clean < -180) {

      throw [{
        field: params.field,
        code: 'longitude.toosmall',
        message: 'longitude cannot be less than -180',
        origin: value
      }];
    }

    if (clean > 180) {

      throw [{
        field: params.field,
        code: 'longitude.toobig',
        message: 'longitude cannot be more than 180',
        origin: value
      }];
    }

    return clean;
  }
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9sb25naXR1ZGUuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsYSxDQUFjOztBQUVkLElBQUksUUFBUSxRQUFTLE9BQVQsQ0FBWjs7QUFFQSxPQUFPLE9BQVAsR0FBaUIsVUFBVSxNQUFWLEVBQW1COztBQUVsQyxNQUFJLFNBQVMsTUFBTSxNQUFOLENBQWM7QUFDekIsV0FBTyxLQURrQjtBQUV6QixjQUFVO0FBRmUsR0FBZCxFQUdWLFVBQVUsRUFIQSxDQUFiOztBQUtBLFNBQU8sTUFBTSxNQUFOLENBQWMsUUFBZCxFQUF3QjtBQUM3QixXQUFPLE9BQU8sS0FEZTtBQUU3QixVQUFNO0FBRnVCLEdBQXhCLENBQVA7O0FBS0EsV0FBUyxRQUFULENBQW1CLEtBQW5CLEVBQTJCOztBQUV6QixRQUFJLFFBQVEsV0FBWSxLQUFaLENBQVo7O0FBRUEsUUFBSyxNQUFPLEtBQVAsQ0FBTCxFQUFzQjs7QUFFcEIsWUFBTSxDQUFFO0FBQ04sZUFBTyxPQUFPLEtBRFI7QUFFTixjQUFNLG1CQUZBO0FBR04saUJBQVMsY0FISDtBQUlOLGdCQUFRO0FBSkYsT0FBRixDQUFOO0FBT0Q7O0FBRUQsUUFBSyxRQUFRLENBQUMsR0FBZCxFQUFvQjs7QUFFbEIsWUFBTSxDQUFFO0FBQ04sZUFBTyxPQUFPLEtBRFI7QUFFTixjQUFNLG9CQUZBO0FBR04saUJBQVMsb0NBSEg7QUFJTixnQkFBUTtBQUpGLE9BQUYsQ0FBTjtBQU9EOztBQUVELFFBQUssUUFBUSxHQUFiLEVBQW1COztBQUVqQixZQUFNLENBQUU7QUFDTixlQUFPLE9BQU8sS0FEUjtBQUVOLGNBQU0sa0JBRkE7QUFHTixpQkFBUyxtQ0FISDtBQUlOLGdCQUFRO0FBSkYsT0FBRixDQUFOO0FBT0Q7O0FBRUQsV0FBTyxLQUFQO0FBRUQ7QUFFRixDQXJERCIsImZpbGUiOiJsb25naXR1ZGUuanMiLCJzb3VyY2VzQ29udGVudCI6WyJcInVzZSBzdHJpY3RcIjsgLy8gRVM1XG5cbnZhciB1dGlscyA9IHJlcXVpcmUoICd1dGlscycgKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiggY29uZmlnICkge1xuXG4gIHZhciBwYXJhbXMgPSB1dGlscy5leHRlbmQoIHtcbiAgICBmaWVsZDogZmFsc2UsIFxuICAgIG9wdGlvbmFsOiB0cnVlXG4gIH0sIGNvbmZpZyB8fCB7fSApO1xuXG4gIHJldHVybiB1dGlscy5leHRlbmQoIHZhbGlkYXRlLCB7XG4gICAgZmllbGQ6IHBhcmFtcy5maWVsZCxcbiAgICB0eXBlOiAnbG9uZ2l0dWRlJ1xuICB9ICk7XG5cbiAgZnVuY3Rpb24gdmFsaWRhdGUoIHZhbHVlICkge1xuXG4gICAgdmFyIGNsZWFuID0gcGFyc2VGbG9hdCggdmFsdWUgKTtcblxuICAgIGlmICggaXNOYU4oIGNsZWFuICkgKSB7XG5cbiAgICAgIHRocm93IFsge1xuICAgICAgICBmaWVsZDogcGFyYW1zLmZpZWxkLFxuICAgICAgICBjb2RlOiAnbG9uZ2l0dWRlLmludmFsaWQnLFxuICAgICAgICBtZXNzYWdlOiAnbm90IGEgbnVtYmVyJyxcbiAgICAgICAgb3JpZ2luOiB2YWx1ZVxuICAgICAgfSBdO1xuXG4gICAgfVxuXG4gICAgaWYgKCBjbGVhbiA8IC0xODAgKSB7XG5cbiAgICAgIHRocm93IFsge1xuICAgICAgICBmaWVsZDogcGFyYW1zLmZpZWxkLFxuICAgICAgICBjb2RlOiAnbG9uZ2l0dWRlLnRvb3NtYWxsJyxcbiAgICAgICAgbWVzc2FnZTogJ2xvbmdpdHVkZSBjYW5ub3QgYmUgbGVzcyB0aGFuIC0xODAnLFxuICAgICAgICBvcmlnaW46IHZhbHVlXG4gICAgICB9IF1cblxuICAgIH1cblxuICAgIGlmICggY2xlYW4gPiAxODAgKSB7XG5cbiAgICAgIHRocm93IFsge1xuICAgICAgICBmaWVsZDogcGFyYW1zLmZpZWxkLFxuICAgICAgICBjb2RlOiAnbG9uZ2l0dWRlLnRvb2JpZycsXG4gICAgICAgIG1lc3NhZ2U6ICdsb25naXR1ZGUgY2Fubm90IGJlIG1vcmUgdGhhbiAxODAnLFxuICAgICAgICBvcmlnaW46IHZhbHVlXG4gICAgICB9IF07XG5cbiAgICB9XG5cbiAgICByZXR1cm4gY2xlYW47XG5cbiAgfVxuXG59Il19