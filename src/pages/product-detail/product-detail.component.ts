
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DataService } from '../../data.service';
import { map } from 'rxjs/operators';
import { CommonModule } from '@angular/common';
import { toSignal } from '@angular/core/rxjs-interop';
import { CartService } from '../../cart.service';

@Component({
  selector: 'app-product-detail',
  templateUrl: './product-detail.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, RouterLink]
})
export class ProductDetailComponent {
  route = inject(ActivatedRoute);
  dataService = inject(DataService);
  cartService = inject(CartService);

  private productIdSignal = toSignal(
    this.route.paramMap.pipe(map(params => params.get('id')))
  );

  product = computed(() => {
    const id = this.productIdSignal();
    return id ? this.dataService.getProductById(id) : undefined;
  });
  
  selectedImage = signal<string | undefined>(undefined);
  quantity = signal(1);
  itemAdded = signal(false);

  discount = computed(() => {
    const p = this.product();
    if (!p || !p.oldPrice || p.oldPrice <= p.price) {
      return null;
    }
    const savedAmount = p.oldPrice - p.price;
    const percentage = Math.round((savedAmount / p.oldPrice) * 100);
    return { savedAmount, percentage };
  });

  constructor() {
    // Effect to update selected image when product loads
    computed(() => {
        const p = this.product();
        if(p && p.images.length > 0) {
            this.selectedImage.set(p.images[0]);
        }
    });
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
    if (p) {
      this.cartService.addToCart(p, this.quantity());
      this.itemAdded.set(true);
      setTimeout(() => this.itemAdded.set(false), 2000); // Hide message after 2 seconds
    }
  }
}