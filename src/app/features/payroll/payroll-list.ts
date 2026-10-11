import { Component, Input, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Store } from '@ngrx/store';
import { Icon } from '../../shared/components/icon/icon';
import { PayrollActions } from '../../store/payroll/payroll.actions';
import { selectPayrollClaims, selectPayrollLoading } from '../../store/payroll/payroll.selectors';
import { EmployeesActions } from '../../store/employees/employees.actions';
import { selectEmployees } from '../../store/employees/employees.selectors';
import { selectUser } from '../../store/auth/auth.selectors';
import { PayrollClaim, PayrollClaimStatus } from '../../shared/models/payroll.model';

const MONTH_ABBR = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

// Mirrors the identical helpers in employee-portal's timesheets.ts/payroll.ts
// — a "monthly" period "YYYY-MM" means the cycle starting on day
// `cycleStartDay` of month MM, ending the day before that same day the
// following month. cycleStartDay 1 (the default) is the plain calendar month.
function cycleStart(period: string, cycleStartDay: number): Date {
  const [year, month] = period.split('-').map(Number);
  return new Date(year, month - 1, cycleStartDay);
}

function cycleEnd(period: string, cycleStartDay: number): Date {
  const [year, month] = period.split('-').map(Number);
  return new Date(year, month, cycleStartDay - 1);
}

@Component({
  selector: 'app-payroll-list',
  standalone: true,
  imports: [FormsModule, Icon],
  templateUrl: './payroll-list.html',
  styleUrl: './payroll-list.scss',
})
export class PayrollList implements OnInit {
  private readonly store = inject(Store);

  // Set from the employee detail page to show just one employee's claims;
  // left unset on the main Payroll page to show everyone's.
  @Input() employeeId?: string;

  protected readonly PayrollClaimStatus = PayrollClaimStatus;
  protected readonly claims = this.store.selectSignal(selectPayrollClaims);
  protected readonly loading = this.store.selectSignal(selectPayrollLoading);
  protected readonly employees = this.store.selectSignal(selectEmployees);

  private readonly user = this.store.selectSignal(selectUser);
  protected readonly cycleStartDay = computed(() => this.user()?.payCycleStartDay ?? 1);

  protected readonly remarksById = signal<Record<string, string>>({});
  private readonly expandedOverrides = signal<Record<string, boolean>>({});

  ngOnInit(): void {
    this.store.dispatch(PayrollActions.loadPayrollClaims());
    this.store.dispatch(EmployeesActions.loadEmployees());
  }

  visibleClaims(): PayrollClaim[] {
    const all = this.claims();
    return this.employeeId ? all.filter((c) => c.employeeId === this.employeeId) : all;
  }

  remarksFor(id: string): string {
    return this.remarksById()[id] ?? '';
  }

  setRemarks(id: string, value: string): void {
    this.remarksById.update((map) => ({ ...map, [id]: value }));
  }

  decide(
    id: string,
    status: PayrollClaimStatus.APPROVED | PayrollClaimStatus.REJECTED | PayrollClaimStatus.PENDING,
  ): void {
    const remarks = this.remarksFor(id).trim() || undefined;
    this.store.dispatch(PayrollActions.updatePayrollClaimStatus({ id, payload: { status, remarks } }));
  }

  markPaid(id: string): void {
    this.store.dispatch(PayrollActions.markPayrollClaimPaid({ id }));
  }

  employeeName(employeeId: string): string {
    return this.employees().find((employee) => employee.id === employeeId)?.name || employeeId;
  }

  isExpanded(claim: PayrollClaim): boolean {
    const override = this.expandedOverrides()[claim.id];
    return override ?? claim.status === PayrollClaimStatus.PENDING;
  }

  toggleExpanded(claim: PayrollClaim): void {
    const next = !this.isExpanded(claim);
    this.expandedOverrides.update((map) => ({ ...map, [claim.id]: next }));
  }

  periodLabel(period: string): string {
    const [year, month] = period.split('-').map(Number);
    const cycleStartDay = this.cycleStartDay();
    if (cycleStartDay === 1) {
      return `${MONTH_ABBR[month - 1]} ${year}`;
    }
    const start = cycleStart(period, cycleStartDay);
    const end = cycleEnd(period, cycleStartDay);
    const format = (d: Date) => `${MONTH_ABBR[d.getMonth()]} ${d.getDate()}`;
    return `${format(start)} – ${format(end)}, ${end.getFullYear()}`;
  }
}
