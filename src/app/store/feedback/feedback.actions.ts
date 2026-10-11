import { createActionGroup, emptyProps, props } from '@ngrx/store';
import { Feedback, ReplyFeedbackPayload } from '../../shared/models/feedback.model';

export const FeedbackActions = createActionGroup({
  source: 'Feedback',
  events: {
    'Load Feedback': emptyProps(),
    'Load Feedback Success': props<{ items: Feedback[] }>(),
    'Load Feedback Failure': props<{ error: string }>(),

    'Reply To Feedback': props<{ id: string; payload: ReplyFeedbackPayload }>(),
    'Reply To Feedback Success': props<{ item: Feedback }>(),
    'Reply To Feedback Failure': props<{ error: string }>(),
  },
});
