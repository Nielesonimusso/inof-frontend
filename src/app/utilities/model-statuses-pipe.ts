import { Pipe, PipeTransform } from '@angular/core';
import { ModelResult, ModelStatus } from '../models';

@Pipe({
  name: 'modelStatusPipe',
})
export class ModelStatusesPipe implements PipeTransform {
  // The method transform needs to be here from Angular PipeTransforms class
  transform(results: ModelResult[], args?: any): any {
    // success and failed are both considered finished
    const finished = results.filter(
      (value) => value.status === ModelStatus.success || value.status === ModelStatus.failed
    ).length;
    return `${finished}/${results.length} models finished`;
  }
}
