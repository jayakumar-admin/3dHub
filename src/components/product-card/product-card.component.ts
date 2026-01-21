
import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { Product } from '../../models';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { WishlistService } from '../../wishlist.service';
import { NotificationService } from '../../notification.service';
import { CartService } from '../../cart.service';
import { DataService } from '../../data.service';

@Component({
  selector: 'app-product-card',
  templateUrl: './product-card.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, RouterLink],
})
export class ProductCardComponent {
  product = input.required<Product>();
  wishlistService = inject(WishlistService);
  notificationService = inject(NotificationService);
  cartService = inject(CartService);
  dataService = inject(DataService);

  isInWishlist = computed(() => this.wishlistService.isInWishlist(this.product().id));

  discountPercent = computed(() => {
    const p = this.product();
    if (!p.oldPrice || p.oldPrice <= p.price) {
      return 0;
    }
    return Math.round(((p.oldPrice - p.price) / p.oldPrice) * 100);
  });

  toggleWishlist(event: Event, productId: string) {
    event.preventDefault();
    event.stopPropagation();
    this.wishlistService.toggleWishlist(productId);

    if (this.wishlistService.isInWishlist(productId)) {
      this.notificationService.show(`${this.product().name} added to wishlist!`);
    } else {
      this.notificationService.show(`${this.product().name} removed from wishlist.`);
    }
  }

  addToCart(event: Event) {
    event.preventDefault();
    event.stopPropagation();
    const p = this.product();
    if (p.stock > 0) {
      this.cartService.addToCart(p, 1);
      this.notificationService.show(`${p.name} added to cart!`, 'success');
    } else {
      this.notificationService.show(`${p.name} is out of stock.`, 'error');
    }
  }
}
