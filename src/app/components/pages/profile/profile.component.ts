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

  constructor(private profileService: ProfileService, private userService: UserService) {}

  ngOnInit(): void {
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
        console.log(this.user.profileImage)
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

  this.profileService.getUserEvents(userId).subscribe({
    next: (events) => {
      this.userEvents = events; // Убираем дополнительную фильтрацию
      console.log('События пользователя:', this.userEvents);
    },
    error: (err) => {
      console.error('Не удалось загрузить мероприятия пользователя:', err);
      this.error = 'Ошибка загрузки мероприятий';
    }
  });
}

  isEditing = false; // для открытия модалки
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

    this.userService.updateUser(this.user.id, updatedFields).subscribe({
      next: (updatedUser) => {
        //this.user = { ...this.user, ...updatedUser };
        if (this.user.id) {
          this.loadUserData(this.user.id);
        }
        
        this.closeEditModal();
      },
      error: (err) => {
        console.error('Ошибка при обновлении профиля:', err);
      }
    });
  }
}