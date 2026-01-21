
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../auth.service';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, CommonModule, RouterLink],
})
export class SignupComponent {
  fb: FormBuilder = inject(FormBuilder);
  router = inject(Router);
  authService = inject(AuthService);

  isLoading = signal(false);
  signupError = signal<string | null>(null);

  signupForm = this.fb.group({
    name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    phone: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]],
    password: ['', [Validators.required, Validators.minLength(8)]],
  });

  async signup() {
    if (this.signupForm.invalid) {
      return;
    }
    this.isLoading.set(true);
    this.signupError.set(null);
    
    try {
      const { name, email, phone, password } = this.signupForm.value;
      const success = await this.authService.signUp({ name, email, phone, password });
      
      if (success) {
        this.router.navigate(['/home']);
      } else {
        this.signupError.set('Could not create account. The email might already be in use.');
      }
    } catch (err) {
      this.signupError.set('An unexpected error occurred. Please try again later.');
    } finally {
      this.isLoading.set(false);
    }
  }
  
  // Getters for template validation
  get name() { return this.signupForm.get('name'); }
  get email() { return this.signupForm.get('email'); }
  get phone() { return this.signupForm.get('phone'); }
  get password() { return this.signupForm.get('password'); }
}
