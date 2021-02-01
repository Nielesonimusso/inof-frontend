import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { TrimDirective } from './trim.directive';

@Component({
  template: '<input [(ngModel)]="text" #ngModel="ngModel" appTrim />'
})
class TestComponent {
  text: string;
}

describe ('TrimDirective', () => {
  let component: TestComponent;
  let fixture: ComponentFixture<TestComponent>;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      imports: [CommonModule, FormsModule],
      declarations: [TrimDirective, TestComponent]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TestComponent);
    component = fixture.componentInstance;
  });

  it('should trim spaces left of the text', async () => {
    // Arrange
    const input = fixture.debugElement.query(By.directive(TrimDirective)).nativeElement;

    // Act
    fixture.detectChanges();
    input.value = '   Foo';
    input.dispatchEvent(new Event('change'));

    // Assert
    expect(component.text).toBe('Foo');
  });

  it('should trim spaces right of the text', async () => {
    // Arrange
    const input = fixture.debugElement.query(By.directive(TrimDirective)).nativeElement;

    // Act
    fixture.detectChanges();
    input.value = 'Foo   ';
    input.dispatchEvent(new Event('change'));

    // Assert
    expect(component.text).toBe('Foo');
  });

  it('should trim more than one space inside the text', async () => {
    // Arrange
    const input = fixture.debugElement.query(By.directive(TrimDirective)).nativeElement;

    // Act
    fixture.detectChanges();
    input.value = 'Foo   Bar';
    input.dispatchEvent(new Event('change'));

    // Assert
    expect(component.text).toBe('Foo Bar');
  });
});
