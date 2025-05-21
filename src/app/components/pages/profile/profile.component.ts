import { Component, OnInit } from '@angular/core';
import { ProfileService } from '../../../services/profile.service';
import { User } from '../../../models/user.model';
import { Event } from '../../../models/event.model';
import { CommonModule } from '@angular/common';
import { EventCardComponent } from '../../shared/event-card/event-card.component';
import { NavbarComponent } from '../../shared/navbar/navbar.component';
import { FooterComponent } from '../../shared/footer/footer.component';
import { RouterModule } from '@angular/router';
import { UserService } from '../../../services/user.service';
import { ReactiveFormsModule } from '@angular/forms';
import { EditProfileModalComponent } from '../../shared/edit-profile-modal/edit-profile-modal.component';
import { AuthService } from '../../../services/auth.service';
import { EventService } from '../../../services/event.service'; // Добавляем сервис событий

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    EventCardComponent,
    NavbarComponent,
    FooterComponent,
    RouterModule,
    ReactiveFormsModule, 
    EditProfileModalComponent 
  ]
})
export class ProfileComponent implements OnInit {
  user: User = {
    fullName: '',
    email: '',
    password: '',
    role: 'volunteer',
    agreeTerms: false,
    eventIds: []
  };
  userEvents: Event[] = [];
  loading = true;
  error: string | null = null;
  isEditingEvent = false; // Для модалки редактирования события
  currentEditingEvent: Event | null = null; // Текущее редактируемое событие

  constructor(
    private profileService: ProfileService,
    private userService: UserService,
    private authService: AuthService,
    private eventService: EventService // Добавляем сервис событий
  ) {}

  ngOnInit(): void {
    this.loadCurrentUser();
  }

  loadCurrentUser(): void {
    const currentUser = this.profileService.getCurrentUser();
    
    if (!currentUser?.id) {
      this.error = 'Пользователь не авторизован';
      this.loading = false;
      return;
    }

    this.user = currentUser;
    this.loadUserData(currentUser.id);
    this.loadUserEvents(currentUser.id);
  }

  loadUserData(userId: number): void {
    this.profileService.getUserById(userId).subscribe({
      next: (user) => {
        this.user = user;
        this.profileService.setCurrentUser(user);
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Не удалось загрузить данные пользователя';
        this.loading = false;
        console.error(err);
      }
    });
  }

  loadUserEvents(userId: number): void {
    if (!userId) {
      console.error('Некорректный ID пользователя');
      return;
    }

    if (this.isAdmin()) {
      // Для организатора загружаем события, которые он создал
      this.eventService.getEventsByOrganizer(userId).subscribe({
        next: (events) => {
          this.userEvents = events;
          console.log('События организатора:', this.userEvents);
        },
        error: (err) => {
          console.error('Ошибка загрузки событий организатора:', err);
          this.error = 'Ошибка загрузки мероприятий';
        }
      });
    } else {
      // Для волонтера загружаем события, на которые он записан
      this.profileService.getUserEvents(userId).subscribe({
        next: (events) => {
          this.userEvents = events;
          console.log('События волонтера:', this.userEvents);
        },
        error: (err) => {
          console.error('Не удалось загрузить мероприятия пользователя:', err);
          this.error = 'Ошибка загрузки мероприятий';
        }
      });
    }
  }

  // Редактирование события
  openEventEditModal(event: Event): void {
    this.currentEditingEvent = { ...event };
    this.isEditingEvent = true;
  }

  closeEventEditModal(): void {
    this.isEditingEvent = false;
    this.currentEditingEvent = null;
  }

  saveEvent(updatedEvent: Event): void {
    if (!this.currentEditingEvent?.id) return;

    this.eventService.updateEvent(this.currentEditingEvent.id, updatedEvent).subscribe({
      next: () => {
        this.loadUserEvents(this.user.id!);
        this.closeEventEditModal();
      },
      error: (err) => {
        console.error('Ошибка при обновлении события:', err);
        alert('Не удалось обновить событие');
      }
    });
  }

  // Удаление события
  deleteEvent(eventId: number): void {
    if (confirm('Вы уверены, что хотите удалить это событие?')) {
      this.eventService.deleteEvent(eventId).subscribe({
        next: () => {
          this.userEvents = this.userEvents.filter(e => e.id !== eventId);
        },
        error: (err) => {
          console.error('Ошибка при удалении события:', err);
          alert('Не удалось удалить событие');
        }
      });
    }
  }

  // Профиль
  isEditing = false;
  openEditModal(): void {
    this.isEditing = true;
  }

  closeEditModal(): void {
    this.isEditing = false;
  }

  getProfileImageUrl(imgPath: string | undefined): string {
    if (!imgPath) return '';
    return imgPath.startsWith('http') ? imgPath : 'http://localhost:4000' + imgPath;
  }

  saveProfile(updatedFields: Partial<User>): void {
    if (!this.user?.id) return;

    const prevUser = { ...this.user };
    this.user = { ...this.user, ...updatedFields };

    this.userService.updateUser(this.user.id!, updatedFields).subscribe({
      next: (updatedUser) => {
        if (this.user.id) {
          this.loadUserData(this.user.id);
        }
        this.closeEditModal();
      },
      error: (err) => {
        this.user = prevUser;
        console.error('Ошибка при обновлении профиля:', err);
        alert('Не удалось обновить профиль');
      }
    });
  }

  isAdmin() {
    return this.authService.hasRole('organization');
  }
}