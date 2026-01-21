
import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { DataService } from '../../data.service';
import { CommonModule } from '@angular/common';
import { ConfettiComponent } from '../../components/confetti/confetti.component';

@Component({
  selector: 'app-order-success',
  templateUrl: './order-success.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, RouterLink, ConfettiComponent],
})
export class OrderSuccessComponent {
  route = inject(ActivatedRoute);
  dataService = inject(DataService);

  private orderIdSignal = toSignal(
    this.route.paramMap.pipe(map(params => params.get('id')))
  );

  order = computed(() => {
    const id = this.orderIdSignal();
    return id ? this.dataService.getOrders()().find(o => o.id === id) : undefined;
  });
}
