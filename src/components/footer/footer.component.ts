
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { DataService } from '../../data.service';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, RouterLink],
})
export class FooterComponent {
  dataService = inject(DataService);
  settings = this.dataService.getSettings();
}