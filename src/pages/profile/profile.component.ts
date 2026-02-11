import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../auth.service';
import { DataService } from '../../data.service';
import { NotificationService } from '../../notification.service';
import { User } from '../../models';

// Custom validator to check if two fields match
export function passwordMatchValidator(controlName: string, matchingControlName: string) {
  return (formGroup: AbstractControl): ValidationErrors | null => {
    const control = formGroup.get(controlName);
    const matchingControl = formGroup.get(matchingControlName);

    if (matchingControl?.errors && !matchingControl.errors['passwordMismatch']) {
      return null;
    }

    if (control?.value !== matchingControl?.value) {
      matchingControl?.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    } else {
      matchingControl?.setErrors(null);
      return null;
    }
  };
}


@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, ReactiveFormsModule],
})
export class ProfileComponent implements OnInit {
  authService = inject(AuthService);
  dataService = inject(DataService);
  fb = inject(FormBuilder);
  notificationService = inject(NotificationService);

  activeTab = signal<'details' | 'password'>('details');
  currentUser = this.authService.currentUser;

  detailsForm!: FormGroup;
  passwordForm!: FormGroup;

  isSavingDetails = signal(false);
  isSavingPassword = signal(false);
  isUploadingAvatar = signal(false);

  constructor() {
    this.detailsForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]],
    });

    this.passwordForm = this.fb.group({
      currentPassword: ['', Validators.required],
      newPassword: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', Validators.required]
    }, { validators: passwordMatchValidator('newPassword', 'confirmPassword') });
  }

  ngOnInit() {
    const user = this.currentUser();
    if (user) {
      this.detailsForm.patchValue({
        name: user.name,
        email: user.email,
        phone: user.phone || ''
      });
    }
  }

  setTab(tab: 'details' | 'password') {
    this.activeTab.set(tab);
  }

  onFileChange(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
 const user = this.currentUser();
    this.isUploadingAvatar.set(true);
    this.dataService.uploadImage(file, 'avatars').subscribe({
      next: async (res) => {
        await this.authService.updateProfile({   name: user.name,
        email: user.email,
        phone: user.phone || '', avatar: res.imageUrl });
        this.notificationService.show('Profile picture updated!', 'success');
      },
      error: (err) => {
        this.notificationService.show('Image upload failed. Please try again.', 'error');
        console.error(err);
      },
      complete: () => {
        this.isUploadingAvatar.set(false);
      }
    });
  }

  async saveDetails() {
    if (this.detailsForm.invalid) {
      this.notificationService.show('Please fill all fields correctly.', 'error');
      return;
    }
    this.isSavingDetails.set(true);
    const success = await this.authService.updateProfile(this.detailsForm.value);
    if (success) {
      this.notificationService.show('Profile details updated successfully!', 'success');
    } else {
      this.notificationService.show('Failed to update profile. Please try again.', 'error');
    }
    this.isSavingDetails.set(false);
  }

  async savePassword() {
    if (this.passwordForm.invalid) {
      this.notificationService.show('Please correct the errors in the form.', 'error');
      return;
    }
    this.isSavingPassword.set(true);
    const { currentPassword, newPassword } = this.passwordForm.value;
    const result = await this.authService.changePassword(currentPassword, newPassword);

    if (result.success) {
      this.notificationService.show(result.message, 'success');
      this.passwordForm.reset();
    } else {
      this.notificationService.show(result.message, 'error');
    }
    this.isSavingPassword.set(false);
  }

  // Getters for easy template access
  get name() { return this.detailsForm.get('name'); }
  get email() { return this.detailsForm.get('email'); }
  get phone() { return this.detailsForm.get('phone'); }
  get currentPassword() { return this.passwordForm.get('currentPassword'); }
  get newPassword() { return this.passwordForm.get('newPassword'); }
  get confirmPassword() { return this.passwordForm.get('confirmPassword'); }
}
