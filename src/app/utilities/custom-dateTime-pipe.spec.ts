import { CustomDateTimePipe } from './custom-dateTime-pipe';
import moment from 'moment';

describe('CustomDateTimePipe', () => {
  it('transform method should transform date to the specified moment format', () => {
    const pipe: any = new CustomDateTimePipe();
    // Transform local string to utc string
    const inputDate = moment('2020-05-29T12:23:41.876319').utc().toString();
    // Pipe transforms back to local string and formats
    const output = pipe.transform(inputDate);

    expect(output).toBe(getTestDate().createdOn);
  });
});

function getTestDate() {
  return {
    createdOn: '12:23 29/5/2020',
  };
}
