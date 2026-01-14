
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { NotificationService } from '../../notification.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-notification',
  templateUrl: './notification.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule],
})
export class NotificationComponent {
  notificationService = inject(NotificationService);
  notification = this.notificationService.notification;

  get a() {
    return 's'
  }

  getIconClass(type: string | undefined): string {
    if (!type) return '';
    return type === 'success' ? 'text-green-500' : 'text-red-500';
  }

   getBgClass(type: string | undefined): string {
    if (!type) return '';
    return type === 'success' ? 'bg-green-100 dark:bg-green-800/50' : 'bg-red-100 dark:bg-red-800/50';
  }
}
