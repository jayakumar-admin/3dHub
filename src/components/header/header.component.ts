
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ThemeService } from '../../theme.service';
import { SearchService } from '../../search.service';
import { CartService } from '../../cart.service';
import { DataService } from '../../data.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, RouterLinkActive, CommonModule, FormsModule]
})
export class HeaderComponent {
  themeService = inject(ThemeService);
  searchService = inject(SearchService);
  cartService = inject(CartService);
  dataService = inject(DataService);
  
  settings = this.dataService.getSettings();
  isMenuOpen = signal(false);
  searchQuery = '';

  toggleMenu() {
    this.isMenuOpen.update(v => !v);
  }

  onSearchChange(query: string) {
    this.searchService.setSearchQuery(query);
  }

  toggleTheme() {
    this.themeService.toggleTheme();
  }
}