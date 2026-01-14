
import { ChangeDetectionStrategy, Component, effect, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ThemeService } from './theme.service';
import { DataService } from './data.service';
import { DOCUMENT } from '@angular/common';

@Component({
  selector: 'app-root',
  template: `<router-outlet></router-outlet>`,
  styles: [':host { display: block; }'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet],
})
export class AppComponent {
  themeService = inject(ThemeService);
  dataService = inject(DataService);
  document = inject(DOCUMENT);

  constructor() {
    effect(() => {
      const settings = this.dataService.getSettings()();
      
      // Update page title
      this.document.title = settings.seo.metaTitle;
      
      // Update meta description
      let metaDesc = this.document.querySelector('meta[name="description"]');
      if (!metaDesc) {
        metaDesc = this.document.createElement('meta');
        metaDesc.setAttribute('name', 'description');
        this.document.head.appendChild(metaDesc);
      }
      metaDesc.setAttribute('content', settings.seo.metaDescription);
    });
  }
}