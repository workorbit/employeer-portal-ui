import { createReducer, on } from '@ngrx/store';
import { EmployeesActions } from './employees.actions';
import { Employee } from '../../shared/models/employee.model';

export interface EmployeesState {
  employees: Employee[];
  loading: boolean;
  saving: boolean;
  error: string | null;
}

export const initialEmployeesState: EmployeesState = {
  employees: [],
  loading: false,
  saving: false,
  error: null,
};

export const employeesReducer = createReducer(
  initialEmployeesState,

  on(EmployeesActions.loadEmployees, (state): EmployeesState => ({ ...state, loading: true, error: null })),
  on(
    EmployeesActions.loadEmployeesSuccess,
    (state, { employees }): EmployeesState => ({ ...state, employees, loading: false }),
  ),
  on(
    EmployeesActions.loadEmployeesFailure,
    (state, { error }): EmployeesState => ({ ...state, loading: false, error }),
  ),

  on(EmployeesActions.createEmployee, (state): EmployeesState => ({ ...state, saving: true, error: null })),
  on(
    EmployeesActions.createEmployeeSuccess,
    (state, { employee }): EmployeesState => ({
      ...state,
      employees: [employee, ...state.employees],
      saving: false,
    }),
  ),
  on(
    EmployeesActions.createEmployeeFailure,
    (state, { error }): EmployeesState => ({ ...state, saving: false, error }),
  ),

  on(
    EmployeesActions.updateEmployeeStatusSuccess,
    (state, { employee }): EmployeesState => ({
      ...state,
      employees: state.employees.map((item) => (item.id === employee.id ? employee : item)),
    }),
  ),
);
