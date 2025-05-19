import { NgClass } from '@angular/common';
import { Component, Input, NgModule, OnInit } from '@angular/core';

@Component({
  selector: 'app-badge',
  templateUrl: './badge.component.html',
  styleUrls: ['./badge.component.css'],
  standalone: true,
  imports: [NgClass],
})
export class BadgeComponent implements OnInit {
  @Input() text: string = '';
  @Input() type: 'success' | 'danger' | 'primary' | 'secondary' = 'success';

  badgeClass: string = '';

  ngOnInit() {
    this.badgeClass = `badge-${this.type}`;
  }
}
