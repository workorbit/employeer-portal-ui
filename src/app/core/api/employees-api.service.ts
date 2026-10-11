import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CreateEmployeePayload, Employee } from '../../shared/models/employee.model';

@Injectable({ providedIn: 'root' })
export class EmployeesApiService {
  private readonly baseUrl = environment.employeesServiceUrl;

  constructor(private readonly http: HttpClient) {}

  getAll(filters: { department?: string; isActive?: boolean } = {}): Observable<Employee[]> {
    let params = new HttpParams();
    if (filters.department) params = params.set('department', filters.department);
    if (filters.isActive !== undefined) params = params.set('isActive', String(filters.isActive));
    return this.http.get<Employee[]>(`${this.baseUrl}/employees`, { params });
  }

  create(payload: CreateEmployeePayload): Observable<Employee> {
    return this.http.post<Employee>(`${this.baseUrl}/employees`, payload);
  }

  update(id: string, payload: Partial<CreateEmployeePayload>): Observable<Employee> {
    return this.http.put<Employee>(`${this.baseUrl}/employees/${id}`, payload);
  }

  updateStatus(id: string, isActive: boolean): Observable<Employee> {
    return this.http.patch<Employee>(`${this.baseUrl}/employees/${id}/status`, { isActive });
  }
}
