// home.component.ts
import { Component, OnInit } from '@angular/core';
import { EventService } from '../../../services/event.service';
import { Event } from '../../../models/event.model';
import { Testimonial } from '../../../models/testimonial.model';
import { NavbarComponent } from '../../shared/navbar/navbar.component';
import { HeroComponent } from '../../shared/hero/hero.component';
import { EventCardComponent } from '../../shared/event-card/event-card.component';
import { FooterComponent } from '../../shared/footer/footer.component';
import { StepCardComponent } from '../../shared/step-card/step-card.component';
import { TestimonialCardComponent } from '../../shared/testimonial-card/testimonial-card.component';
import { CommonModule, NgIf } from '@angular/common';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
  standalone: true,
  imports: [
    NavbarComponent,
    HeroComponent,
    EventCardComponent,
    FooterComponent,
    StepCardComponent,
    TestimonialCardComponent,
    NgIf,
    CommonModule,
  ],
})
export class HomeComponent implements OnInit {
  events: Event[] = [];
  testimonials: Testimonial[] = [];
  loading = true;
  error: string | null = null;

  constructor(private eventService: EventService) {}

  ngOnInit() {
    this.loadFeaturedEvents();
    this.loadTestimonials();
  }

  loadFeaturedEvents() {
    this.loading = true;
    this.error = null;
    
    this.eventService.getEvents().subscribe({
      next: (events) => {
        this.events = events;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Не удалось загрузить мероприятия';
        this.loading = false;
        console.error('Ошибка при загрузке мероприятий:', err);
      }
    });
    console.log(this.events)
  }

  loadTestimonials() {
    // В реальном приложении здесь был бы запрос к API
    this.testimonials = [
      {
        id: 1,
        name: 'Анна',
        role: 'волонтер с 2022 года',
        text: '"Присоединившись к ДоброДело, я нашла не только возможность помогать другим, но и единомышленников. Организация мероприятий всегда на высоте!"',
        imageUrl: 'https://randomuser.me/api/portraits/women/65.jpg',
      },
      {
        id: 2,
        name: 'Михаил',
        role: 'организатор мероприятий',
        text: '"Благодаря этой платформе я смог реализовать свой волонтерский проект и найти помощников. Сейчас наша команда постоянно растет!"',
        imageUrl: 'https://randomuser.me/api/portraits/men/32.jpg',
      },
      {
        id: 3,
        name: 'Елена',
        role: 'волонтер с 2023 года',
        text: '"Очень удобный сервис для поиска волонтерских мероприятий. Регистрация быстрая, интерфейс понятный, а главное - много интересных проектов."',
        imageUrl: 'https://randomuser.me/api/portraits/women/44.jpg',
      },
    ];
  }
}
