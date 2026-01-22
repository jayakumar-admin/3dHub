
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { DataService } from '../../data.service';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { NotificationService } from '../../notification.service';

@Component({
  selector: 'app-contact',
  templateUrl: './contact.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, CommonModule],
})
export class ContactComponent {
  dataService = inject(DataService);
  fb: FormBuilder = inject(FormBuilder);
  notificationService = inject(NotificationService);
  settings = this.dataService.getSettings();
  
  isSubmitting = signal(false);

  contactForm = this.fb.group({
    name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    message: ['', Validators.required],
  });

  sendMessage() {
    if (this.contactForm.invalid) {
      this.contactForm.markAllAsTouched();
      this.notificationService.show('Please fill out all fields correctly.', 'error');
      return;
    }
    
    this.isSubmitting.set(true);
    const formData = this.contactForm.getRawValue() as { name: string, email: string, message: string };

    this.dataService.submitContactForm(formData).subscribe({
      next: () => {
        this.notificationService.show('Thank you for your message! We will get back to you soon.', 'success');
        this.contactForm.reset();
        this.isSubmitting.set(false);
      },
      error: (err) => {
        // Error is handled by the DataService's global error handler
        console.error('Failed to send message:', err);
        this.isSubmitting.set(false);
      }
    });
  }

  get name() { return this.contactForm.get('name'); }
  get email() { return this.contactForm.get('email'); }
  get message() { return this.contactForm.get('message'); }
}