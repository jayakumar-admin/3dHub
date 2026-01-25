
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CartService } from '../../cart.service';
import { OrderItem } from '../../models';
import { DataService } from '../../data.service';
import { NotificationService } from '../../notification.service';

@Component({
  selector: 'app-cart',
  templateUrl: './cart.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, RouterLink],
})
export class CartComponent {
  cartService = inject(CartService);
  dataService = inject(DataService);
  notificationService = inject(NotificationService);

  getStockForProduct(productId: string): number {
    const product = this.dataService.getProductById(productId);
    return product ? product.stock : 0;
  }

  updateQuantity(item: OrderItem, event: Event) {
    const inputElement = event.target as HTMLInputElement;
    let newQuantity = parseInt(inputElement.value, 10);

    const product = this.dataService.getProductById(item.productId);
    if (!product) return; // Should not happen, but good practice to check

    if (isNaN(newQuantity) || newQuantity < 1) {
      newQuantity = 1;
    }

    if (newQuantity > product.stock) {
      this.notificationService.show(
        `Only ${product.stock} units of ${product.name} available.`,
        'error'
      );
      newQuantity = product.stock;
      inputElement.value = newQuantity.toString(); // Visually correct the input field
    }
    
    if (newQuantity <= 0) {
      this.removeItem(item);
      return;
    }

    this.cartService.updateQuantity(item.productId, newQuantity);
  }

  removeItem(item: OrderItem) {
    this.cartService.removeFromCart(item.productId);
  }
}