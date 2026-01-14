
import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { DataService } from '../../data.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-about',
  templateUrl: './about.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule],
})
export class AboutComponent {
  dataService = inject(DataService);
  private settings = this.dataService.getSettings();
  aboutPageSettings = computed(() => this.settings().aboutPage);
}
