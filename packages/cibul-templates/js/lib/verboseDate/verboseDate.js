(function() {

  var dateFormats = {
    'en': {
      days: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
      daysShort: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
      daysMin: ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"],
      months: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
      monthsShort: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
      weekMin: 'wk'
    },
    'fr': {
      days: ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"],
      daysShort: ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"],
      daysMin: ["Di", "Lu", "Ma", "Me", "Je", "Ve", "Sa"],
      months: ["Janvier", "Fevrier", "Mars", "Avril", "Mai", "Juin", "Juillet", "Aout", "Septembre", "Octobre", "Novembre", "Decembre"],
      monthsShort: ["Jan", "Fev", "Mar", "Avr", "May", "Jun", "Jul", "Aou", "Sep", "Oct", "Nov", "Dec"],
      weekMin: 'sm'
    },
    'it': {
      days: ["Domenica", "Lunedi", "Martedi", "Mercoledi", "Giovedi", "Venerdi", "Sabato"],
      daysShort: ["Dom", "Lun", "Mar", "Mer", "Gio", "Ven", "Sab"],
      daysMin: ["Do", "Lu", "Ma", "Me", "Gi", "Ve", "Sa"],
      months: ["gennaio", "febbraio", "Marzo", "aprile", "maggio", "giugno", "luglio", "agosto", "settembre", "ottobre", "novembre", "dicembre"],
      monthsShort: ["gen", "feb", "Mar", "apr", "mag", "giu", "lug", "ago", "sep", "ott", "nov", "dic"],
      weekMin: 'set'
    },
    'es': {
      days: ["Domingo", "Lunes", "Martes", "Miercoles", "Jueves", "Viernes", "Sábado"],
      daysShort: ["Dom", "Lun", "Mar", "Mie", "Jue", "Vie", "Sáb"],
      daysMin: ["Do", "Lu", "Ma", "Mi", "Ju", "Vi", "Sá"],
      months: ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"],
      monthsShort: ["JEne", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"],
      weekMin: 'sm'
    },
  };

  if (typeof Date.prototype.verboseDate == 'undefined') Date.prototype.verboseDate = function(language) {

    if (!dateFormats[language]) language = 'en';

    return dateFormats[language].daysShort[this.getDay()] + ' ' + this.getDate() + ' ' + dateFormats[language].monthsShort[this.getMonth()] + ', ' + this.getFullYear();

  };

  if (typeof String.prototype.verboseDate == 'undefined') String.prototype.verboseDate = function(language) {

    var date = new Date(this.replace(/-/g, '/'));

    if (date.toString() == 'Invalid Date') return false;

    return date.verboseDate(language);

  };

})();