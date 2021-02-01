import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { MustMatchDirective } from './must-match.directive';

@Component({
  template:
    `<form #ngForm="ngForm" [appMustMatch]="['input-1', 'input-2']">
      <input id="input-1" name="input-1" [(ngModel)]="input1" #ngInput1="ngModel" />
      <input id="input-2" name="input-2" [(ngModel)]="input2" #ngInput2="ngModel" />
    </form>`
})
class TestComponent {
  input1: string;
  input2: string;
}

describe ('MustMatchDirective', () => {
  let component: TestComponent;
  let fixture: ComponentFixture<TestComponent>;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      imports: [CommonModule, FormsModule],
      declarations: [MustMatchDirective, TestComponent]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TestComponent);
    component = fixture.componentInstance;
  });

  it('should invalidate when fields dont match', async () => {
    // Arrange
    const ngForm = fixture.debugElement.query(By.directive(MustMatchDirective)).references.ngForm;

    // Act
    component.input1 = 'Text 1';
    component.input2 = 'Text 2';
    fixture.detectChanges();
    await fixture.whenStable();

    // Assert
    expect(ngForm.valid).toBe(false);
  });

  it('should be valid when fields match', async () => {
    // Arrange
    const ngForm = fixture.debugElement.query(By.directive(MustMatchDirective)).references.ngForm;

    // Act
    component.input1 = component.input2 = 'Text';
    fixture.detectChanges();
    await fixture.whenStable();

    // Assert
    expect(ngForm.valid).toBe(true);
  });
});
