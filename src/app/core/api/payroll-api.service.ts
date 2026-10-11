import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  PayrollClaim,
  PayrollClaimStatus,
  UpdatePayrollClaimStatusPayload,
} from '../../shared/models/payroll.model';

@Injectable({ providedIn: 'root' })
export class PayrollApiService {
  private readonly baseUrl = environment.payrollServiceUrl;

  constructor(private readonly http: HttpClient) {}

  getAll(status?: PayrollClaimStatus): Observable<{ items: PayrollClaim[]; total: number }> {
    let params = new HttpParams();
    if (status) params = params.set('status', status);
    return this.http.get<{ items: PayrollClaim[]; total: number }>(`${this.baseUrl}/payroll`, { params });
  }

  updateStatus(id: string, payload: UpdatePayrollClaimStatusPayload): Observable<PayrollClaim> {
    return this.http.patch<PayrollClaim>(`${this.baseUrl}/payroll/${id}/status`, payload);
  }

  markPaid(id: string): Observable<PayrollClaim> {
    return this.http.patch<PayrollClaim>(`${this.baseUrl}/payroll/${id}/mark-paid`, {});
  }
}
