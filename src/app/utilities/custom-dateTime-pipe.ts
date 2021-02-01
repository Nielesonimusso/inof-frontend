import { Pipe, PipeTransform } from '@angular/core';
import moment from 'moment';

@Pipe({
  name: 'customDateTime',
})
export class CustomDateTimePipe implements PipeTransform {
  // The method transform needs to be here from Angular PipeTransforms class
  transform(value: any, args?: any): any {
    // Use the momentJS library to get the data in the format shown in the UI
    return moment.utc(value).local().format('HH:mm DD/M/YYYY');
  }
}
