import { Component, Input, inject, OnInit } from '@angular/core';
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
export class EventCardComponent {
  private eventService = inject(EventService);
  private authService = inject(AuthService);
   private authSub!: Subscription;

  @Input() event!: Event;
  @Input() showStatus: boolean = false;
  @Input() currentUserId!: number | null;

  isModalOpen = false;
  isLoading = false;
  registrationError: string | null = null;
  isRegistered = false;

   ngOnInit(): void {
    this.currentUserId = this.authService.getCurrentUserId();
    
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

  constructor(
    private router: Router // Добавляем Router
  ) {
    this.currentUserId = this.authService.getCurrentUserId();
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

}
