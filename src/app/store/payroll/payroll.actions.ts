import { createActionGroup, emptyProps, props } from '@ngrx/store';
import { PayrollClaim, UpdatePayrollClaimStatusPayload } from '../../shared/models/payroll.model';

export const PayrollActions = createActionGroup({
  source: 'Payroll',
  events: {
    'Load Payroll Claims': emptyProps(),
    'Load Payroll Claims Success': props<{ claims: PayrollClaim[] }>(),
    'Load Payroll Claims Failure': props<{ error: string }>(),

    'Update Payroll Claim Status': props<{ id: string; payload: UpdatePayrollClaimStatusPayload }>(),
    'Update Payroll Claim Status Success': props<{ claim: PayrollClaim }>(),
    'Update Payroll Claim Status Failure': props<{ error: string }>(),

    'Mark Payroll Claim Paid': props<{ id: string }>(),
    'Mark Payroll Claim Paid Success': props<{ claim: PayrollClaim }>(),
    'Mark Payroll Claim Paid Failure': props<{ error: string }>(),
  },
});
