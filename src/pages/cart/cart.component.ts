
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CartService } from '../../cart.service';
import { OrderItem } from '../../models';

@Component({
  selector: 'app-cart',
  templateUrl: './cart.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, RouterLink],
})
export class CartComponent {
  cartService = inject(CartService);

  updateQuantity(item: OrderItem, newQuantity: number) {
    this.cartService.updateQuantity(item.productId, newQuantity);
  }

  removeItem(item: OrderItem) {
    this.cartService.removeFromCart(item.productId);
  }
}
