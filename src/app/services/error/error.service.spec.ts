import { TestBed } from '@angular/core/testing';
import { ErrorService } from './error.service';
import { MatSnackBar } from '@angular/material/snack-bar';

describe('ErrorService', () => {
  let service: ErrorService;
  let snackBar: jasmine.SpyObj<MatSnackBar>;

  beforeEach(() => {
    snackBar = jasmine.createSpyObj('MatSnackBar', ['open']);

    TestBed.configureTestingModule({
      providers: [
        ErrorService,
        { provide: MatSnackBar, useValue: snackBar },
      ],
    });
    service = TestBed.inject(ErrorService);
  });

  it('should be created', () => {
    expect(service).toBeDefined();
  });

  describe('showError', () => {
    it('should display a default error message', () => {
      // Arrange
      const expectedMessage = 'Something went wrong.';

      // Act
      service.showError({});

      // Assert
      expect(snackBar.open).toHaveBeenCalledWith(expectedMessage, null, {
        panelClass: 'snackbar-error',
        duration: 5000
      });
    });

    it('should display the provided error message as object', () => {
      // Arrange
      const expectedMessage = 'Test error message';

      // Act
      service.showError({ msg: expectedMessage });

      // Assert
      expect(snackBar.open).toHaveBeenCalledWith(expectedMessage, null, {
        panelClass: 'snackbar-error',
        duration: 5000
      });
    });

    it('should display the provided error message as string', () => {
      // Arrange
      const expectedMessage = 'Test error message';

      // Act
      service.showError(expectedMessage);

      // Assert
      expect(snackBar.open).toHaveBeenCalledWith(expectedMessage, null, {
        panelClass: 'snackbar-error',
        duration: 5000
      });
    });
  });
});
