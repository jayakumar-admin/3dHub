
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, CommonModule, RouterLink],
})
export class LoginComponent {
  fb: FormBuilder = inject(FormBuilder);
  router = inject(Router);
  authService = inject(AuthService);
  route = inject(ActivatedRoute);

  isLoading = signal(false);
  loginError = signal<string | null>(null);

  loginForm = this.fb.group({
    email: ['alice.j@example.com', [Validators.required, Validators.email]],
    password: ['password123', [Validators.required]],
  });

  async login() {
    if (this.loginForm.invalid) {
      return;
    }
    this.isLoading.set(true);
    this.loginError.set(null);
    
    try {
      const { email, password } = this.loginForm.value;
      const success = await this.authService.userLogin(email!, password!);
      if (success) {
        const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/home';
        this.router.navigateByUrl(returnUrl);
      } else {
        this.loginError.set('Invalid email or password. Please try again.');
      }
    } catch (err) {
      this.loginError.set('An unexpected error occurred. Please try again later.');
    } finally {
      this.isLoading.set(false);
    }
  }
}
