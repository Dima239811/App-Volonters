
import { Component } from '@angular/core';
import { FormsModule, NgModel } from '@angular/forms';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.css'],
  standalone: true,
  imports: [RouterLink, FormsModule],
})
export class FooterComponent {
  currentYear = new Date().getFullYear();
  email: string = '';

  onSubmit() {
    if (this.email==""){
      alert('Укажите почту')
      return
    }
    console.log('Подписка на новости:', this.email);
    this.email = '';
    alert('Спасибо за подписку!');
  }
}
