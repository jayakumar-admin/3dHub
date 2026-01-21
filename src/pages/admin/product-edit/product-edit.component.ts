
import { ChangeDetectionStrategy, Component, computed, effect, inject, signal } from '@angular/core';
// FIX: Import ParamMap to correctly type route parameters.
import { ActivatedRoute, ParamMap, Router, RouterLink } from '@angular/router';
import { DataService } from '../../../data.service';
import { Product } from '../../../models';
import { FormArray, FormBuilder, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { NotificationService } from '../../../notification.service';

@Component({
  selector: 'app-admin-product-edit',
  templateUrl: './product-edit.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, ReactiveFormsModule, CommonModule],
})
export class AdminProductEditComponent {
  route = inject(ActivatedRoute);
  dataService = inject(DataService);
  // FIX: Explicitly type `fb` to prevent TypeScript from inferring it as `unknown`.
  fb: FormBuilder = inject(FormBuilder);
  router = inject(Router);
  notificationService = inject(NotificationService);

  loadingImages = signal<Record<number, boolean>>({});

  private productIdSignal = toSignal(
    // FIX: Explicitly type `params` as `ParamMap` to resolve `get` method.
    this.route.paramMap.pipe(map((params: ParamMap) => params.get('id')))
  );

  product = computed(() => {
    const id = this.productIdSignal();
    return id ? this.dataService.getProducts()().find(p => p.id === id) : undefined;
  });
  
  categories = this.dataService.getCategories();

  isEditMode = computed(() => !!this.productIdSignal());
  
  pageTitle = computed(() => this.isEditMode() ? 'Edit Product' : 'Add New Product');

  productForm = this.fb.group({
    id: [''],
    name: ['', Validators.required],
    sku: ['', Validators.required],
    price: [0, [Validators.required, Validators.min(0)]],
    stock: [0, [Validators.required, Validators.min(0)]],
    description: [''],
    enabled: [true],
    category: ['', Validators.required],
    oldPrice: [null as number | null],
    rating: [0],
    images: this.fb.array<string>([]),
    reviews: [0],
    tags: [''], // Handled as comma-separated string
    weight: [null as number | null, [Validators.min(0)]],
    dimensions: this.fb.group({
      length: [null as number | null, [Validators.min(0)]],
      width: [null as number | null, [Validators.min(0)]],
      height: [null as number | null, [Validators.min(0)]],
    }),
  });

  constructor() {
    effect(() => {
        const p = this.product();
        if (p) {
            this.productForm.patchValue({
              ...p,
              tags: p.tags?.join(', ') || ''
            } as any);
            this.images.clear();
            p.images.forEach(img => this.images.push(this.fb.control(img)));
        } else {
            // This is 'new product' mode, reset form to defaults
            this.productForm.reset({
                enabled: true,
                price: 0,
                stock: 0,
            });
            this.images.clear();
        }
    });
  }

  // Getters for easier template access
  get name() { return this.productForm.get('name'); }
  get sku() { return this.productForm.get('sku'); }
  get price() { return this.productForm.get('price'); }
  get stock() { return this.productForm.get('stock'); }
  get category() { return this.productForm.get('category'); }
  get weight() { return this.productForm.get('weight'); }
  get dimensionsGroup() { return this.productForm.get('dimensions'); }
  
  get images() {
    return this.productForm.get('images') as FormArray;
  }

  addImage() {
    this.images.push(this.fb.control(''));
  }

  removeImage(index: number) {
    this.images.removeAt(index);
  }

  onFileChange(event: Event, index: number) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      this.loadingImages.update(l => ({ ...l, [index]: true }));
      this.dataService.uploadImage(file, 'products').subscribe({
        next: (res) => {
          this.images.at(index).setValue(res.imageUrl);
          this.notificationService.show('Image uploaded successfully!', 'success');
        },
        error: (err) => {
          const message = err?.error?.message || 'An unknown server error occurred.';
          this.notificationService.show(`Image upload failed: ${message}`, 'error');
        },
        complete: () => {
          this.loadingImages.update(l => ({ ...l, [index]: false }));
        }
      });
    }
  }

  saveProduct() {
    this.productForm.markAllAsTouched();
    if (this.productForm.valid) {
      const formValue = this.productForm.getRawValue();
      const tagsArray = formValue.tags ? formValue.tags.split(',').map(t => t.trim()).filter(t => t) : [];
      const imagesArray = formValue.images ? formValue.images.filter(img => img) : [];
      
      // Generate ID for new products to prevent NOT NULL violation
      if (!this.isEditMode()) {
        formValue.id = `prod${Date.now()}`;
      }

      const productToSave = { ...formValue, tags: tagsArray, images: imagesArray } as Product;

      this.dataService.saveProduct(productToSave);
      this.notificationService.show('Product saved successfully!', 'success');
      this.router.navigate(['/admin/products']);
    } else {
        this.notificationService.show('Please fill all required fields correctly.', 'error');
    }
  }
}
