
import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-loading-indicator',
  standalone: true,
  template: `
    <div class="fixed inset-0 bg-light-bg/80 dark:bg-dark-bg/80 backdrop-blur-sm flex items-center justify-center z-[100]">
      <div class="loader"></div>
    </div>
  `,
  styles: [`
    .loader {
      width: 50px;
      aspect-ratio: 1;
      border-radius: 50%;
      border: 8px solid;
      border-color: #3b82f6 #0000; /* primary-light and transparent */
      animation: l1 1s infinite;
    }
    @keyframes l1 {to{transform: rotate(.5turn)}}
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoadingIndicatorComponent {}
