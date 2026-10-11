import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { HttpErrorResponse } from '@angular/common/http';
import { catchError, map, of, switchMap } from 'rxjs';
import { PayrollApiService } from '../../core/api/payroll-api.service';
import { PayrollActions } from './payroll.actions';

@Injectable()
export class PayrollEffects {
  private readonly actions$ = inject(Actions);
  private readonly payrollApi = inject(PayrollApiService);

  loadPayrollClaims$ = createEffect(() =>
    this.actions$.pipe(
      ofType(PayrollActions.loadPayrollClaims),
      switchMap(() =>
        this.payrollApi.getAll().pipe(
          map(({ items }) => PayrollActions.loadPayrollClaimsSuccess({ claims: items })),
          catchError((err: HttpErrorResponse) =>
            of(
              PayrollActions.loadPayrollClaimsFailure({
                error: err.error?.message ?? 'Failed to load payroll claims.',
              }),
            ),
          ),
        ),
      ),
    ),
  );

  updateStatus$ = createEffect(() =>
    this.actions$.pipe(
      ofType(PayrollActions.updatePayrollClaimStatus),
      switchMap(({ id, payload }) =>
        this.payrollApi.updateStatus(id, payload).pipe(
          map((claim) => PayrollActions.updatePayrollClaimStatusSuccess({ claim })),
          catchError((err: HttpErrorResponse) =>
            of(
              PayrollActions.updatePayrollClaimStatusFailure({
                error: err.error?.message ?? 'Failed to update payroll claim status.',
              }),
            ),
          ),
        ),
      ),
    ),
  );

  markPaid$ = createEffect(() =>
    this.actions$.pipe(
      ofType(PayrollActions.markPayrollClaimPaid),
      switchMap(({ id }) =>
        this.payrollApi.markPaid(id).pipe(
          map((claim) => PayrollActions.markPayrollClaimPaidSuccess({ claim })),
          catchError((err: HttpErrorResponse) =>
            of(
              PayrollActions.markPayrollClaimPaidFailure({
                error: err.error?.message ?? 'Failed to mark payroll claim as paid.',
              }),
            ),
          ),
        ),
      ),
    ),
  );
}
