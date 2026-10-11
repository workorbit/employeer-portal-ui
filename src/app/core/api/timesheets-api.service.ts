import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Timesheet, TimesheetStatus, UpdateTimesheetStatusPayload } from '../../shared/models/timesheet.model';

@Injectable({ providedIn: 'root' })
export class TimesheetsApiService {
  private readonly baseUrl = environment.timesheetsServiceUrl;

  constructor(private readonly http: HttpClient) {}

  getAll(status?: TimesheetStatus): Observable<{ items: Timesheet[]; total: number }> {
    let params = new HttpParams();
    if (status) params = params.set('status', status);
    return this.http.get<{ items: Timesheet[]; total: number }>(`${this.baseUrl}/timesheets`, { params });
  }

  updateStatus(id: string, payload: UpdateTimesheetStatusPayload): Observable<Timesheet> {
    return this.http.patch<Timesheet>(`${this.baseUrl}/timesheets/${id}/status`, payload);
  }
}
