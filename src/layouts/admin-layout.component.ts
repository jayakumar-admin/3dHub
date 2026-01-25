
import { ChangeDetectionStrategy, Component, signal, inject, OnInit } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../auth.service';
import { DataService } from '../data.service';

@Component({
  selector: 'app-admin-layout',
  templateUrl: './admin-layout.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
})
export class AdminLayoutComponent implements OnInit {
  isSidebarOpen = signal(true);
  authService = inject(AuthService);
  dataService = inject(DataService);

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

  logout() {
    this.dataService.clearAdminData();
    this.authService.logout();
  }
}
