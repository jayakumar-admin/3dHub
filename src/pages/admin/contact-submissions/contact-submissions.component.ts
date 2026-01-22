
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { DataService } from '../../../data.service';
import { ContactSubmission } from '../../../models';
import { CommonModule } from '@angular/common';
import { NotificationService } from '../../../notification.service';

@Component({
  selector: 'app-admin-contact-submissions',
  templateUrl: './contact-submissions.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule],
  standalone: true
})
export class AdminContactSubmissionsComponent {
  dataService = inject(DataService);
  notificationService = inject(NotificationService);

  searchQuery = signal('');
  
  viewingSubmission = signal<ContactSubmission | null>(null);

  filteredSubmissions = computed(() => {
    const submissions = this.dataService.getContactSubmissions()();
    const query = this.searchQuery().toLowerCase();
    if (!query) {
      return submissions;
    }
    return submissions.filter(s => 
        s.name.toLowerCase().includes(query) ||
        s.email.toLowerCase().includes(query) ||
        s.message.toLowerCase().includes(query)
    );
  });

  onSearchChange(event: Event) {
    this.searchQuery.set((event.target as HTMLInputElement).value);
  }

  openModal(submission: ContactSubmission) {
    this.viewingSubmission.set(submission);
    // If status is 'New', automatically update to 'Read' when opened
    if (submission.status === 'New') {
      this.updateStatus(submission, 'Read');
    }
  }

  closeModal() {
    this.viewingSubmission.set(null);
  }

  updateStatus(submission: ContactSubmission, status: ContactSubmission['status']) {
    this.dataService.updateContactSubmissionStatus(submission.id, status);
    this.notificationService.show(`Message marked as ${status}.`);
    // If the modal is open for this submission, update its status
    if (this.viewingSubmission()?.id === submission.id) {
        this.viewingSubmission.update(s => s ? {...s, status} : null);
    }
  }

  getStatusClass(status: string) {
    switch (status) {
      case 'New': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300';
      case 'Read': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800/50 dark:text-yellow-200';
      case 'Archived': return 'bg-gray-200 text-gray-800 dark:bg-gray-600 dark:text-gray-200';
      default: return 'bg-gray-100 text-gray-800';
    }
  }
}
