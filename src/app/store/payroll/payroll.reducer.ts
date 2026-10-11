import { createReducer, on } from '@ngrx/store';
import { PayrollActions } from './payroll.actions';
import { PayrollClaim } from '../../shared/models/payroll.model';

export interface PayrollState {
  claims: PayrollClaim[];
  loading: boolean;
  error: string | null;
}

export const initialPayrollState: PayrollState = {
  claims: [],
  loading: false,
  error: null,
};

export const payrollReducer = createReducer(
  initialPayrollState,

  on(PayrollActions.loadPayrollClaims, (state): PayrollState => ({ ...state, loading: true, error: null })),
  on(
    PayrollActions.loadPayrollClaimsSuccess,
    (state, { claims }): PayrollState => ({ ...state, claims, loading: false }),
  ),
  on(
    PayrollActions.loadPayrollClaimsFailure,
    (state, { error }): PayrollState => ({ ...state, loading: false, error }),
  ),

  on(
    PayrollActions.updatePayrollClaimStatusSuccess,
    (state, { claim }): PayrollState => ({
      ...state,
      claims: state.claims.map((item) => (item.id === claim.id ? claim : item)),
    }),
  ),

  on(
    PayrollActions.markPayrollClaimPaidSuccess,
    (state, { claim }): PayrollState => ({
      ...state,
      claims: state.claims.map((item) => (item.id === claim.id ? claim : item)),
    }),
  ),
);
