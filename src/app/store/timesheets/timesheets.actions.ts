import { createActionGroup, emptyProps, props } from '@ngrx/store';
import { Timesheet, UpdateTimesheetStatusPayload } from '../../shared/models/timesheet.model';

export const TimesheetsActions = createActionGroup({
  source: 'Timesheets',
  events: {
    'Load Timesheets': emptyProps(),
    'Load Timesheets Success': props<{ timesheets: Timesheet[] }>(),
    'Load Timesheets Failure': props<{ error: string }>(),

    'Update Timesheet Status': props<{ id: string; payload: UpdateTimesheetStatusPayload }>(),
    'Update Timesheet Status Success': props<{ timesheet: Timesheet }>(),
    'Update Timesheet Status Failure': props<{ error: string }>(),
  },
});
