import { Subject } from "rxjs";
import { User } from "../models/user.model";

export class AuthService {
    private isAuthenticated;
    private currentUserId!: number | null;
    private authStateChanged = new Subject<void>(); // Добавляем Subject
    private currentUser!: User  | null;
  getCurrentUser: any;

    constructor() {
      const userData = sessionStorage.getItem('currentUser');
      this.isAuthenticated = !!userData;
      
      if (userData) {
        try {
          const user = JSON.parse(userData);
          this.currentUserId = user.id || null;
          this.currentUser = user;
        } catch (e) {
          console.error('Failed to parse user data', e);
        }
      }
    }
  
    // Добавляем метод для подписки на изменения
    onAuthStateChanged() {
      return this.authStateChanged.asObservable();
    }
  
    /* login(userId: number) {
      this.isAuthenticated = true;
      this.currentUserId = userId;
      this.authStateChanged.next(); // Уведомляем об изменении
      console.log("пользователь авторизовался")
    } */

    login(user: User) { // теперь login принимает пользователя целиком!
      this.isAuthenticated = true;
      this.currentUserId = user.id || null;
      this.currentUser = user; // сохраняем пользователя
      sessionStorage.setItem('currentUser', JSON.stringify(user));
      this.authStateChanged.next();
      console.log("пользователь авторизовался");
    }
  
    /* logout() {
      this.isAuthenticated = false;
      this.currentUserId = null;
      window.sessionStorage.clear();
      this.authStateChanged.next(); // Уведомляем об изменении
      console.log("пользователь вышел")
    } */
  
    logout() {
      this.isAuthenticated = false;
      this.currentUserId = null;
      this.currentUser = null;
      window.sessionStorage.clear();
      this.authStateChanged.next();
      console.log("пользователь вышел");
    }

    isLoggedIn(): boolean {
      return this.isAuthenticated;
    }

    getCurrentUserId(): number | null {
      return this.currentUserId;
    }
    hasRole(role: 'volunteer' | 'organization'): boolean {
      return this.currentUser?.role === role;
  }
}