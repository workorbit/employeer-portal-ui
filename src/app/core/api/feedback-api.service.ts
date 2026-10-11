import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Feedback, ReplyFeedbackPayload } from '../../shared/models/feedback.model';

@Injectable({ providedIn: 'root' })
export class FeedbackApiService {
  private readonly baseUrl = environment.feedbackServiceUrl;

  constructor(private readonly http: HttpClient) {}

  // Employer/admin tokens scope this to the whole company's inbox server-side.
  getAll(): Observable<Feedback[]> {
    return this.http.get<Feedback[]>(`${this.baseUrl}/feedback`);
  }

  reply(id: string, payload: ReplyFeedbackPayload): Observable<Feedback> {
    return this.http.patch<Feedback>(`${this.baseUrl}/feedback/${id}/status`, payload);
  }
}
