import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { HttpErrorResponse } from '@angular/common/http';
import { catchError, map, of, switchMap } from 'rxjs';
import { TimesheetsApiService } from '../../core/api/timesheets-api.service';
import { TimesheetsActions } from './timesheets.actions';

@Injectable()
export class TimesheetsEffects {
  private readonly actions$ = inject(Actions);
  private readonly timesheetsApi = inject(TimesheetsApiService);

  loadTimesheets$ = createEffect(() =>
    this.actions$.pipe(
      ofType(TimesheetsActions.loadTimesheets),
      switchMap(() =>
        this.timesheetsApi.getAll().pipe(
          map(({ items }) => TimesheetsActions.loadTimesheetsSuccess({ timesheets: items })),
          catchError((err: HttpErrorResponse) =>
            of(
              TimesheetsActions.loadTimesheetsFailure({
                error: err.error?.message ?? 'Failed to load timesheets.',
              }),
            ),
          ),
        ),
      ),
    ),
  );

  updateStatus$ = createEffect(() =>
    this.actions$.pipe(
      ofType(TimesheetsActions.updateTimesheetStatus),
      switchMap(({ id, payload }) =>
        this.timesheetsApi.updateStatus(id, payload).pipe(
          map((timesheet) => TimesheetsActions.updateTimesheetStatusSuccess({ timesheet })),
          catchError((err: HttpErrorResponse) =>
            of(
              TimesheetsActions.updateTimesheetStatusFailure({
                error: err.error?.message ?? 'Failed to update timesheet status.',
              }),
            ),
          ),
        ),
      ),
    ),
  );
}
