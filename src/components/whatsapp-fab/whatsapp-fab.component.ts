
import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { DataService } from '../../data.service';

@Component({
  selector: 'app-whatsapp-fab',
  templateUrl: './whatsapp-fab.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WhatsappFabComponent {
  dataService = inject(DataService);
  settings = this.dataService.getSettings();
  
  contactSettings = computed(() => this.settings().contact);

  showFab = computed(() => {
    const contact = this.contactSettings();
    return contact.whatsappEnabled && !!contact.whatsappNumber;
  });

  whatsappUrl = computed(() => {
    const contact = this.contactSettings();
    const phoneNumber = contact.whatsappNumber;
    const message = contact.whatsappDefaultMessage;
    return `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
  });
}
