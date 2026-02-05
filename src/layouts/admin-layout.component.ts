import { ChangeDetectionStrategy, Component, signal, inject, OnInit, PLATFORM_ID } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../auth.service';
import { DataService } from '../data.service';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-admin-layout',
  templateUrl: './admin-layout.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
})
export class AdminLayoutComponent implements OnInit {
  isSidebarOpen = signal(false);
  authService = inject(AuthService);
  dataService = inject(DataService);
  private isBrowser: boolean;

  // FIX: Use inject() function for dependency injection instead of @Inject decorator in constructor.
  private platformId = inject(PLATFORM_ID);

  constructor() {
    this.isBrowser = isPlatformBrowser(this.platformId);
    if (this.isBrowser) {
      // Default sidebar to open on desktop, closed on mobile
      this.isSidebarOpen.set(window.innerWidth > 768);
    }
  }

  ngOnInit() {
    // If admin data isn't loaded (e.g., on page refresh), load it now.
    if (!this.dataService.isAdminDataLoaded()) {
      this.dataService.loadAdminData().subscribe({
        error: (err) => console.error('Failed to load admin data from Admin Layout', err)
      });
    }
  }

  toggleSidebar() {
    this.isSidebarOpen.update(v => !v);
  }
  
  closeSidebarOnMobile() {
    if (this.isBrowser && window.innerWidth < 768) {
      this.isSidebarOpen.set(false);
    }
  }

  logout() {
    this.dataService.clearAdminData();
    this.authService.logout();
  }
}
