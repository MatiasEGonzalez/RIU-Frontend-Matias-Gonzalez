import { ComponentFixture, TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import {
  ConfirmDialogComponent,
  ConfirmDialogData,
} from './confirm-dialog.component';

describe('ConfirmDialogComponent', () => {
  let component: ConfirmDialogComponent;
  let fixture: ComponentFixture<ConfirmDialogComponent>;
  let dialogRefSpy: { close: ReturnType<typeof vi.fn> };

  const mockData: ConfirmDialogData = {
    title: 'Delete hero',
    message: 'Are you sure you want to delete Superman?',
  };

  beforeEach(async () => {
    dialogRefSpy = { close: vi.fn() };

    await TestBed.configureTestingModule({
      imports: [ConfirmDialogComponent, MatDialogModule],
      providers: [
        { provide: MAT_DIALOG_DATA, useValue: mockData },
        { provide: MatDialogRef, useValue: dialogRefSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ConfirmDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  // ─── Rendering ────────────────────────────────────────────────────────────

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display the title from injected data', () => {
    const titleEl: HTMLElement =
      fixture.nativeElement.querySelector('[mat-dialog-title]');
    expect(titleEl.textContent).toContain('Delete hero');
  });

  it('should display the message from injected data', () => {
    const contentEl: HTMLElement =
      fixture.nativeElement.querySelector('mat-dialog-content p');
    expect(contentEl.textContent).toContain(
      'Are you sure you want to delete Superman?'
    );
  });

  // ─── Actions ──────────────────────────────────────────────────────────────

  it('should close with true when confirm is clicked', () => {
    component.onConfirm();
    expect(dialogRefSpy.close).toHaveBeenCalledWith(true);
  });

  it('should close with false when cancel is clicked', () => {
    component.onCancel();
    expect(dialogRefSpy.close).toHaveBeenCalledWith(false);
  });

  // ─── Button Layout ───────────────────────────────────────────────────────

  it('should have two action buttons', () => {
    const buttons: NodeListOf<HTMLButtonElement> =
      fixture.nativeElement.querySelectorAll('mat-dialog-actions button');
    expect(buttons.length).toBe(2);
  });

  it('should have Cancel as the first button text', () => {
    const buttons: NodeListOf<HTMLButtonElement> =
      fixture.nativeElement.querySelectorAll('mat-dialog-actions button');
    expect(buttons[0].textContent?.trim()).toBe('Cancel');
  });

  it('should have Confirm as the second button text', () => {
    const buttons: NodeListOf<HTMLButtonElement> =
      fixture.nativeElement.querySelectorAll('mat-dialog-actions button');
    expect(buttons[1].textContent?.trim()).toBe('Confirm');
  });
});
