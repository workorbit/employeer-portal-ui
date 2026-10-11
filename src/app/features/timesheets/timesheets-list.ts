import { Component, Input, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Store } from '@ngrx/store';
import { Icon } from '../../shared/components/icon/icon';
import { TimesheetsActions } from '../../store/timesheets/timesheets.actions';
import { selectTimesheets, selectTimesheetsLoading } from '../../store/timesheets/timesheets.selectors';
import { EmployeesActions } from '../../store/employees/employees.actions';
import { selectEmployees } from '../../store/employees/employees.selectors';
import { selectUser } from '../../store/auth/auth.selectors';
import {
  Timesheet,
  TimesheetEntry,
  TimesheetEntryStatus,
  TimesheetPeriodType,
  TimesheetStatus,
} from '../../shared/models/timesheet.model';

const MONTH_ABBR = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];
const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const ENTRY_STATUS_LABELS: Record<TimesheetEntryStatus, string> = {
  [TimesheetEntryStatus.PRESENT]: 'Present',
  [TimesheetEntryStatus.WFH]: 'WFH',
  [TimesheetEntryStatus.LEAVE]: 'Leave',
  [TimesheetEntryStatus.SICK_LEAVE]: 'Sick Leave',
  [TimesheetEntryStatus.HOLIDAY]: 'Holiday',
  [TimesheetEntryStatus.WEEKEND]: 'Weekend',
};

function addDays(date: Date, amount: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + amount);
  return result;
}

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
  selector: 'app-timesheets-list',
  standalone: true,
  imports: [FormsModule, Icon],
  templateUrl: './timesheets-list.html',
  styleUrl: './timesheets-list.scss',
})
export class TimesheetsList implements OnInit {
  private readonly store = inject(Store);

  // Set from the employee detail page to show just one employee's
  // timesheets; left unset on the main Timesheets page to show everyone's.
  @Input() employeeId?: string;

  protected readonly TimesheetStatus = TimesheetStatus;
  protected readonly timesheets = this.store.selectSignal(selectTimesheets);
  protected readonly loading = this.store.selectSignal(selectTimesheetsLoading);
  protected readonly employees = this.store.selectSignal(selectEmployees);

  private readonly user = this.store.selectSignal(selectUser);
  protected readonly cycleStartDay = computed(() => this.user()?.payCycleStartDay ?? 1);

  protected readonly remarksById = signal<Record<string, string>>({});

  /** Detail breakdown starts open for anything still awaiting a decision —
   * that's exactly when the reviewer needs to see the day-by-day entries,
   * not just the total. Already-decided timesheets start collapsed but can
   * still be expanded for an audit look-back. */
  private readonly expandedOverrides = signal<Record<string, boolean>>({});

  ngOnInit(): void {
    this.store.dispatch(TimesheetsActions.loadTimesheets());
    this.store.dispatch(EmployeesActions.loadEmployees());
  }

  visibleTimesheets(): Timesheet[] {
    const all = this.timesheets();
    return this.employeeId ? all.filter((t) => t.employeeId === this.employeeId) : all;
  }

  remarksFor(id: string): string {
    return this.remarksById()[id] ?? '';
  }

  setRemarks(id: string, value: string): void {
    this.remarksById.update((map) => ({ ...map, [id]: value }));
  }

  decide(id: string, status: TimesheetStatus.APPROVED | TimesheetStatus.REJECTED | TimesheetStatus.PENDING): void {
    const remarks = this.remarksFor(id).trim() || undefined;
    this.store.dispatch(TimesheetsActions.updateTimesheetStatus({ id, payload: { status, remarks } }));
  }

  employeeName(employeeId: string): string {
    return this.employees().find((employee) => employee.id === employeeId)?.name || employeeId;
  }

  isExpanded(timesheet: Timesheet): boolean {
    const override = this.expandedOverrides()[timesheet.id];
    return override ?? timesheet.status === TimesheetStatus.PENDING;
  }

  toggleExpanded(timesheet: Timesheet): void {
    const next = !this.isExpanded(timesheet);
    this.expandedOverrides.update((map) => ({ ...map, [timesheet.id]: next }));
  }

  sortedEntries(timesheet: Timesheet): TimesheetEntry[] {
    return [...timesheet.entries].sort((a, b) => a.date.localeCompare(b.date));
  }

  dayLabel(dateIso: string): string {
    return DAY_LABELS[new Date(`${dateIso}T00:00:00`).getDay()];
  }

  entryStatusLabel(status: TimesheetEntryStatus): string {
    return ENTRY_STATUS_LABELS[status] ?? status;
  }

  periodRangeLabel(timesheet: Timesheet): string {
    const format = (d: Date) => `${MONTH_ABBR[d.getMonth()]} ${d.getDate()}`;
    if (timesheet.periodType === TimesheetPeriodType.MONTHLY) {
      const [year, month] = timesheet.period.split('-').map(Number);
      const cycleStartDay = this.cycleStartDay();
      if (cycleStartDay === 1) {
        return `${MONTH_ABBR[month - 1]} ${year}`;
      }
      const start = cycleStart(timesheet.period, cycleStartDay);
      const end = cycleEnd(timesheet.period, cycleStartDay);
      return `${format(start)} – ${format(end)}, ${end.getFullYear()}`;
    }
    const start = new Date(`${timesheet.period}T00:00:00`);
    const end = addDays(start, 6);
    return `${format(start)} – ${format(end)}, ${end.getFullYear()}`;
  }
}
