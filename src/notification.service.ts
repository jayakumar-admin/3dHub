
import { Injectable, signal } from '@angular/core';

export type NotificationType = 'success' | 'error';
export interface Notification {
  message: string;
  type: NotificationType;
}

@Injectable({ providedIn: 'root' })
export class NotificationService {
  notification = signal<Notification | null>(null);
  private timeoutId: any;

  show(message: string, type: NotificationType = 'success', duration: number = 3000) {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
    }
    this.notification.set({ message, type });
    this.timeoutId = setTimeout(() => this.hide(), duration);
  }

  hide() {
    this.notification.set(null);
    if (this.timeoutId) {
        clearTimeout(this.timeoutId);
        this.timeoutId = null;
    }
  }
}
