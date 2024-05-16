import { format } from 'date-fns';
import convertPhpDateFormatToDateFns from '../src/utils/convertPhpDateFormatToDateFns';

const date = new Date('2024-05-16T15:52:01.781Z');

describe('convertPhpDateFormatToDateFns', () => {
  it('convert format "l, F j, Y"', () => {
    const convertedFormat = convertPhpDateFormatToDateFns('l, F j, Y');
    expect(convertedFormat).toBe('EEEE, MMMM d, yyyy');
    expect(format(date, convertedFormat)).toBe('Thursday, May 16, 2024');
  });

  it('convert format "F j, Y g:i a"', () => {
    const convertedFormat = convertPhpDateFormatToDateFns('F j, Y g:i a');
    expect(convertedFormat).toBe('MMMM d, yyyy h:mm aaa');
    expect(format(date, convertedFormat)).toBe('May 16, 2024 5:52 pm');
  });

  it('convert format "g:i:s a"', () => {
    const convertedFormat = convertPhpDateFormatToDateFns('g:i:s a');
    expect(convertedFormat).toBe('h:mm:ss aaa');
    expect(format(date, convertedFormat)).toBe('5:52:01 pm');
  });

  it('convert format "l, F jS, Y"', () => {
    const convertedFormat = convertPhpDateFormatToDateFns('l, F jS, Y');
    expect(convertedFormat).toBe('EEEE, MMMM do, yyyy');
    expect(format(date, convertedFormat)).toBe('Thursday, May 16th, 2024');
  });

  it('convert format "Y/m/d \\a\\t g:i A"', () => {
    const convertedFormat = convertPhpDateFormatToDateFns('Y/m/d \\a\\t g:i A');
    expect(convertedFormat).toBe("yyyy/MM/dd 'at' h:mm a");
    expect(format(date, convertedFormat)).toBe('2024/05/16 at 5:52 PM');
  });

  it('convert format "m.d.y"', () => {
    const convertedFormat = convertPhpDateFormatToDateFns('m.d.y');
    expect(convertedFormat).toBe('MM.dd.yy');
    expect(format(date, convertedFormat)).toBe('05.16.24');
  });

  it('convert format "h-i-s, j-m-y, it is w Day"', () => {
    // 't' doesn't exist
    const convertedFormat = convertPhpDateFormatToDateFns(
      'h-i-s, j-m-y, it is w Day',
    );
    expect(convertedFormat).toBe('hh-mm-ss, d-MM-yy, mm mmss e EEEaaayy');
    expect(format(date, convertedFormat)).toBe(
      '05-52-01, 16-05-24, 52 5201 5 Thupm24',
    );
  });

  it('convert format "\\i\\t \\i\\s \\t\\h\\e jS \\d\\a\\y."', () => {
    const convertedFormat = convertPhpDateFormatToDateFns(
      '\\i\\t \\i\\s \\t\\h\\e jS \\d\\a\\y.',
    );
    expect(convertedFormat).toBe("'it' 'is' 'the' do 'day'.");
    expect(format(date, convertedFormat)).toBe('it is the 16th day.');
  });

  it('convert format "D M j G:i:s T Y"', () => {
    const convertedFormat = convertPhpDateFormatToDateFns('D M j G:i:s T Y');
    expect(convertedFormat).toBe('EEE MMM d H:mm:ss zz yyyy');
    expect(format(date, convertedFormat)).toBe(
      'Thu May 16 17:52:01 GMT+2 2024',
    );
  });

  it('convert format "H:m:s \\m \\e\\s\\t\\ \\l\\e\\ \\m\\o\\i\\s"', () => {
    const convertedFormat = convertPhpDateFormatToDateFns(
      'H:m:s \\m \\e\\s\\t\\ \\l\\e\\ \\m\\o\\i\\s',
    );
    expect(convertedFormat).toBe("HH:MM:ss 'm' 'est le mois'");
    expect(format(date, convertedFormat)).toBe('17:05:01 m est le mois');
  });

  it('convert format "Y-m-d H:i:s"', () => {
    const convertedFormat = convertPhpDateFormatToDateFns('Y-m-d H:i:s');
    expect(convertedFormat).toBe('yyyy-MM-dd HH:mm:ss');
    expect(format(date, convertedFormat)).toBe('2024-05-16 17:52:01');
  });
});
