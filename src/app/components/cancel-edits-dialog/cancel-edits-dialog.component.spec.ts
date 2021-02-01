import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CancelEditsDialogComponent } from './cancel-edits-dialog.component';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

describe('CancelEditsDialogComponent', () => {
  let component: CancelEditsDialogComponent;
  let fixture: ComponentFixture<CancelEditsDialogComponent>;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      declarations: [CancelEditsDialogComponent],
      providers: [{ provide: MAT_DIALOG_DATA, useValue: 'Data' }],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CancelEditsDialogComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeDefined();
  });
});
