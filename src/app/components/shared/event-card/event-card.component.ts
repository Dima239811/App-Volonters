import { Component, Input, inject, OnInit, Output, EventEmitter } from '@angular/core';
import { Event } from '../../../models/event.model';
import { NgClass, NgIf } from '@angular/common';
import { ConfirmationModalComponent } from '../confirmation-modal/confirmation-modal.component';
import { EventService } from '../../../services/event.service';
import { finalize, Subscription } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { AuthService } from '../../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-event-card',
  templateUrl: './event-card.component.html',
  styleUrls: ['./event-card.component.css'],
  standalone: true,
  imports:[NgClass, NgIf, ConfirmationModalComponent]
})
export class EventCardComponent implements OnInit {
  private eventService = inject(EventService);
  private authService = inject(AuthService);
   private authSub!: Subscription;
  private router = inject(Router); // Inject Router

  @Input() event!: Event;
  @Input() showStatus: boolean = false;
  @Input() currentUserId!: number | null;
  @Output() eventDeleted = new EventEmitter<void>();

  isModalOpen = false;
  isLoading = false;
  registrationError: string | null = null;
  isRegistered = false;
  isOnProfilePage: boolean = false; // Flag to track if we're on the profile page

   ngOnInit(): void {
    this.currentUserId = this.authService.getCurrentUserId();
    this.isOnProfilePage = this.router.url === '/profile'; // Set the flag based on the current route

    // Подписываемся на изменения авторизации
    this.authSub = this.authService.onAuthStateChanged().subscribe(() => {
      this.currentUserId = this.authService.getCurrentUserId();
      if (!this.currentUserId) {
        this.isRegistered = false; // Сбрасываем статус при выходе
      } else if (this.event?.id) {
        this.checkRegistrationStatus();
      }
    });

    if (this.currentUserId && this.event?.id) {
      this.checkRegistrationStatus();
    }
  }

  ngOnDestroy(): void {
    if (this.authSub) {
      this.authSub.unsubscribe();
    }
  }


  openModal() {
    this.isModalOpen = true;
    this.registrationError = null;
  }

  // Заменяем openModal на новый обработчик
  handleParticipation(): void {
    if (this.currentUserId === null) {
      // Для неавторизованных - редирект на логин
      this.router.navigate(['/error'], {
        queryParams: { returnUrl: this.router.url }
      });
      return;
    }
    
    // Для авторизованных - открываем модальное окно
    this.openModal();
  }

  closeModal() {
    this.isModalOpen = false;
  }

  checkRegistrationStatus(): void {
  if (this.event?.id && this.currentUserId) {
    this.eventService.isUserRegistered(this.event.id, this.currentUserId)
      .subscribe(registered => {
        this.isRegistered = registered;
      });
  }
}

  confirmParticipation(): void {
  if (!this.event?.id) {
    this.registrationError = 'Событие не определено';
    return;
  }

  if (!this.currentUserId) {
    this.registrationError = 'Необходимо авторизоваться';
    return;
  }

  this.isLoading = true;
  this.registrationError = null;

  // Теперь currentUserId точно number
  this.eventService.addParticipant(this.event.id, this.currentUserId)
    .pipe(
      finalize(() => this.isLoading = false)
    )
    .subscribe({
      next: () => {
        this.isRegistered = true;
        this.closeModal();
      },
      error: (err: HttpErrorResponse) => {
        this.registrationError = this.getErrorMessage(err);
      }
    });
}

  private getErrorMessage(error: HttpErrorResponse): string {
    if (error.status === 404) {
      return 'Событие не найдено';
    }
    if (error.status === 409) {
      return 'Вы уже записаны на это событие';
    }
    return error.message || 'Произошла ошибка при записи';
  }

  hasOrganizationStatus() {
    return this.authService.hasRole('organization')
  }

  getEventImageUrl(imgPath: string | undefined): string {
  if (!imgPath) return 'assets/no-event-img.png';
  // Если путь уже абсолютный — не добавляем ещё раз
  return imgPath.startsWith('http') ?
    imgPath :
    'http://localhost:4000' + imgPath;
}

  handleEventDelete(): void {
    if (confirm(`Удалить событие "${this.event?.title}"?`)) {
      this.isLoading = true;
      if (this.event.id) {
        this.eventService.deleteEventWithImage(this.event)
          .pipe(finalize(() => this.isLoading = false))
          .subscribe({
            next: () => {
              this.eventDeleted.emit(); // Сообщаем родителю
            },
            error: (err: any) => {
              alert('Ошибка удаления: ' + (err.error?.message || err.message));
            }
          });
      }
    }
  }

}
