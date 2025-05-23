import { NgIf } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { UserService } from '../../../services/user.service';
import { AuthService } from '../../../services/auth.service';
import * as bcrypt from 'bcryptjs';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  standalone: true,
  imports: [RouterLink, FormsModule, NgIf, CommonModule]
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

  // Не хэшируем пароль, а будем сравнивать с хэшем из базы
  const plainPassword = this.loginData.password;

  this.userService.login(this.loginData.email).subscribe({
    next: (response: any[]) => {
      this.isLoading = false;
      
      if (response && response.length > 0) {
        const user = response[0];
        
        if (!user.id) {
          console.error('User ID is missing!', user);
          this.emailError = 'Ошибка сервера: отсутствует ID пользователя';
          return;
        }

        if (bcrypt.compareSync(plainPassword, user.password)) {
  const storage = this.loginData.rememberMe ? localStorage : sessionStorage;
  storage.setItem('currentUser', JSON.stringify(user));
  this.authService.login(user);

        // Перенаправление по роли:
        if (user.role === 'organization') {
          this.router.navigate(['/admin']); // Страница админа
        } else {
          this.router.navigate(['/profile']); // Обычные пользователи
        }
      } else {
        this.emailError = 'Неверный email или пароль';
      }
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