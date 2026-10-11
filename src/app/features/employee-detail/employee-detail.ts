import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { map } from 'rxjs';
import { Store } from '@ngrx/store';
import { AppShell } from '../../shared/components/app-shell/app-shell';
import { TimesheetsList } from '../timesheets/timesheets-list';
import { PayrollList } from '../payroll/payroll-list';
import { EmployeesActions } from '../../store/employees/employees.actions';
import { selectEmployees, selectEmployeesLoading } from '../../store/employees/employees.selectors';

type DetailTab = 'timesheets' | 'payroll';

@Component({
  selector: 'app-employee-detail',
  standalone: true,
  imports: [RouterLink, DatePipe, AppShell, TimesheetsList, PayrollList],
  templateUrl: './employee-detail.html',
  styleUrl: './employee-detail.scss',
})
export class EmployeeDetail implements OnInit {
  private readonly store = inject(Store);
  private readonly route = inject(ActivatedRoute);

  protected readonly employeeId = toSignal(
    this.route.paramMap.pipe(map((params) => params.get('id')!)),
    { requireSync: true },
  );

  protected readonly employees = this.store.selectSignal(selectEmployees);
  protected readonly loading = this.store.selectSignal(selectEmployeesLoading);

  protected readonly employee = computed(() =>
    this.employees().find((e) => e.id === this.employeeId()),
  );

  protected readonly activeTab = signal<DetailTab>('timesheets');

  ngOnInit(): void {
    this.store.dispatch(EmployeesActions.loadEmployees());
  }

  setTab(tab: DetailTab): void {
    this.activeTab.set(tab);
  }
}
