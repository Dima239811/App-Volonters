// hero.component.ts
import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-hero',
  standalone: true,
  imports: [],
  template: `
    <section class="hero" [style.background-image]="'url(' + backgroundImage + ')'">
      <div class="hero-overlay"></div>
      <div class="container">
        <div class="hero-content">
          <h1>{{ title }}</h1>
          <p>{{ description }}</p>
        </div>
      </div>
    </section>
  `,
  styleUrls: ['./hero.component.css']
})
export class HeroComponent {
  @Input() title: string = '';
  @Input() description: string = '';
  @Input() backgroundImage: string = '';
}