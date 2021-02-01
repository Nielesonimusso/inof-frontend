import { MinDirective } from './min.directive';
import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';

@Component({
  template: '<input type="number" [(ngModel)]="number" #ngModel="ngModel" min="0" />'
})
class TestComponent {
  number: number;
}

describe ('MinDirective', () => {
  let component: TestComponent;
  let fixture: ComponentFixture<TestComponent>;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      imports: [CommonModule, FormsModule],
      declarations: [MinDirective, TestComponent]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TestComponent);
    component = fixture.componentInstance;
  });

  it('should invalidate below the defined min value', async () => {
    // Arrange
    const ngModel = fixture.debugElement.query(By.directive(MinDirective)).references.ngModel;

    // Act
    component.number = -1;
    fixture.detectChanges();
    await fixture.whenStable();

    // Assert
    expect(ngModel.valid).toBe(false);
  });

  it('should be valid at the defined min value', async () => {
    // Arrange
    const ngModel = fixture.debugElement.query(By.directive(MinDirective)).references.ngModel;

    // Act
    component.number = 0;
    fixture.detectChanges();
    await fixture.whenStable();

    // Assert
    expect(ngModel.valid).toBe(true);
  });

  it('should be valid above min value', async () => {
    // Arrange
    const ngModel = fixture.debugElement.query(By.directive(MinDirective)).references.ngModel;

    // Act
    component.number = 1;
    fixture.detectChanges();
    await fixture.whenStable();

    // Assert
    expect(ngModel.valid).toBe(true);
  });
});
