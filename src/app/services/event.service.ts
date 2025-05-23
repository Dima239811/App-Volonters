// services/event.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, switchMap, map, of, catchError, throwError } from 'rxjs';
import { Event } from '../models/event.model';
import { User } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class EventService {
  private apiUrl = 'http://localhost:3000'; // Базовый URL для json-server
  private fileApiUrl = 'http://localhost:4000/api'; // Express
  constructor(private http: HttpClient) {}

  // Получить все события
  getEvents(): Observable<Event[]> {
    return this.http.get<Event[]>(`${this.apiUrl}/events`);
  }

  // Получить события по ID участника
  getEventsByParticipant(userId: number): Observable<Event[]> {
    return this.http.get<Event[]>(`${this.apiUrl}/events?participantIds_like=${userId}`);
  }

  // Получить событие по ID
  getEventById(id: number): Observable<Event> {
    return this.http.get<Event>(`${this.apiUrl}/events/${id}`);
  }

  // Создать новое событие
  createEvent(event: Event, creatorId: number): Observable<Event> {
  // Добавляем creatorId к событию
  const eventWithCreator = { ...event, creatorId };

  return this.http.post<Event>(`${this.apiUrl}/events`, eventWithCreator).pipe(
    // После создания события обновляем организатора
    switchMap(createdEvent => {
      return this.http.get<User>(`${this.apiUrl}/users/${creatorId}`).pipe(
        switchMap(organizer => {
          // Добавляем ID события в массив организатора
          const updatedEventIds = [...(organizer.eventIds || []), createdEvent.id];
          
          return this.http.patch<User>(
            `${this.apiUrl}/users/${creatorId}`,
            { eventIds: updatedEventIds }
          ).pipe(
            map(() => createdEvent) // Возвращаем созданное событие
          );
        })
      );
    }),
    catchError(error => {
      console.error('Ошибка при создании события:', error);
      return throwError(() => new Error('Не удалось создать событие'));
    })
  );
}

    // Получить события по ID организатора
    getEventsByOrganizer(organizerId: number): Observable<Event[]> {
        return this.http.get<Event[]>(`${this.apiUrl}/events?creatorId=${organizerId}`);
    }

  // Временный метод (лучше вынести в AuthService или UserService)
  private getCurrentUserId(): number | null {
    const userData = sessionStorage.getItem('currentUser');
    return userData ? JSON.parse(userData).id : null;
  }

  // Обновить событие
  updateEvent(id: number, event: Event): Observable<Event> {
    return this.http.put<Event>(`${this.apiUrl}/events/${id}`, event);
  }

  // Новый метод!
  deleteEventWithImage(event: Event): Observable<void> {
    if (!event.imageUrl) {
      // Если картинки нет — просто удаляем событие
      return this.http.delete<void>(`${this.apiUrl}/events/${event.id}`);
    }
    return this.http.delete(`${this.fileApiUrl}/delete/event-image`, { body: { imageUrl: event.imageUrl } }).pipe(
      switchMap(() => this.http.delete<void>(`${this.apiUrl}/events/${event.id}`)),
      // Даже если ошибка при удалении файла — событие всё равно удаляем
      catchError(() => this.http.delete<void>(`${this.apiUrl}/events/${event.id}`))
    );
  }

  // Удалить событие
  deleteEvent(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/events/${id}`);
  }

  // Записать пользователя на событие
  addParticipant(eventId: number, userId: number): Observable<Event> {
    console.log('Registering user:', userId, 'to event:', eventId);
    return this.getEventById(eventId).pipe(
    switchMap(event => {
      // Проверяем, не записан ли уже пользователь
      if (event.participantIds?.includes(userId)) {
        throw new Error('USER_ALREADY_REGISTERED');
      }
      
      // Создаем только обновление для participantIds
      const update = {
          participantIds: [...(event.participantIds || []), userId]
      };
      
      // Используем patch вместо put для частичного обновления
      return this.http.patch<Event>(
          `${this.apiUrl}/events/${eventId}`,
          update
      );
    })
  );
  }

  // Новый метод для проверки записи
  isUserRegistered(eventId: number, userId: number): Observable<boolean> {
  return this.getEventById(eventId).pipe(
    map(event => {
      // Проверяем точно для указанного события
      return event.participantIds?.includes(userId) ?? false;
    }),
    catchError(() => of(false)) // Если ошибка - считаем, что не записан
  );
}

  // Отменить запись пользователя на событие
  removeParticipant(eventId: number, userId: number): Observable<Event> {
    return this.http.get<Event>(`${this.apiUrl}/events/${eventId}`).pipe(
      switchMap(event => {
        const updatedParticipants = event.participantIds.filter(id => id !== userId);
        return this.http.patch<Event>(`${this.apiUrl}/events/${eventId}`, {
          participantIds: updatedParticipants
        });
      })
    );
  }

  // Получить события по категории
  getEventsByCategory(category: string): Observable<Event[]> {
    return this.http.get<Event[]>(`${this.apiUrl}/events?category=${category}`);
  }
}
