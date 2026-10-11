import { createFeatureSelector, createSelector } from '@ngrx/store';
import { PayrollState } from './payroll.reducer';

export const selectPayrollState = createFeatureSelector<PayrollState>('payroll');

export const selectPayrollClaims = createSelector(selectPayrollState, (state) => state.claims);
export const selectPayrollLoading = createSelector(selectPayrollState, (state) => state.loading);
export const selectPayrollError = createSelector(selectPayrollState, (state) => state.error);
