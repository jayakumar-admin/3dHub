
import { ChangeDetectionStrategy, Component, computed, inject, signal, OnInit, OnDestroy } from '@angular/core';
import { DataService } from '../../data.service';
import { ProductCardComponent } from '../../components/product-card/product-card.component';
import { CommonModule } from '@angular/common';
import { SearchService } from '../../search.service';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ProductCardComponent, CommonModule, RouterLink],
})
export class HomeComponent implements OnInit, OnDestroy {
  dataService = inject(DataService);
  searchService = inject(SearchService);

  private settings = this.dataService.getSettings();
  categories = this.dataService.getCategories();
  private allProducts = this.dataService.getProducts();
  private intervalId?: number;
  
  currentSlideIndex = signal(0);

  // Dynamic content from settings
  heroSection = computed(() => this.settings().homePage.heroSection);
  heroSlides = computed(() => this.heroSection().slides);
  featuresSection = computed(() => this.settings().homePage.featuresSection);
  testimonialsSection = computed(() => this.settings().homePage.testimonialsSection);

  filteredProducts = computed(() => {
    const query = this.searchService.searchQuery().toLowerCase();
    const products = this.allProducts();
    if (!query) {
      return products.slice(0, 4); // Show first 4 as featured
    }
    return products.filter(p => p.name.toLowerCase().includes(query));
  });

  ngOnInit() {
    this.startAutoplay();
  }

  ngOnDestroy() {
    this.stopAutoplay();
  }

  startAutoplay() {
    this.stopAutoplay();
    if (this.heroSlides().length > 1) {
      this.intervalId = window.setInterval(() => {
        this.nextSlide(true);
      }, 5000);
    }
  }

  stopAutoplay() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

  nextSlide(isAuto = false) {
    this.currentSlideIndex.update(i => (i + 1) % this.heroSlides().length);
    if (!isAuto) {
      this.startAutoplay();
    }
  }

  prevSlide() {
    this.currentSlideIndex.update(i => (i - 1 + this.heroSlides().length) % this.heroSlides().length);
    this.startAutoplay();
  }

  goToSlide(index: number) {
    this.currentSlideIndex.set(index);
    this.startAutoplay();
  }
}