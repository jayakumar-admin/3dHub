import { Injectable, signal, PLATFORM_ID, Inject, inject, computed, Injector } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from './environments/environment';
import { User } from './models';
import { DataService } from './data.service';
import { MOCK_USERS } from './data/mock-data';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly isBrowser: boolean;
  private http = inject(HttpClient);
  private router = inject(Router);
  private injector = inject(Injector);
  
  private get dataService(): DataService {
    return this.injector.get(DataService);
  }
  
  private apiUrl = environment.apiUrl + '/auth';

  currentUser = signal<User | null>(null);
  private authToken = signal<string | null>(null);

  isLoggedIn = computed(() => !!this.currentUser());
  isAdmin = computed(() => this.currentUser()?.role === 'Admin');

  constructor(@Inject(PLATFORM_ID) private platformId: object) {
    this.isBrowser = isPlatformBrowser(this.platformId);
    if (this.isBrowser) {
      const storedUser = sessionStorage.getItem('currentUser');
      const storedToken = sessionStorage.getItem('authToken');
      if (storedUser && storedToken) {
        this.currentUser.set(JSON.parse(storedUser));
        this.authToken.set(storedToken);
      }
    }
  }

  async adminLogin(email: string, password: string): Promise<boolean> {
    if (environment.useTestData) {
      const user = this.dataService.getUsers()().find(u => u.email === email);
      if (user && user.role === 'Admin' && user.password === password) {
        this.setSession(user, 'mock-admin-token');
        return true;
      }
      return false;
    } else {
      // Live mode with API
      return this.authenticate(email, password, `${this.apiUrl}/login`);
    }
  }
  
  async userLogin(email: string, password: string): Promise<boolean> {
     if (environment.useTestData) {
      const user = this.dataService.getUsers()().find(u => u.email === email && u.password === password);
      if (user) {
        this.setSession(user, `mock-user-token-${user.id}`);
        return true;
      }
      return false;
    } else {
      // Live mode with API (assuming a different endpoint for user login)
      return this.authenticate(email, password, `${this.apiUrl}/user/login`);
    }
  }
  
  async signUp(userData: Partial<User>): Promise<boolean> {
    if (environment.useTestData) {
      const newUser: User = {
        id: `user${Date.now()}`,
        name: userData.name!,
        email: userData.email!,
        password: userData.password!, // In real app, this would be hashed
        avatar: `https://picsum.photos/seed/${userData.name}/100/100`,
        role: 'Customer',
        joinedDate: new Date().toISOString().split('T')[0],
        // FIX: Include phone number when creating a new mock user.
        phone: userData.phone
      };
      this.dataService.createUser(newUser).subscribe();
      this.setSession(newUser, `mock-user-token-${newUser.id}`);
      return true;
    } else {
      try {
        await firstValueFrom(this.http.post<User>(`${this.apiUrl}/user/signup`, userData));
        // After successful signup, log the user in
        return this.userLogin(userData.email!, userData.password!);
      } catch (error) {
        console.error('Signup failed', error);
        return false;
      }
    }
  }

  async updateProfile(userData: Partial<User>): Promise<boolean> {
    try {
      // In test data mode, just update the signal
      if (environment.useTestData) {
          this.currentUser.update(u => u ? { ...u, ...userData } : null);
          return true;
      }
      
      const updatedUser = await firstValueFrom(this.dataService.updateUserProfile(userData));
      const userToStore = { ...this.currentUser()!, ...updatedUser };
      this.setSession(userToStore, this.getToken()!);
      return true;
    } catch(error) {
      console.error("Profile update failed", error);
      return false;
    }
  }

  async changePassword(currentPassword: string, newPassword: string): Promise<{ success: boolean; message: string }> {
    if (environment.useTestData) {
        // Mock implementation
        const user = this.currentUser();
        if (user && user.password === currentPassword) {
            user.password = newPassword;
            return { success: true, message: 'Password changed successfully!' };
        } else {
            return { success: false, message: 'Incorrect current password.' };
        }
    }

    try {
        const response = await firstValueFrom(this.http.post<{ message: string }>(
            `${this.apiUrl}/change-password`, 
            { currentPassword, newPassword }, 
            this.getAuthHeaders()
        ));
        return { success: true, message: response.message };
    } catch (error: any) {
        return { success: false, message: error.error?.message || 'An unknown error occurred.' };
    }
  }

  private async authenticate(email: string, password: string, url: string): Promise<boolean> {
      try {
        const response = await firstValueFrom(this.http.post<{ token: string, user: User }>(url, { email, password }));
        if (response && response.token && response.user) {
          this.setSession(response.user, response.token);
          return true;
        }
        return false;
      } catch (error) {
        console.error('Authentication failed', error);
        return false;
      }
  }

  logout() {
    this.currentUser.set(null);
    this.authToken.set(null);
    if (this.isBrowser) {
      sessionStorage.removeItem('currentUser');
      sessionStorage.removeItem('authToken');
    }
    this.router.navigate(['/home']);
  }

  private setSession(user: User, token: string) {
    // Remove password from user object before storing
    const { password, ...userToStore } = user;
    this.currentUser.set(userToStore as User);
    this.authToken.set(token);
    if (this.isBrowser) {
      sessionStorage.setItem('currentUser', JSON.stringify(userToStore));
      sessionStorage.setItem('authToken', token);
    }
  }
  
  private getAuthHeaders(): { headers: HttpHeaders } {
    const token = this.getToken();
    if (!token) return { headers: new HttpHeaders() };
    return { headers: new HttpHeaders({ 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }) };
  }

  getToken(): string | null {
    return this.authToken();
  }
}