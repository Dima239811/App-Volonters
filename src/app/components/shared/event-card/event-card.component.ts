import { Component, Input, inject, OnInit, Output, EventEmitter } from '@angular/core';
import { Event } from '../../../models/event.model';
import { NgIf, NgFor } from '@angular/common';
import { ConfirmationModalComponent } from '../confirmation-modal/confirmation-modal.component';
import { EventService } from '../../../services/event.service';
import { finalize, Subscription } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { AuthService } from '../../../services/auth.service';
import { Router } from '@angular/router';
import { User } from '../../../models/user.model';
@Component({
  selector: 'app-event-card',
  templateUrl: './event-card.component.html',
  styleUrls: ['./event-card.component.css'],
  standalone: true,
  imports: [NgIf, ConfirmationModalComponent, NgFor]
})
export class EventCardComponent implements OnInit {
  private eventService = inject(EventService);
  private authService = inject(AuthService);
  private authSub!: Subscription;
  private router = inject(Router);

  @Input() event!: Event;
  @Input() showStatus: boolean = false;
  @Input() currentUserId!: number | null;
  @Output() eventDeleted = new EventEmitter<number>();

  isModalOpen = false;
  isLoading = false;
  registrationError: string | null = null;
  isRegistered = false;
  isOnProfilePage: boolean = false;

  ngOnInit(): void {
    this.currentUserId = this.authService.getCurrentUserId();
    this.isOnProfilePage = this.router.url === '/profile';

    // Подписываемся на изменения авторизации
    this.authSub = this.authService.onAuthStateChanged().subscribe(() => {
      this.currentUserId = this.authService.getCurrentUserId();
      if (!this.currentUserId) {
        this.isRegistered = false;
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
              this.eventDeleted.emit(this.event.id);
            },
            error: (err: any) => {
              alert('Ошибка удаления: ' + (err.error?.message || err.message));
            }
          });
      }
    }
  }

  eco(): boolean {
    return this.event.category.includes('Экология');
  }





  isParticipantsModalOpen = false;
  participants: { id?: number, name: string, tel?: string }[] = [];
  sortDirection: 'asc' | 'desc' = 'asc';
  isLoadingParticipants = false;

  // ... другие методы ...

  openParticipantsModal(): void {
    this.isParticipantsModalOpen = true;
    this.loadParticipants();
  }

  closeParticipantsModal(): void {
    this.isParticipantsModalOpen = false;
    this.participants = []
  }

  loadParticipants(): void {
    if (!this.event?.participantIds || this.event.participantIds.length === 0) return;

    this.isLoadingParticipants = true;
    this.event.participantIds.forEach(element => {
      this.eventService.getUserById(element)
        .pipe(finalize(() => this.isLoadingParticipants = false))
        .subscribe({
          next: (participants) => {
            this.participants.push({ id: participants.id, name: participants.fullName, tel: participants.phone })
            console.log('Загруженные участники:', participants);
            this.sortParticipants();
          },
          error: (err) => {
            console.error('Ошибка загрузки участников:', err);
          }
        });
    });

  }

  toggleSortDirection(): void {
    this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    this.sortParticipants();
  }

  sortParticipants(): void {
    this.participants.sort((a, b) => {
      const nameA = a.name.toLowerCase();
      const nameB = b.name.toLowerCase();
      return this.sortDirection === 'asc'
        ? nameA.localeCompare(nameB)
        : nameB.localeCompare(nameA);
    });
  }

  confirmUnregister(): void {
    if (confirm('Вы уверены, что хотите отписаться от события?')) {
      this.unregisterFromEvent();
    }
  }

  unregisterFromEvent(): void {
    if (!this.event?.id || !this.currentUserId) return;

    this.isLoading = true;
    this.eventService.removeParticipant(this.event.id, this.currentUserId)
      .pipe(finalize(() => this.isLoading = false))
      .subscribe({
        next: () => {
          this.isRegistered = false;
          alert('Вы успешно отписались от события');
          this.eventDeleted.emit(this.event.id);
        },
        error: (err) => {
          console.error('Ошибка отписки:', err);
          alert('Не удалось отписаться от события');
        }
      });
  }


}
