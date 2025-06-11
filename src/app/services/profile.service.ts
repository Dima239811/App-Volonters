import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, throwError, of, switchMap, tap } from 'rxjs';
import { User } from '../models/user.model';
import { Event } from '../models/event.model';
import { map } from 'rxjs';
import { UploadService } from './upload.service';
@Injectable({
  providedIn: 'root'
})
export class ProfileService {
  private apiUrl = 'http://localhost:3000';
  private readonly USER_KEY = 'currentUser';

  constructor(private http: HttpClient, private uploadService: UploadService) { }

  /**
   * Получение текущего пользователя из sessionStorage
   */
  getCurrentUser(): User | null {
    const userData = sessionStorage.getItem(this.USER_KEY);
    return userData ? JSON.parse(userData) : null;
  }

  /**
   * Сохранение пользователя в sessionStorage
   * @param user - Объект пользователя
   */
  setCurrentUser(user: User): void {
    sessionStorage.setItem(this.USER_KEY, JSON.stringify(user));
  }

  /**
   * Очистка данных пользователя из sessionStorage
   */
  clearCurrentUser(): void {
    sessionStorage.removeItem(this.USER_KEY);
  }

  getUserById(id: number): Observable<User> {
    if (!id) {
      return throwError(() => new Error('ID пользователя не может быть пустым'));
    }
    return this.http.get<User>(`${this.apiUrl}/users/${id}`).pipe(
      tap(user => this.setCurrentUser(user)), // Сохраняем полученного пользователя
      catchError(this.handleError)
    );
  }

  /**
   * Обновление данных пользователя
   * @param id - ID пользователя (строка)
   * @param userData - Новые данные пользователя
   */
  updateUser(id: number, userData: Partial<User>): Observable<User> {
    return this.http.patch<User>(`${this.apiUrl}/users/${id}`, userData).pipe(
      tap(updatedUser => this.setCurrentUser(updatedUser)),
      catchError(this.handleError)
    );
  }

  /**
   * Получение мероприятий пользователя
   * @param userId - ID пользователя (число для participantIds)
   */
 getUserEvents(userId: number): Observable<Event[]> {
  return this.http.get<Event[]>(`${this.apiUrl}/events`).pipe(
    map(events => events.filter(event => 
      event.participantIds?.includes(userId) ?? false
    )),
    catchError(this.handleError)
  );
}

  /**
   * Запись на мероприятие
   * @param eventId - ID мероприятия (число)
   * @param userId - ID пользователя (число для participantIds)
   */
  joinEvent(eventId: number, userId: number): Observable<Event> {
    return this.http.get<Event>(`${this.apiUrl}/events/${eventId}`).pipe(
      switchMap(event => {
        const updatedParticipants = [...event.participantIds, userId];
        return this.http.patch<Event>(`${this.apiUrl}/events/${eventId}`, {
          participantIds: updatedParticipants
        });
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Выход с мероприятия
   * @param eventId - ID мероприятия (число)
   * @param userId - ID пользователя (число для participantIds)
   */
  leaveEvent(eventId: number, userId: number): Observable<Event> {
    return this.http.get<Event>(`${this.apiUrl}/events/${eventId}`).pipe(
      switchMap(event => {
        const updatedParticipants = event.participantIds.filter(id => id !== userId);
        return this.http.patch<Event>(`${this.apiUrl}/events/${eventId}`, {
          participantIds: updatedParticipants
        });
      }),
      catchError(this.handleError)
    );
  }

  private handleError(error: any): Observable<never> {
    console.error('Произошла ошибка:', error);
    return throwError(() => new Error('Произошла ошибка при загрузке данных. Пожалуйста, попробуйте позже.'));
  }


  updateUserWithProfileImageDelete(userId: number, updatedFields: Partial<User>, oldImageUrl?: string): Observable<User> {
    if (oldImageUrl) {
      // Сначала удалить старую картинку, потом обновить профиль
      return this.uploadService.deleteProfileImage(oldImageUrl).pipe(
        switchMap(() =>
          this.http.patch<User>(`${this.apiUrl}/users/${userId}`, updatedFields)
        ),
        catchError(() =>
          // Даже если картинку не удалось удалить, всё равно обновляем профиль
          this.http.patch<User>(`${this.apiUrl}/users/${userId}`, updatedFields)
        )
      );
    } else {
      // Просто обновить профиль
      return this.http.patch<User>(`${this.apiUrl}/users/${userId}`, updatedFields);
    }
  }

}