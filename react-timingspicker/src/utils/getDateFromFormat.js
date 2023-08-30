/* eslint-disable */

// http://www.mattkruse.com/javascript/date/source.html

// ------------------------------------------------------------------
// Utility functions for parsing in getDateFromFormat()
// ------------------------------------------------------------------
function _isInteger(val) {
  const digits = '1234567890';
  for (let i = 0; i < val.length; i++) {
    if (!digits.includes(val.charAt(i))) {
      return false;
    }
  }
  return true;
}

function _getInt(str, i, minlength, maxlength) {
  for (let x = maxlength; x >= minlength; x--) {
    const token = str.substring(i, i + x);
    if (token.length < minlength) {
      return null;
    }
    if (_isInteger(token)) {
      return token;
    }
  }
  return null;
}

// ------------------------------------------------------------------
// getDateFromFormat( date_string , format_string )
//
// This function takes a date string and a format string. It matches
// If the date string matches the format string, it returns the
// getTime() of the date. If it does not match, it returns 0.
// ------------------------------------------------------------------
export default function getDateFromFormat(val, format) {
  val = `${val}`;
  format = `${format}`;
  let i_val = 0;
  let i_format = 0;
  let c = '';
  let token = '';
  let x;
  let y;
  const now = new Date();
  let year = now.getYear();
  let month = now.getMonth() + 1;
  let date = 1;
  let hh = now.getHours();
  let mm = now.getMinutes();
  let ss = now.getSeconds();
  let ampm = '';

  while (i_format < format.length) {
    // Get next token from format string
    c = format.charAt(i_format);
    token = '';
    while (format.charAt(i_format) == c && i_format < format.length) {
      token += format.charAt(i_format++);
    }
    // Extract contents of value based on format token
    if (token == 'yyyy' || token == 'yy' || token == 'y') {
      if (token == 'yyyy') {
        x = 4;
        y = 4;
      }
      if (token == 'yy') {
        x = 2;
        y = 2;
      }
      if (token == 'y') {
        x = 2;
        y = 4;
      }
      year = _getInt(val, i_val, x, y);
      if (year == null) {
        return 0;
      }
      i_val += year.length;
      if (year.length == 2) {
        if (year > 70) {
          year = 1900 + (year - 0);
        } else {
          year = 2000 + (year - 0);
        }
      }
    } else if (token == 'MMM' || token == 'NNN') {
      month = 0;
      for (var i = 0; i < MONTH_NAMES.length; i++) {
        const month_name = MONTH_NAMES[i];
        if (
          val.substring(i_val, i_val + month_name.length).toLowerCase() ==
          month_name.toLowerCase()
        ) {
          if (token == 'MMM' || (token == 'NNN' && i > 11)) {
            month = i + 1;
            if (month > 12) {
              month -= 12;
            }
            i_val += month_name.length;
            break;
          }
        }
      }
      if (month < 1 || month > 12) {
        return 0;
      }
    } else if (token == 'EE' || token == 'E') {
      for (var i = 0; i < DAY_NAMES.length; i++) {
        const day_name = DAY_NAMES[i];
        if (
          val.substring(i_val, i_val + day_name.length).toLowerCase() ==
          day_name.toLowerCase()
        ) {
          i_val += day_name.length;
          break;
        }
      }
    } else if (token == 'MM' || token == 'M') {
      month = _getInt(val, i_val, token.length, 2);
      if (month == null || month < 1 || month > 12) {
        return 0;
      }
      i_val += month.length;
    } else if (token == 'dd' || token == 'd') {
      date = _getInt(val, i_val, token.length, 2);
      if (date == null || date < 1 || date > 31) {
        return 0;
      }
      i_val += date.length;
    } else if (token == 'hh' || token == 'h') {
      hh = _getInt(val, i_val, token.length, 2);
      if (hh == null || hh < 1 || hh > 12) {
        return 0;
      }
      i_val += hh.length;
    } else if (token == 'HH' || token == 'H') {
      hh = _getInt(val, i_val, token.length, 2);
      if (hh == null || hh < 0 || hh > 23) {
        return 0;
      }
      i_val += hh.length;
    } else if (token == 'KK' || token == 'K') {
      hh = _getInt(val, i_val, token.length, 2);
      if (hh == null || hh < 0 || hh > 11) {
        return 0;
      }
      i_val += hh.length;
    } else if (token == 'kk' || token == 'k') {
      hh = _getInt(val, i_val, token.length, 2);
      if (hh == null || hh < 1 || hh > 24) {
        return 0;
      }
      i_val += hh.length;
      hh--;
    } else if (token == 'mm' || token == 'm') {
      mm = _getInt(val, i_val, token.length, 2);
      if (mm == null || mm < 0 || mm > 59) {
        return 0;
      }
      i_val += mm.length;
    } else if (token == 'ss' || token == 's') {
      ss = _getInt(val, i_val, token.length, 2);
      if (ss == null || ss < 0 || ss > 59) {
        return 0;
      }
      i_val += ss.length;
    } else if (token == 'a') {
      if (val.substring(i_val, i_val + 2).toLowerCase() == 'am') {
        ampm = 'AM';
      } else if (val.substring(i_val, i_val + 2).toLowerCase() == 'pm') {
        ampm = 'PM';
      } else {
        return 0;
      }
      i_val += 2;
    } else {
      if (val.substring(i_val, i_val + token.length) != token) {
        return 0;
      }
      i_val += token.length;
    }
  }
  // If there are any trailing characters left in the value, it doesn't match
  if (i_val != val.length) {
    return 0;
  }
  // Is date valid for month?
  if (month == 2) {
    // Check for leap year
    if ((year % 4 == 0 && year % 100 != 0) || year % 400 == 0) {
      // leap year
      if (date > 29) {
        return 0;
      }
    } else if (date > 28) {
      return 0;
    }
  }
  if (month == 4 || month == 6 || month == 9 || month == 11) {
    if (date > 30) {
      return 0;
    }
  } // Correct hours value
  if (hh < 12 && ampm == 'PM') {
    hh = hh - 0 + 12;
  } else if (hh > 11 && ampm == 'AM') {
    hh -= 12;
  }
  const newdate = new Date(year, month - 1, date, hh, mm, ss);
  return newdate.getTime();
}
