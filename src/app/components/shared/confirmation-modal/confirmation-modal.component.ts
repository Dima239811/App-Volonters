import { Component, EventEmitter, Input, Output } from '@angular/core';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-confirmation-modal',
  templateUrl: './confirmation-modal.component.html',
  styleUrls: ['./confirmation-modal.component.css'],
  imports: [NgIf ]
})
export class ConfirmationModalComponent {
  @Input() isOpen = false;
  @Input() title = 'Подтверждение';
  @Output() confirmed = new EventEmitter<void>();
  @Output() closed = new EventEmitter<void>();
  @Input() isLoading: boolean = false;

  onConfirm() {
    this.confirmed.emit();
    this.isOpen = false;
  }

  onClose() {
    this.closed.emit();
    this.isOpen = false;
  }
}