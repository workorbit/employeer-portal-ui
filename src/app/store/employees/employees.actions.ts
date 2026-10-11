import { createActionGroup, emptyProps, props } from '@ngrx/store';
import { CreateEmployeePayload, Employee } from '../../shared/models/employee.model';

export const EmployeesActions = createActionGroup({
  source: 'Employees',
  events: {
    'Load Employees': emptyProps(),
    'Load Employees Success': props<{ employees: Employee[] }>(),
    'Load Employees Failure': props<{ error: string }>(),

    'Create Employee': props<{ payload: CreateEmployeePayload }>(),
    'Create Employee Success': props<{ employee: Employee }>(),
    'Create Employee Failure': props<{ error: string }>(),

    'Update Employee Status': props<{ id: string; isActive: boolean }>(),
    'Update Employee Status Success': props<{ employee: Employee }>(),
    'Update Employee Status Failure': props<{ error: string }>(),
  },
});
