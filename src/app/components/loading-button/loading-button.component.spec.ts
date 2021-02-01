import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LoadingButtonComponent } from './loading-button.component';

describe('LoadingButtonComponent', () => {
  let component: LoadingButtonComponent;
  let fixture: ComponentFixture<LoadingButtonComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [LoadingButtonComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LoadingButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should start loading when clicked', async () => {
    const spy = spyOn(component, 'onClick').and.callThrough();

    expect(component.loading).toBeFalse();
    fixture.debugElement.nativeElement.querySelector('button').click();

    await fixture.whenStable();

    expect(spy).toHaveBeenCalled();
    expect(component.loading).toBeTrue();

    component.completeLoading();
    expect(component.loading).toBeFalse();
  });
});
