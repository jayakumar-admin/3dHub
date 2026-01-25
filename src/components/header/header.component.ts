
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ThemeService } from '../../theme.service';
import { SearchService } from '../../search.service';
import { CartService } from '../../cart.service';
import { DataService } from '../../data.service';
import { AuthService } from '../../auth.service';
import { WishlistService } from '../../wishlist.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, RouterLinkActive, CommonModule, FormsModule, NgOptimizedImage]
})
export class HeaderComponent {
  themeService = inject(ThemeService);
  searchService = inject(SearchService);
  cartService = inject(CartService);
  wishlistService = inject(WishlistService);
  dataService = inject(DataService);
  authService = inject(AuthService);
  router = inject(Router);
  
  settings = this.dataService.getSettings();
  currentUser = this.authService.currentUser;
  isAdmin = this.authService.isAdmin;
  
  isMenuOpen = signal(false);
  isProfileMenuOpen = signal(false);
  searchQuery = '';

  toggleMenu() {
    this.isMenuOpen.update(v => !v);
  }
  
  toggleProfileMenu() {
    this.isProfileMenuOpen.update(v => !v);
  }

  onSearchChange(query: string) {
    this.searchService.setSearchQuery(query);
  }

  toggleTheme() {
    this.themeService.toggleTheme();
  }

  logout() {
    if (this.isAdmin()) {
      this.dataService.clearAdminData();
    }
    this.authService.logout();
    this.isProfileMenuOpen.set(false);
    this.router.navigate(['/home']);
  }
}
