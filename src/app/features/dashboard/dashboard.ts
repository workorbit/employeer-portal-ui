import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Store } from '@ngrx/store';
import { AppShell } from '../../shared/components/app-shell/app-shell';
import { Icon } from '../../shared/components/icon/icon';
import { EmployeesActions } from '../../store/employees/employees.actions';
import { selectEmployees } from '../../store/employees/employees.selectors';
import { TimesheetsActions } from '../../store/timesheets/timesheets.actions';
import { selectTimesheets } from '../../store/timesheets/timesheets.selectors';
import { Timesheet, TimesheetPeriodType, TimesheetStatus } from '../../shared/models/timesheet.model';
import { PayrollActions } from '../../store/payroll/payroll.actions';
import { selectPayrollClaims } from '../../store/payroll/payroll.selectors';
import { PayrollClaim, PayrollClaimStatus } from '../../shared/models/payroll.model';
import { selectUser } from '../../store/auth/auth.selectors';

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

// SVG viewBox geometry for the hand-rolled bar chart — a left gutter for
// y-axis tick labels, a plot area for the bars, and bottom room for x-axis
// period labels. Kept as plain constants (not CSS) since the bar/gridline
// coordinates are computed directly from these in TS.
const CHART_GUTTER_LEFT = 34;
const CHART_PLOT_WIDTH = 560;
const CHART_PLOT_HEIGHT = 140;
const CHART_TOP_PADDING = 10;
const CHART_BOTTOM_LABEL_HEIGHT = 26;
const CHART_MAX_BARS = 8;
const CHART_BAR_MAX_THICKNESS = 24; // spec: bars never exceed 24px thick
const CHART_BAR_RADIUS = 4; // spec: 4px rounded data-end, square at the baseline

export const CHART_VIEWBOX_WIDTH = CHART_GUTTER_LEFT + CHART_PLOT_WIDTH;
export const CHART_VIEWBOX_HEIGHT = CHART_TOP_PADDING + CHART_PLOT_HEIGHT + CHART_BOTTOM_LABEL_HEIGHT;
const CHART_BASELINE_Y = CHART_TOP_PADDING + CHART_PLOT_HEIGHT;

interface ChartBar {
  path: string;
  bandX: number;
  bandWidth: number;
  bandCenterPercent: number;
  labelX: number;
  labelY: number;
  label: string;
  value: number;
}

interface ChartGridline {
  y: number;
  label: string;
}

// Rounded top corners only, square at the baseline — per the mark spec, a
// plain rect `rx` would round all four corners.
function roundedTopBarPath(x: number, y: number, width: number, height: number): string {
  if (height <= 0) return '';
  const r = Math.min(CHART_BAR_RADIUS, width / 2, height);
  const bottom = y + height;
  return (
    `M${x},${bottom} ` +
    `V${y + r} Q${x},${y} ${x + r},${y} ` +
    `H${x + width - r} Q${x + width},${y} ${x + width},${y + r} ` +
    `V${bottom} Z`
  );
}

function niceMax(value: number): number {
  return value <= 0 ? 10 : Math.ceil(value / 10) * 10;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterLink, AppShell, Icon],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard implements OnInit {
  private readonly store = inject(Store);

  protected readonly chartViewBox = `0 0 ${CHART_VIEWBOX_WIDTH} ${CHART_VIEWBOX_HEIGHT}`;
  protected readonly chartViewBoxWidth = CHART_VIEWBOX_WIDTH;
  protected readonly chartBaselineY = CHART_BASELINE_Y;
  protected readonly chartGutterLeft = CHART_GUTTER_LEFT;

  protected readonly employees = this.store.selectSignal(selectEmployees);
  protected readonly timesheets = this.store.selectSignal(selectTimesheets);
  protected readonly payrollClaims = this.store.selectSignal(selectPayrollClaims);

  private readonly user = this.store.selectSignal(selectUser);
  protected readonly cycleStartDay = computed(() => this.user()?.payCycleStartDay ?? 1);

  private readonly employeeNameById = computed(() => {
    const map = new Map<string, string>();
    for (const employee of this.employees()) map.set(employee.id, employee.name);
    return map;
  });

  employeeName(employeeId: string): string {
    return this.employeeNameById().get(employeeId) ?? 'Unknown employee';
  }

  protected readonly activeEmployeeCount = computed(
    () => this.employees().filter((employee) => employee.isActive).length,
  );
  protected readonly pendingTimesheetCount = computed(
    () => this.timesheets().filter((t) => t.status === TimesheetStatus.PENDING).length,
  );
  protected readonly pendingPayrollCount = computed(
    () => this.payrollClaims().filter((c) => c.status === PayrollClaimStatus.PENDING).length,
  );

  protected readonly pendingTimesheets = computed(() =>
    this.timesheets()
      .filter((t) => t.status === TimesheetStatus.PENDING)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .slice(0, 5),
  );

  protected readonly pendingPayrollClaims = computed(() =>
    this.payrollClaims()
      .filter((c) => c.status === PayrollClaimStatus.PENDING)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .slice(0, 5),
  );

  // ---------- "Timesheet activity" bar chart ----------

  private readonly chartSource = computed(() =>
    [...this.timesheets()]
      .sort((a, b) => a.createdAt.localeCompare(b.createdAt))
      .slice(-CHART_MAX_BARS),
  );

  protected readonly chartMaxValue = computed(() =>
    niceMax(Math.max(...this.chartSource().map((t) => t.totalHours), 0)),
  );

  protected readonly chartGridlines = computed<ChartGridline[]>(() => {
    const max = this.chartMaxValue();
    return [0, 0.5, 1].map((fraction) => ({
      y: CHART_TOP_PADDING + CHART_PLOT_HEIGHT * (1 - fraction),
      label: String(Math.round(max * fraction)),
    }));
  });

  protected readonly chartBars = computed<ChartBar[]>(() => {
    const source = this.chartSource();
    const max = this.chartMaxValue();
    if (source.length === 0) return [];

    const bandWidth = CHART_PLOT_WIDTH / source.length;
    const barWidth = Math.min(CHART_BAR_MAX_THICKNESS, bandWidth * 0.5);

    return source.map((timesheet, i) => {
      const bandX = CHART_GUTTER_LEFT + i * bandWidth;
      const barHeight = max === 0 ? 0 : (timesheet.totalHours / max) * CHART_PLOT_HEIGHT;
      const barX = bandX + (bandWidth - barWidth) / 2;
      const barY = CHART_BASELINE_Y - barHeight;
      return {
        path: roundedTopBarPath(barX, barY, barWidth, barHeight),
        bandX,
        bandWidth,
        bandCenterPercent: ((bandX + bandWidth / 2) / CHART_VIEWBOX_WIDTH) * 100,
        labelX: bandX + bandWidth / 2,
        labelY: CHART_BASELINE_Y + 16,
        label: this.periodLabel(timesheet),
        value: timesheet.totalHours,
      };
    });
  });

  protected readonly hoveredBarIndex = signal<number | null>(null);

  protected readonly hoveredBar = computed(() => {
    const index = this.hoveredBarIndex();
    return index === null ? null : (this.chartBars()[index] ?? null);
  });

  setHoveredBar(index: number | null): void {
    this.hoveredBarIndex.set(index);
  }

  ngOnInit(): void {
    this.store.dispatch(EmployeesActions.loadEmployees());
    this.store.dispatch(TimesheetsActions.loadTimesheets());
    this.store.dispatch(PayrollActions.loadPayrollClaims());
  }

  // Short form, used only for the chart's cramped x-axis labels — kept
  // deliberately simple regardless of the pay cycle.
  periodLabel(item: Timesheet | PayrollClaim): string {
    const periodType = 'periodType' in item ? item.periodType : TimesheetPeriodType.MONTHLY;
    if (periodType === TimesheetPeriodType.MONTHLY) {
      const [year, month] = item.period.split('-').map(Number);
      return `${MONTH_ABBR[month - 1]} '${String(year).slice(2)}`;
    }
    const start = new Date(`${item.period}T00:00:00`);
    return `${MONTH_ABBR[start.getMonth()]} ${start.getDate()}`;
  }

  // Full form, used in the "awaiting review" tables where there's room to
  // show the real cycle range once it's no longer the plain calendar month.
  reviewPeriodLabel(item: Timesheet | PayrollClaim): string {
    const periodType = 'periodType' in item ? item.periodType : TimesheetPeriodType.MONTHLY;
    const format = (d: Date) => `${MONTH_ABBR[d.getMonth()]} ${d.getDate()}`;
    if (periodType === TimesheetPeriodType.MONTHLY) {
      const [year, month] = item.period.split('-').map(Number);
      const cycleStartDay = this.cycleStartDay();
      if (cycleStartDay === 1) {
        return `${MONTH_ABBR[month - 1]} ${year}`;
      }
      const start = cycleStart(item.period, cycleStartDay);
      const end = cycleEnd(item.period, cycleStartDay);
      return `${format(start)} – ${format(end)}, ${end.getFullYear()}`;
    }
    const start = new Date(`${item.period}T00:00:00`);
    const end = new Date(start);
    end.setDate(end.getDate() + 6);
    return `${format(start)} – ${format(end)}, ${end.getFullYear()}`;
  }
}
