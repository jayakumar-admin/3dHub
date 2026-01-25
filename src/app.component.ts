
import { ChangeDetectionStrategy, Component, effect, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule, DOCUMENT } from '@angular/common';
import { ThemeService } from './theme.service';
import { DataService } from './data.service';
import { LoadingService } from './loading.service';
import { LoadingIndicatorComponent } from './components/loading-indicator/loading-indicator.component';
import { NotificationComponent } from './components/notification/notification.component';

@Component({
  selector: 'app-root',
  template: `
    <router-outlet></router-outlet>
    <app-notification></app-notification>
    @if (loadingService.isLoading()) {
      <app-loading-indicator></app-loading-indicator>
    }
  `,
  styles: [':host { display: block; }'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet, CommonModule, LoadingIndicatorComponent, NotificationComponent],
})
export class AppComponent {
  themeService = inject(ThemeService);
  dataService = inject(DataService);
  loadingService = inject(LoadingService);
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
