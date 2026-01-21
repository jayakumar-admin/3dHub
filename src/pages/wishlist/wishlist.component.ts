
import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WishlistService } from '../../wishlist.service';
import { DataService } from '../../data.service';
import { ProductCardComponent } from '../../components/product-card/product-card.component';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-wishlist',
  templateUrl: './wishlist.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, ProductCardComponent, RouterLink],
})
export class WishlistComponent {
  wishlistService = inject(WishlistService);
  dataService = inject(DataService);

  wishlistItems = computed(() => {
    const wishlistIds = this.wishlistService.wishlist();
    const allProducts = this.dataService.getProducts()();
    return allProducts.filter(product => wishlistIds.includes(product.id));
  });
}
