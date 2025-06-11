import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-step-card',
  templateUrl: './step-card.component.html',
  standalone: true,
  styleUrls: ['./step-card.component.css'],
})
export class StepCardComponent {
  @Input() title: string = '';
  @Input() description: string = '';
  @Input() iconClass: string = '';
}
