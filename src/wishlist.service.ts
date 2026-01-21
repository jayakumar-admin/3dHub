
import { Injectable, signal, effect, computed, PLATFORM_ID, Inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class WishlistService {
  private isBrowser = false;
  wishlist = signal<string[]>([]); // Array of product IDs

  constructor(@Inject(PLATFORM_ID) private platformId: object) {
    this.isBrowser = isPlatformBrowser(this.platformId);
    if (this.isBrowser) {
      const storedWishlist = localStorage.getItem('wishlist');
      if (storedWishlist) {
        this.wishlist.set(JSON.parse(storedWishlist));
      }
    }

    effect(() => {
      if (this.isBrowser) {
        localStorage.setItem('wishlist', JSON.stringify(this.wishlist()));
      }
    });
  }

  wishlistCount = computed(() => this.wishlist().length);

  isInWishlist(productId: string): boolean {
    return this.wishlist().includes(productId);
  }

  toggleWishlist(productId: string) {
    if (this.isInWishlist(productId)) {
      this.removeFromWishlist(productId);
    } else {
      this.addToWishlist(productId);
    }
  }

  private addToWishlist(productId: string) {
    this.wishlist.update(ids => [...ids, productId]);
  }

  private removeFromWishlist(productId: string) {
    this.wishlist.update(ids => ids.filter(id => id !== productId));
  }
}
