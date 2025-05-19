import { Subject } from "rxjs";

export class AuthService {
    private isAuthenticated;
    private currentUserId!: number | null;
    private authStateChanged = new Subject<void>(); // Добавляем Subject
    
    constructor() {
      const userData = sessionStorage.getItem('currentUser');
      this.isAuthenticated = !!userData;
      
      if (userData) {
        try {
          const user = JSON.parse(userData);
          this.currentUserId = user.id || null;
        } catch (e) {
          console.error('Failed to parse user data', e);
        }
      }
    }
  
    // Добавляем метод для подписки на изменения
    onAuthStateChanged() {
      return this.authStateChanged.asObservable();
    }
  
    login(userId: number) {
      this.isAuthenticated = true;
      this.currentUserId = userId;
      this.authStateChanged.next(); // Уведомляем об изменении
      console.log("пользователь авторизовался")
    }
  
    logout() {
      this.isAuthenticated = false;
      this.currentUserId = null;
      window.sessionStorage.clear();
      this.authStateChanged.next(); // Уведомляем об изменении
      console.log("пользователь вышел")
    }
  
    isLoggedIn(): boolean {
      return this.isAuthenticated;
    }

    getCurrentUserId(): number | null {
      return this.currentUserId;
    }
}