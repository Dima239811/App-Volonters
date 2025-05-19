import { NgClass, NgIf } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { UserService } from '../../../services/user.service';
import { AuthService } from '../../../services/auth.service';


@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  standalone: true,
  imports: [NgClass, RouterLink, FormsModule, NgIf]
})
export class LoginComponent {
  loginData = {
    email: '',
    password: '',
    rememberMe: false
  };
  
  showPassword = false;
  emailError = '';
  passwordError = '';
  isLoading = false; // Добавляем индикатор загрузки
  
  constructor(
    private router: Router,
    private userService: UserService,
    private authService: AuthService
  ) {}
  
  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }
  
  validateForm(): boolean {
    let isValid = true;
    
    // Проверка email
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(this.loginData.email)) {
      this.emailError = 'Пожалуйста, введите корректный email';
      isValid = false;
    } else {
      this.emailError = '';
    }
    
    // Проверка пароля
    if (!this.loginData.password.trim()) {
      this.passwordError = 'Пожалуйста, введите пароль';
      isValid = false;
    } else {
      this.passwordError = '';
    }
    
    return isValid;
  }
  
  onSubmit(): void {
    if (!this.validateForm()) return;
  
    this.isLoading = true;
    this.emailError = '';
    this.passwordError = '';
  
    this.userService.login(this.loginData.email, this.loginData.password).subscribe({
      next: (response: any[]) => {
        this.isLoading = false;
        
        if (response && response.length > 0) {
          const user = response[0];
          
          if (!user.id) {
            console.error('User ID is missing!', user);
            this.emailError = 'Ошибка сервера: отсутствует ID пользователя';
            return;
          }
  
          const storage = this.loginData.rememberMe ? localStorage : sessionStorage;
          storage.setItem('currentUser', JSON.stringify(user));
          this.authService.login(user.id);
          this.router.navigate(['/profile']);

        } else {
          this.emailError = 'Неверный email или пароль';
        }
      },
      error: (err) => {
        this.isLoading = false;
        this.emailError = 'Ошибка сервера. Пожалуйста, попробуйте позже.';
        console.error('Login error:', err);
      }
    });
  }
  
  goBack(): void {
    this.router.navigate(['/']);
  }
}