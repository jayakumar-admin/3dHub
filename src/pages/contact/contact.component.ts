
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { DataService } from '../../data.service';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-contact',
  templateUrl: './contact.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, CommonModule],
})
export class ContactComponent {
  dataService = inject(DataService);
  fb: FormBuilder = inject(FormBuilder);
  settings = this.dataService.getSettings();

  contactForm = this.fb.group({
    name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    message: ['', Validators.required],
  });

  sendMessage() {
    if (this.contactForm.valid) {
      console.log('Message sent:', this.contactForm.value);
      alert('Thank you for your message! We will get back to you soon.');
      this.contactForm.reset();
    } else {
      this.contactForm.markAllAsTouched();
    }
  }

  get name() { return this.contactForm.get('name'); }
  get email() { return this.contactForm.get('email'); }
  get message() { return this.contactForm.get('message'); }
}
