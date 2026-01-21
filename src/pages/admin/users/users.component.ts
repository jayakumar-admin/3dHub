
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { DataService } from '../../../data.service';
import { CommonModule } from '@angular/common';
import { User } from '../../../models';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { NotificationService } from '../../../notification.service';

@Component({
  selector: 'app-admin-users',
  templateUrl: './users.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, ReactiveFormsModule],
})
export class AdminUsersComponent {
  dataService = inject(DataService);
  // FIX: Explicitly type `fb` to prevent TypeScript from inferring it as `unknown`.
  fb: FormBuilder = inject(FormBuilder);
  notificationService = inject(NotificationService);
  
  searchQuery = signal('');
  isModalOpen = signal(false);
  editingUser = signal<User | null>(null);

  userForm = this.fb.group({
    id: [''],
    name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    // FIX: Add phone field to user form to align with User model changes
    phone: [''],
    role: ['Customer' as 'Admin' | 'Customer', Validators.required],
    avatar: [''],
    joinedDate: [''],
  });

  filteredUsers = computed(() => {
    const users = this.dataService.getUsers()();
    const query = this.searchQuery().toLowerCase();
    if (!query) {
      return users;
    }
    return users.filter(user => 
        user.name.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query)
    );
  });

  onSearchChange(event: Event) {
    this.searchQuery.set((event.target as HTMLInputElement).value);
  }

  openEditModal(user: User) {
    this.editingUser.set(user);
    this.userForm.setValue({
        id: user.id,
        name: user.name,
        email: user.email,
        // FIX: Provide phone value to prevent runtime errors with setValue
        phone: user.phone || '',
        role: user.role,
        avatar: user.avatar,
        joinedDate: user.joinedDate,
    });
    this.isModalOpen.set(true);
  }

  closeModal() {
    this.isModalOpen.set(false);
    this.editingUser.set(null);
  }

  saveUser() {
    if (this.userForm.valid) {
      const updatedUser = this.userForm.getRawValue() as User;
      this.dataService.saveUser(updatedUser);
      this.notificationService.show('User updated successfully!');
      this.closeModal();
    }
  }
  
  deleteUser(user: User) {
      if(confirm(`Are you sure you want to delete ${user.name}? This action cannot be undone.`)) {
          this.dataService.deleteUser(user.id);
          this.notificationService.show('User deleted.');
      }
  }
}
