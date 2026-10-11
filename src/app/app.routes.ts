import { Routes } from '@angular/router';
import { authGuard } from './core/auth/auth.guard';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'dashboard',
  },
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login').then((m) => m.Login),
  },
  {
    path: 'dashboard',
    canActivate: [authGuard],
    loadComponent: () => import('./features/dashboard/dashboard').then((m) => m.Dashboard),
  },
  {
    path: 'employees',
    canActivate: [authGuard],
    loadComponent: () => import('./features/employees/employees').then((m) => m.Employees),
  },
  {
    path: 'employees/:id',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/employee-detail/employee-detail').then((m) => m.EmployeeDetail),
  },
  {
    path: 'feedback-inbox',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/feedback-inbox/feedback-inbox').then((m) => m.FeedbackInbox),
  },
  {
    path: 'company-settings',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/company-settings/company-settings').then((m) => m.CompanySettings),
  },
  { path: '**', redirectTo: 'dashboard' },
];
