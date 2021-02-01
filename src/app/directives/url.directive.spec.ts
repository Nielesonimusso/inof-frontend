import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { UrlDirective } from './url.directive';

@Component({
  template: '<input type="url" [(ngModel)]="url" #ngModel="ngModel" url />'
})
class TestComponent {
  url: string;
}

describe ('UrlDirective', () => {
  let component: TestComponent;
  let fixture: ComponentFixture<TestComponent>;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      imports: [CommonModule, FormsModule],
      declarations: [UrlDirective, TestComponent]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TestComponent);
    component = fixture.componentInstance;
  });

  it('should invalidate when url is invalid', async () => {
    // Arrange
    const ngModel = fixture.debugElement.query(By.directive(UrlDirective)).references.ngModel;

    // Act
    component.url = 'I4mN0t4nUrl :(';
    fixture.detectChanges();
    await fixture.whenStable();

    // Assert
    expect(ngModel.valid).toBeFalse();
  });

  it('should be valid when url is valid', async () => {
    // Arrange
    const ngModel = fixture.debugElement.query(By.directive(UrlDirective)).references.ngModel;

    // Act
    component.url = 'http://test.url.com';
    fixture.detectChanges();
    await fixture.whenStable();

    // Assert
    expect(ngModel.valid).toBeTrue();
  });

  it('should be valid when url is valid with port', async () => {
    // Arrange
    const ngModel = fixture.debugElement.query(By.directive(UrlDirective)).references.ngModel;

    // Act
    component.url = 'http://test.url.com:8080';
    fixture.detectChanges();
    await fixture.whenStable();

    // Assert
    expect(ngModel.valid).toBeTrue();
  });

  it('should be valid when url is valid with port and no top level domain', async () => {
    // Arrange
    const ngModel = fixture.debugElement.query(By.directive(UrlDirective)).references.ngModel;

    // Act
    component.url = 'http://test-url:8080';
    fixture.detectChanges();
    await fixture.whenStable();

    // Assert
    expect(ngModel.valid).toBeTrue();
  });
});
