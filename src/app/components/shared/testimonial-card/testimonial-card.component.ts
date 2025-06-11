import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-testimonial-card',
  templateUrl: './testimonial-card.component.html',
  standalone: true,
  styleUrls: ['./testimonial-card.component.css']
})
export class TestimonialCardComponent {
  @Input() name: string = '';
  @Input() role: string = '';
  @Input() imageUrl: string = '';
  @Input() text: string = '';
}