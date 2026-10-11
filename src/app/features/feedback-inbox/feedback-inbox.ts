import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Store } from '@ngrx/store';
import { AppShell } from '../../shared/components/app-shell/app-shell';
import { Icon } from '../../shared/components/icon/icon';
import { FeedbackActions } from '../../store/feedback/feedback.actions';
import { selectFeedbackItems, selectFeedbackLoading } from '../../store/feedback/feedback.selectors';
import { EmployeesActions } from '../../store/employees/employees.actions';
import { selectEmployees } from '../../store/employees/employees.selectors';
import { Feedback, FeedbackCategory, FeedbackStatus } from '../../shared/models/feedback.model';

const CATEGORY_LABELS: Record<FeedbackCategory, string> = {
  [FeedbackCategory.PAYROLL]: 'Payroll',
  [FeedbackCategory.TIMESHEET]: 'Timesheet',
  [FeedbackCategory.PORTAL_BUG]: 'Portal Bug',
  [FeedbackCategory.GENERAL]: 'General',
};

type StatusFilter = FeedbackStatus | 'all';

@Component({
  selector: 'app-feedback-inbox',
  standalone: true,
  imports: [FormsModule, DatePipe, AppShell, Icon],
  templateUrl: './feedback-inbox.html',
  styleUrl: './feedback-inbox.scss',
})
export class FeedbackInbox implements OnInit {
  private readonly store = inject(Store);

  protected readonly FeedbackStatus = FeedbackStatus;

  protected readonly items = this.store.selectSignal(selectFeedbackItems);
  protected readonly loading = this.store.selectSignal(selectFeedbackLoading);
  protected readonly employees = this.store.selectSignal(selectEmployees);

  protected readonly openCount = computed(
    () => this.items().filter((item) => item.status === FeedbackStatus.OPEN).length,
  );
  protected readonly inReviewCount = computed(
    () => this.items().filter((item) => item.status === FeedbackStatus.IN_REVIEW).length,
  );
  protected readonly resolvedCount = computed(
    () => this.items().filter((item) => item.status === FeedbackStatus.RESOLVED).length,
  );

  protected readonly statusFilter = signal<StatusFilter>('all');

  protected readonly filteredItems = computed(() => {
    const sorted = [...this.items()].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    const filter = this.statusFilter();
    return filter === 'all' ? sorted : sorted.filter((item) => item.status === filter);
  });

  protected readonly messageById = signal<Record<string, string>>({});

  ngOnInit(): void {
    this.store.dispatch(FeedbackActions.loadFeedback());
    this.store.dispatch(EmployeesActions.loadEmployees());
  }

  setStatusFilter(filter: StatusFilter): void {
    this.statusFilter.set(filter);
  }

  employeeName(employeeId: string): string {
    return this.employees().find((employee) => employee.id === employeeId)?.name || employeeId;
  }

  categoryLabel(category: FeedbackCategory): string {
    return CATEGORY_LABELS[category] ?? category;
  }

  messageFor(id: string): string {
    return this.messageById()[id] ?? '';
  }

  setMessage(id: string, value: string): void {
    this.messageById.update((map) => ({ ...map, [id]: value }));
  }

  canReply(item: Feedback): boolean {
    return this.messageFor(item.id).trim().length > 0;
  }

  reply(item: Feedback, status: FeedbackStatus.IN_REVIEW | FeedbackStatus.RESOLVED): void {
    const message = this.messageFor(item.id).trim();
    if (!message) return;
    this.store.dispatch(FeedbackActions.replyToFeedback({ id: item.id, payload: { status, message } }));
    this.setMessage(item.id, '');
  }
}
