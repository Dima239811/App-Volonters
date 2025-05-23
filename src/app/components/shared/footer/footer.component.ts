import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.css'],
  standalone: true,
  imports: [RouterLink],
})
export class FooterComponent {
  currentYear = new Date().getFullYear();
  email: string = '';

  onSubmit() {
    console.log('Подписка на новости:', this.email);
    // Здесь будет логика отправки запроса на бэкенд
    this.email = '';
    alert('Спасибо за подписку!');
  }
}
