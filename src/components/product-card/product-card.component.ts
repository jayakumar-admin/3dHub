
import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { Product } from '../../models';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-product-card',
  templateUrl: './product-card.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, RouterLink],
})
export class ProductCardComponent {
  product = input.required<Product>();

  discountPercent = computed(() => {
    const p = this.product();
    if (!p.oldPrice || p.oldPrice <= p.price) {
      return 0;
    }
    return Math.round(((p.oldPrice - p.price) / p.oldPrice) * 100);
  });

  addToWishlist(productId: string) {
    // This is a placeholder for wishlist functionality
    console.log(`Product ${productId} added to wishlist.`);
    // In a real app, you would call a service to handle this.
  }
}