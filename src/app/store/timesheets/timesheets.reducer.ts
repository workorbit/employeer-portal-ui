import { createReducer, on } from '@ngrx/store';
import { TimesheetsActions } from './timesheets.actions';
import { Timesheet } from '../../shared/models/timesheet.model';

export interface TimesheetsState {
  timesheets: Timesheet[];
  loading: boolean;
  error: string | null;
}

export const initialTimesheetsState: TimesheetsState = {
  timesheets: [],
  loading: false,
  error: null,
};

export const timesheetsReducer = createReducer(
  initialTimesheetsState,

  on(TimesheetsActions.loadTimesheets, (state): TimesheetsState => ({ ...state, loading: true, error: null })),
  on(
    TimesheetsActions.loadTimesheetsSuccess,
    (state, { timesheets }): TimesheetsState => ({ ...state, timesheets, loading: false }),
  ),
  on(
    TimesheetsActions.loadTimesheetsFailure,
    (state, { error }): TimesheetsState => ({ ...state, loading: false, error }),
  ),

  on(
    TimesheetsActions.updateTimesheetStatusSuccess,
    (state, { timesheet }): TimesheetsState => ({
      ...state,
      timesheets: state.timesheets.map((item) => (item.id === timesheet.id ? timesheet : item)),
    }),
  ),
);
