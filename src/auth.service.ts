
import { Injectable, signal, PLATFORM_ID, Inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly isBrowser: boolean;
  isAuthenticated = signal<boolean>(false);

  constructor(
    @Inject(PLATFORM_ID) private platformId: object,
    private router: Router
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
    if (this.isBrowser) {
      this.isAuthenticated.set(sessionStorage.getItem('isAdminAuthenticated') === 'true');
    }
  }

  login(email: string, password: string): boolean {
    if (email === 'admin1@gmail.com' && password === 'admin123') {
      this.isAuthenticated.set(true);
      if (this.isBrowser) {
        sessionStorage.setItem('isAdminAuthenticated', 'true');
      }
      return true;
    }
    this.isAuthenticated.set(false);
    return false;
  }

  logout() {
    this.isAuthenticated.set(false);
    if (this.isBrowser) {
      sessionStorage.removeItem('isAdminAuthenticated');
    }
    this.router.navigate(['/admin/login']);
  }
}
