
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-admin-login',
  templateUrl: './login.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, ReactiveFormsModule, CommonModule],
})
export class AdminLoginComponent {
  router = inject(Router);
  // FIX: Explicitly type `fb` to prevent TypeScript from inferring it as `unknown`.
  fb: FormBuilder = inject(FormBuilder);
  authService = inject(AuthService);

  loginError = signal<string | null>(null);

  loginForm = this.fb.group({
    email: ['admin1@gmail.com', [Validators.required, Validators.email]],
    password: ['admin123', [Validators.required]],
  });

  login() {
    this.loginError.set(null);
    if (this.loginForm.valid) {
      const { email, password } = this.loginForm.value;
      const success = this.authService.login(email!, password!);
      if (success) {
        this.router.navigate(['/admin/dashboard']);
      } else {
        this.loginError.set('Invalid email or password.');
      }
    }
  }
}
