import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DeleteItemDialogComponent } from './delete-item-dialog.component';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

describe('DeleteItemDialogComponent', () => {
  let component: DeleteItemDialogComponent;
  let fixture: ComponentFixture<DeleteItemDialogComponent>;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      declarations: [DeleteItemDialogComponent],
      providers: [
        { provide: MAT_DIALOG_DATA, useValue: 'Data' }
      ]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DeleteItemDialogComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeDefined();
  });
});
