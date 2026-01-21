
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../auth.service';
import { CommonModule } from '@angular/common';
import { DataService } from '../../../data.service';

@Component({
  selector: 'app-admin-login',
  templateUrl: './login.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, ReactiveFormsModule, CommonModule],
})
export class AdminLoginComponent {
  router = inject(Router);
  fb: FormBuilder = inject(FormBuilder);
  authService = inject(AuthService);
  dataService = inject(DataService);

  loginError = signal<string | null>(null);

  loginForm = this.fb.group({
    email: ['admin1@gmail.com', [Validators.required, Validators.email]],
    password: ['12345678', [Validators.required]],
  });

  async login() {
    this.loginError.set(null);
    if (this.loginForm.valid) {
      const { email, password } = this.loginForm.value;
      const success = await this.authService.adminLogin(email!, password!);
      if (success) {
        this.dataService.loadAdminData();
        this.router.navigate(['/admin/dashboard']);
      } else {
        this.loginError.set('Invalid email or password.');
      }
    }
  }
}
