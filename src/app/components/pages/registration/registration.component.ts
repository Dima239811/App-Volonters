import { NgFor, NgIf } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { User } from '../../../models/user.model';
import { UserService } from '../../../services/user.service';
import { AuthService } from '../../../services/auth.service';
import * as bcrypt from 'bcryptjs';

@Component({
  selector: 'app-registration',
  templateUrl: './registration.component.html',
  styleUrls: ['./registration.component.css'],
  standalone: true,
  imports: [RouterLink, FormsModule, NgIf, NgFor]
})
export class RegistrationComponent {
  userData: User = {
    fullName: '',
    email: '',
    phone: '',
    city: '',
    password: '',
    eventIds: [],
    aboutMe: '',
    interests: [],
    role: 'volunteer',
    agreeTerms: false,
    agreeNewsletter: false
  };
  
  availableInterests = [
    { id: 'ecology', name: 'Экология' },
    { id: 'animals', name: 'Защита животных' },
    { id: 'education', name: 'Образование' },
    { id: 'social', name: 'Социальная помощь' },
    { id: 'health', name: 'Здравоохранение' },
    { id: 'culture', name: 'Культура и искусство' },
    { id: 'sport', name: 'Спорт' },
    { id: 'events', name: 'Организация мероприятий' },
    { id: 'media', name: 'Медиа и IT' },
    { id: 'emergency', name: 'Помощь в ЧС' }
  ];
  
  errors = {
    fullName: '',
    email: '',
    password: '',
    passwordConfirm: ''
  };
  
  passwordConfirm = '';
  isLoading = false;
  
  constructor(
    private router: Router,
    private userService: UserService,
    private authService: AuthService
  ) {}
  
  validateForm(): boolean {
    let isValid = true;
    
    if (!this.userData.fullName.trim()) {
      this.errors.fullName = 'Пожалуйста, введите имя и фамилию';
      isValid = false;
    } else {
      this.errors.fullName = '';
    }
    
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(this.userData.email)) {
      this.errors.email = 'Пожалуйста, введите корректный email';
      isValid = false;
    } else {
      this.errors.email = '';
    }
    
    if (this.userData.password.length < 8) {
      this.errors.password = 'Пароль должен содержать не менее 8 символов';
      isValid = false;
    } else {
      this.errors.password = '';
    }
    
    if (this.userData.password !== this.passwordConfirm) {
      this.errors.passwordConfirm = 'Пароли не совпадают';
      isValid = false;
    } else {
      this.errors.passwordConfirm = '';
    }
    
    if (!this.userData.agreeTerms) {
      alert('Необходимо согласиться с условиями использования');
      isValid = false;
    }
    
    return isValid;
  }
  
  toggleInterest(interestId: string): void {
    const index = this.userData.interests?.indexOf(interestId) ?? -1;
    if (index === -1) {
      this.userData.interests?.push(interestId);
    } else {
      this.userData.interests?.splice(index, 1);
    }
  }
  
  isInterestSelected(interestId: string): boolean {
    return this.userData.interests?.includes(interestId) ?? false;
  }
  
  onSubmit(): void {
    if (!this.validateForm()) return;
    
    this.isLoading = true;
    
    // Проверяем, существует ли пользователь с таким email
    this.userService.getUserByEmail(this.userData.email).subscribe({
      next: (users) => {
        if (users.length > 0) {
          this.errors.email = 'Пользователь с таким email уже зарегистрирован';
          this.isLoading = false;
        } else {
           // ✅ Хэшируем пароль перед отправкой на сервер
          const hashedPassword = bcrypt.hashSync(this.userData.password, 10);
          this.userData.password = hashedPassword;
          // Создаем нового пользователя
          this.userService.createUser(this.userData).subscribe({
            next: (newUser) => {
              this.isLoading = false;
              alert('Регистрация успешна! Добро пожаловать в ДоброДело!');
              
              this.router.navigate(['/login']);
            },
            error: (err) => {
              this.isLoading = false;
              console.error('Ошибка при регистрации:', err);
              alert('Произошла ошибка при регистрации. Пожалуйста, попробуйте позже.');
            }
          });
        }
      },
      error: (err) => {
        this.isLoading = false;
        console.error('Ошибка при проверке email:', err);
        alert('Произошла ошибка при проверке email. Пожалуйста, попробуйте позже.');
      }
    });
  }
  
  goBack(): void {
    this.router.navigate(['/']);
  }
}