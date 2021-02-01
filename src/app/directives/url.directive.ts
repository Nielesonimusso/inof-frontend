import { Directive, Input } from '@angular/core';
import { NG_VALIDATORS, Validator, AbstractControl, Validators } from '@angular/forms';

/**
 * Url validation, to use simply add the attribute to an input: `<input ... url />`.
 */
@Directive({
  // tslint:disable-next-line:directive-selector
  selector: '[url]',
  providers: [{ provide: NG_VALIDATORS, useExisting: UrlDirective, multi: true }]
})
export class UrlDirective implements Validator {
  validate(control: AbstractControl): { [key: string]: any } {
    return Validators.pattern(reWebUrl)(control);
  }
}

// Based on https://stackoverflow.com/a/5717133 and https://tools.ietf.org/id/draft-liman-tld-names-00.html
const reWebUrl = new RegExp(
  // protocol
  '^(https?:\\/\\/)?' +
  // domain name
  '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)*[a-z][a-z\\d-]{0,61}[a-z\\d]|' +
  // OR ip (v4) address
  '((\\d{1,3}\\.){3}\\d{1,3}))' +
  // port and path
  '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' +
  // query string
  '(\\?[;&a-z\\d%_.~+=-]*)?' +
  // fragment locator
  '(\\#[-a-z\\d_]*)?$', 'i');
