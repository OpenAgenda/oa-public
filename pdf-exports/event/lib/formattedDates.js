import moment from 'moment';
import 'moment/locale/fr.js';

moment.locale('fr');

export default function formattedDates(content) {
  return content.map(({ begin, end }) => {
    const startDate = moment(begin);
    const endDate = moment(end);

    return {
      formattedMonthYear: startDate.format('MMMM YYYY'),
      formattedDay: startDate.format('D'),
      timeRange: `${startDate.format('HH[h]')} - ${endDate.format('HH[h]')}`,
    };
  });
}
