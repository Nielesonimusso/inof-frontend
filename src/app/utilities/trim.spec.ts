import { trimString } from './trim';

describe('trimString', () => {
  it('should trim spaces left of the text', () => {
    expect(trimString(' Foo')).toBe('Foo');
    expect(trimString('   Foo')).toBe('Foo');
  });

  it('should trim spaces right of the text', () => {
    expect(trimString('Foo ')).toBe('Foo');
    expect(trimString('Foo    ')).toBe('Foo');
  });

  it('should trim more than one space inside the text', () => {
    expect(trimString('Foo  Bar')).toBe('Foo Bar');
    expect(trimString('Foo     Bar')).toBe('Foo Bar');
  });
});
