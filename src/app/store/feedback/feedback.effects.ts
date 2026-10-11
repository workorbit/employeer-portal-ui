import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { HttpErrorResponse } from '@angular/common/http';
import { catchError, map, of, switchMap } from 'rxjs';
import { FeedbackApiService } from '../../core/api/feedback-api.service';
import { FeedbackActions } from './feedback.actions';

@Injectable()
export class FeedbackEffects {
  private readonly actions$ = inject(Actions);
  private readonly feedbackApi = inject(FeedbackApiService);

  loadFeedback$ = createEffect(() =>
    this.actions$.pipe(
      ofType(FeedbackActions.loadFeedback),
      switchMap(() =>
        this.feedbackApi.getAll().pipe(
          map((items) => FeedbackActions.loadFeedbackSuccess({ items })),
          catchError((err: HttpErrorResponse) =>
            of(
              FeedbackActions.loadFeedbackFailure({
                error: err.error?.message ?? 'Failed to load feedback.',
              }),
            ),
          ),
        ),
      ),
    ),
  );

  replyToFeedback$ = createEffect(() =>
    this.actions$.pipe(
      ofType(FeedbackActions.replyToFeedback),
      switchMap(({ id, payload }) =>
        this.feedbackApi.reply(id, payload).pipe(
          map((item) => FeedbackActions.replyToFeedbackSuccess({ item })),
          catchError((err: HttpErrorResponse) =>
            of(
              FeedbackActions.replyToFeedbackFailure({
                error: err.error?.message ?? 'Failed to send reply.',
              }),
            ),
          ),
        ),
      ),
    ),
  );
}
