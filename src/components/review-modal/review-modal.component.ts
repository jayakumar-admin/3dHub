
import { ChangeDetectionStrategy, Component, inject, input, output, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { DataService } from '../../data.service';
import { NotificationService } from '../../notification.service';

@Component({
  selector: 'app-review-modal',
  templateUrl: './review-modal.component.html',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReviewModalComponent {
  productName = input.required<string>();
  productId = input.required<string>();
  orderId = input.required<string>();
  close = output<void>();
  submitted = output<void>();

  fb = inject(FormBuilder);
  dataService = inject(DataService);
  notificationService = inject(NotificationService);

  isSubmitting = signal(false);
  rating = signal(0);
  hoverRating = signal(0);
  
  reviewForm = this.fb.group({
    comment: ['', Validators.required],
  });

  setRating(newRating: number) {
    this.rating.set(newRating);
  }

  setHoverRating(hover: number) {
    this.hoverRating.set(hover);
  }

  submitReview() {
    if (this.rating() === 0) {
      this.notificationService.show('Please select a star rating.', 'error');
      return;
    }
    if (this.reviewForm.invalid) {
      this.notificationService.show('Please write a comment for your review.', 'error');
      return;
    }

    this.isSubmitting.set(true);
    const { comment } = this.reviewForm.value;

    this.dataService.submitReview(this.productId(), this.orderId(), this.rating(), comment!)
      .subscribe({
        next: () => {
          this.submitted.emit();
        },
        error: (err) => {
          this.isSubmitting.set(false);
          // Error is handled by global handler in data service
          console.error('Failed to submit review', err);
        }
      });
  }

  closeModal() {
    this.close.emit();
  }
}