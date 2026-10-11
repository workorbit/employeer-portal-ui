import { createFeatureSelector, createSelector } from '@ngrx/store';
import { TimesheetsState } from './timesheets.reducer';

export const selectTimesheetsState = createFeatureSelector<TimesheetsState>('timesheets');

export const selectTimesheets = createSelector(selectTimesheetsState, (state) => state.timesheets);
export const selectTimesheetsLoading = createSelector(selectTimesheetsState, (state) => state.loading);
export const selectTimesheetsError = createSelector(selectTimesheetsState, (state) => state.error);
