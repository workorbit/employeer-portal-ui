import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { HttpErrorResponse } from '@angular/common/http';
import { catchError, map, of, switchMap } from 'rxjs';
import { EmployeesApiService } from '../../core/api/employees-api.service';
import { EmployeesActions } from './employees.actions';

@Injectable()
export class EmployeesEffects {
  private readonly actions$ = inject(Actions);
  private readonly employeesApi = inject(EmployeesApiService);

  loadEmployees$ = createEffect(() =>
    this.actions$.pipe(
      ofType(EmployeesActions.loadEmployees),
      switchMap(() =>
        this.employeesApi.getAll().pipe(
          map((employees) => EmployeesActions.loadEmployeesSuccess({ employees })),
          catchError((err: HttpErrorResponse) =>
            of(EmployeesActions.loadEmployeesFailure({ error: err.error?.message ?? 'Failed to load employees.' })),
          ),
        ),
      ),
    ),
  );

  createEmployee$ = createEffect(() =>
    this.actions$.pipe(
      ofType(EmployeesActions.createEmployee),
      switchMap(({ payload }) =>
        this.employeesApi.create(payload).pipe(
          map((employee) => EmployeesActions.createEmployeeSuccess({ employee })),
          catchError((err: HttpErrorResponse) =>
            of(EmployeesActions.createEmployeeFailure({ error: err.error?.message ?? 'Failed to create employee.' })),
          ),
        ),
      ),
    ),
  );

  updateStatus$ = createEffect(() =>
    this.actions$.pipe(
      ofType(EmployeesActions.updateEmployeeStatus),
      switchMap(({ id, isActive }) =>
        this.employeesApi.updateStatus(id, isActive).pipe(
          map((employee) => EmployeesActions.updateEmployeeStatusSuccess({ employee })),
          catchError((err: HttpErrorResponse) =>
            of(
              EmployeesActions.updateEmployeeStatusFailure({
                error: err.error?.message ?? 'Failed to update employee status.',
              }),
            ),
          ),
        ),
      ),
    ),
  );
}
