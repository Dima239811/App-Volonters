import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { EventService } from '../../../services/event.service';
/* import { Event } from '../../../models/event.model'; */
import { UploadService } from '../../../services/upload.service';
import { Event as EventModel } from '../../../models/event.model';
import { EventCardComponent } from '../../shared/event-card/event-card.component';
import { NavbarComponent } from '../../shared/navbar/navbar.component';

@Component({
  selector: 'app-admin-events',
  standalone: true,
  templateUrl: './admin-events.component.html',
  styleUrls: ['./admin-events.component.css'],
  imports: [CommonModule, ReactiveFormsModule, EventCardComponent, NavbarComponent]
})
export class AdminEventsComponent implements OnInit {
  eventForm: FormGroup;
  uploadInProgress = false;
  uploadError = '';
  uploadedImageUrl: string | null = null;
  events: EventModel[] = [];
  createError = '';
   loading = false;
  error: string | null = null;
  

  constructor(
    private fb: FormBuilder,
    private uploadService: UploadService,
    private eventService: EventService
  ) {
    this.eventForm = this.fb.group({
      title: ['', Validators.required],
      description: ['', Validators.required],
      date: ['', Validators.required],
      time: ['', Validators.required],
      location: ['', Validators.required],
      category: ['', Validators.required],
      imageUrl: [''],
      isUrgent: ['нет'],
      status: ['активно']
    });
  }

  ngOnInit(): void {
    this.loadEvents();
  }

  loadEvents(): void {
    this.eventService.getEvents().subscribe({
      next: (events) => (this.events = events),
      error: (err) => console.error('Ошибка загрузки событий:', err)
    });
  }

  onFileSelected(event: Event): void {
  this.uploadError = '';
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];
  if (file) {
    // Передаём старое изображение события, если оно есть (можно использовать для удаления, если реализовано)
    const oldImage = this.eventForm.value.imageUrl || '';
    this.uploadInProgress = true;
    this.uploadService.uploadEventImage(file).subscribe({
      next: (response) => {
        this.eventForm.patchValue({ imageUrl: response.url });
        this.uploadedImageUrl = 'http://localhost:4000' + response.url;
        this.uploadInProgress = false;
      },
      error: (err) => {
        this.uploadError = 'Ошибка при загрузке изображения';
        console.error('Ошибка загрузки:', err);
        this.uploadedImageUrl = null;
        this.uploadInProgress = false;
      }
    });
  }
}

  submitEvent(): void {
    if (this.eventForm.invalid) return;
    console.log(this.eventForm.value);
    this.createError = '';
    this.eventService.createEvent(this.eventForm.value).subscribe({
      next: () => {
        this.eventForm.reset();
        this.uploadedImageUrl = null;
        this.loadEvents();
      },
      error: () => {
        this.createError = 'Ошибка при создании события';
      }
    });
  }

  getEventImageUrl(imgPath: string | undefined): string {
    if (!imgPath) return 'assets/no-event-img.png';
    return imgPath.startsWith('http') ? imgPath : 'http://localhost:4000' + imgPath;
  }

  onEventDeleted() {
    this.loadEvents();
}
}