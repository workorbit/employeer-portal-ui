import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Store } from '@ngrx/store';
import { AppShell } from '../../shared/components/app-shell/app-shell';
import { AuthApiService } from '../../core/api/auth-api.service';
import { AuthActions } from '../../store/auth/auth.actions';
import { selectUser } from '../../store/auth/auth.selectors';
import { ToastService } from '../../shared/services/toast.service';

const ORDINALS = [
  '1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th', '9th', '10th',
  '11th', '12th', '13th', '14th', '15th', '16th', '17th', '18th', '19th', '20th',
  '21st', '22nd', '23rd', '24th', '25th', '26th', '27th', '28th',
];

@Component({
  selector: 'app-company-settings',
  standalone: true,
  imports: [FormsModule, AppShell],
  templateUrl: './company-settings.html',
  styleUrl: './company-settings.scss',
})
export class CompanySettings {
  private readonly store = inject(Store);
  private readonly authApi = inject(AuthApiService);
  private readonly toast = inject(ToastService);

  protected readonly cycleDayOptions = ORDINALS.map((label, i) => ({ value: i + 1, label }));

  private readonly user = this.store.selectSignal(selectUser);
  protected readonly selectedDay = signal(this.user()?.payCycleStartDay ?? 1);
  protected readonly saving = signal(false);

  protected readonly isDefault = computed(() => this.selectedDay() === 1);

  setSelectedDay(value: string): void {
    this.selectedDay.set(Number(value));
  }

  save(): void {
    this.saving.set(true);
    this.authApi.updateCompanySettings(this.selectedDay()).subscribe({
      next: () => {
        this.saving.set(false);
        this.toast.show('Pay cycle updated.', 'success');
        // Picks up the new value everywhere (Timesheets/Payroll/Dashboard)
        // via the same session-refresh plumbing every other tab already uses.
        this.store.dispatch(AuthActions.restoreSession());
      },
      error: () => {
        this.saving.set(false);
        this.toast.show('Failed to update pay cycle. Please try again.', 'error');
      },
    });
  }
}
