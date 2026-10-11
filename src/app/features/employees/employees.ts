import { Component, OnInit, effect, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Store } from '@ngrx/store';
import { AppShell } from '../../shared/components/app-shell/app-shell';
import { Icon } from '../../shared/components/icon/icon';
import { EmployeesActions } from '../../store/employees/employees.actions';
import {
  selectEmployees,
  selectEmployeesError,
  selectEmployeesLoading,
  selectEmployeesSaving,
} from '../../store/employees/employees.selectors';

@Component({
  selector: 'app-employees',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, AppShell, DatePipe, Icon],
  templateUrl: './employees.html',
  styleUrl: './employees.scss',
})
export class Employees implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly store = inject(Store);

  protected readonly employees = this.store.selectSignal(selectEmployees);
  protected readonly loading = this.store.selectSignal(selectEmployeesLoading);
  protected readonly saving = this.store.selectSignal(selectEmployeesSaving);
  protected readonly error = this.store.selectSignal(selectEmployeesError);

  protected readonly modalOpen = signal(false);
  /** Set only while a create submitted from this component is in flight —
   * so the effect below can tell a save just finished, and only then close
   * the modal on success (leaving it open with the error shown on failure). */
  private readonly submitted = signal(false);

  protected readonly form = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    department: [''],
    designation: [''],
    joiningDate: ['', Validators.required],
    salary: [0, [Validators.required, Validators.min(0)]],
    payType: ['fixed' as 'fixed' | 'hourly'],
    initialPassword: [''],
  });

  constructor() {
    effect(() => {
      if (!this.submitted() || this.saving()) return;
      this.submitted.set(false);
      if (!this.error()) {
        this.closeModal();
      }
    });
  }

  ngOnInit(): void {
    this.store.dispatch(EmployeesActions.loadEmployees());
  }

  openModal(): void {
    this.form.reset({ payType: 'fixed', salary: 0 });
    this.modalOpen.set(true);
  }

  closeModal(): void {
    this.modalOpen.set(false);
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const raw = this.form.getRawValue();
    this.submitted.set(true);
    this.store.dispatch(
      EmployeesActions.createEmployee({
        payload: {
          name: raw.name.trim(),
          email: raw.email.trim(),
          department: raw.department?.trim() || undefined,
          designation: raw.designation?.trim() || undefined,
          joiningDate: raw.joiningDate,
          salary: raw.salary,
          payType: raw.payType,
          initialPassword: raw.initialPassword?.trim() || undefined,
        },
      }),
    );
  }

  toggleStatus(id: string, isActive: boolean): void {
    this.store.dispatch(EmployeesActions.updateEmployeeStatus({ id, isActive: !isActive }));
  }

  // ---------- Field-level validation display ----------
  // Generic over every control's validators rather than one hardcoded
  // message per field, so it keeps working if a field's validators change.

  fieldInvalid(name: string): boolean {
    const control = this.form.get(name);
    return !!control && control.invalid && (control.touched || control.dirty);
  }

  fieldError(name: string): string {
    const errors = this.form.get(name)?.errors;
    if (!errors) return '';
    if (errors['required']) return 'This field is required.';
    if (errors['email']) return 'Enter a valid email address.';
    if (errors['minlength']) return `Must be at least ${errors['minlength'].requiredLength} characters.`;
    if (errors['min']) return `Must be ${errors['min'].min} or greater.`;
    return 'This field is invalid.';
  }
}
