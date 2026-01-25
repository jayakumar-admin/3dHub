
import { ChangeDetectionStrategy, Component, computed, inject, signal, effect } from '@angular/core';
// FIX: Import ParamMap to correctly type route parameters.
import { ActivatedRoute, ParamMap, RouterLink } from '@angular/router';
import { DataService } from '../../data.service';
import { map } from 'rxjs/operators';
import { CommonModule } from '@angular/common';
import { toSignal } from '@angular/core/rxjs-interop';
import { CartService } from '../../cart.service';
import { ProductCardComponent } from '../../components/product-card/product-card.component';
import { Review } from '../../models';

@Component({
  selector: 'app-product-detail',
  templateUrl: './product-detail.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, RouterLink, ProductCardComponent]
})
export class ProductDetailComponent {
  route = inject(ActivatedRoute);
  dataService = inject(DataService);
  cartService = inject(CartService);

  private productIdSignal = toSignal(
    // FIX: Explicitly type `params` as `ParamMap` to resolve `get` method.
    this.route.paramMap.pipe(map((params: ParamMap) => params.get('id')))
  );

  product = computed(() => {
    const id = this.productIdSignal();
    return id ? this.dataService.getProductById(id) : undefined;
  });
  
  reviews = signal<Review[]>([]);
  selectedImage = signal<string | undefined>(undefined);
  quantity = signal(1);
  itemAdded = signal(false);
  activeTab = signal<'description' | 'info' | 'reviews'>('description');

  discount = computed(() => {
    const p = this.product();
    if (!p || !p.oldPrice || p.oldPrice <= p.price) {
      return null;
    }
    const savedAmount = p.oldPrice - p.price;
    const percentage = Math.round((savedAmount / p.oldPrice) * 100);
    return { savedAmount, percentage };
  });

  relatedProducts = computed(() => {
    const p = this.product();
    if (!p) return [];
    
    return this.dataService.getProducts()()
      .filter(prod => prod.category === p.category && prod.id !== p.id)
      .slice(0, 4);
  });

  constructor() {
    // Effect to update selected image when product loads
    effect(() => {
        const p = this.product();
        if(p && p.images.length > 0 && !this.selectedImage()) {
            this.selectedImage.set(p.images[0]);
        }
    });

    // Effect to fetch reviews when product changes
    effect(() => {
      const id = this.productIdSignal();
      if (id) {
        this.dataService.getReviews(id).subscribe(reviews => {
          this.reviews.set(reviews);
        });
      }
    }, { allowSignalWrites: true });
  }

  setTab(tab: 'description' | 'info' | 'reviews') {
    this.activeTab.set(tab);
  }

  selectImage(imageUrl: string) {
    this.selectedImage.set(imageUrl);
  }

  incrementQuantity() {
    const stock = this.product()?.stock ?? 1;
    this.quantity.update(q => Math.min(stock, q + 1));
  }

  decrementQuantity() {
    this.quantity.update(q => Math.max(1, q - 1));
  }

  addToCart() {
    const p = this.product();
    if (p && p.stock > 0) {
      this.cartService.addToCart(p, this.quantity());
      this.itemAdded.set(true);
      setTimeout(() => this.itemAdded.set(false), 2000); // Hide message after 2 seconds
    }
  }
}