import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, throwError, of } from 'rxjs';
import { User } from '../models/user.model';
import { Event } from '../models/event.model';


@Injectable({
    providedIn: 'root'
  })
  export class UserService {
    private apiUrl = 'http://localhost:3000/users';
    private apiUrl2 = 'http://localhost:3000';
    constructor(private http: HttpClient) { }
  
    // Создать нового пользователя
    createUser(user: User): Observable<User> {
      return this.http.post<User>(this.apiUrl, user);
    }
  
    // Получить всех пользователей
    getUsers(): Observable<User[]> {
      return this.http.get<User[]>(this.apiUrl);
    }
  
    // Получить пользователя по email (для проверки существования)
    getUserByEmail(email: string): Observable<User[]> {
      return this.http.get<User[]>(`${this.apiUrl}?email=${email}`);
    }
  
    // Получить пользователя по id
    getUserById(id: number): Observable<User> {
      return this.http.get<User>(`${this.apiUrl}/${id}`);
    }
  
    // Обновить пользователя
    updateUser(id: number, user: Partial<User>): Observable<User> {
      return this.http.patch<User>(`${this.apiUrl}/${id}`, user);
    }
  
    // Удалить пользователя
    deleteUser(id: number): Observable<void> {
      return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }

    login(email: string, password: string): Observable<any> {
        return this.http.get(`${this.apiUrl2}/users?email=${email}&password=${password}`).pipe(
          catchError(error => {
            console.error('Login error:', error);
            return throwError(() => new Error('Ошибка при входе. Пожалуйста, попробуйте позже.'));
          })
        );
      }


  
    }

