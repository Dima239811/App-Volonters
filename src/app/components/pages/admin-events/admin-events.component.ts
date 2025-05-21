import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { EventService } from '../../../services/event.service';
import { UploadService } from '../../../services/upload.service';
import { Event as EventModel } from '../../../models/event.model';
import { EventCardComponent } from '../../shared/event-card/event-card.component';
import { NavbarComponent } from '../../shared/navbar/navbar.component';
import { AuthService } from '../../../services/auth.service';

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
  minDate: string;
  selectedFile: File | null = null;
  previewUrl: string | null = null;

  constructor(
    private fb: FormBuilder,
    private uploadService: UploadService,
    private eventService: EventService,
    private authService: AuthService,
  ) {
    // Устанавливаем минимальную дату - сегодня
    const today = new Date();
    this.minDate = today.toISOString().split('T')[0];
    this.eventForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3)]],
      description: ['', [Validators.required, Validators.minLength(10)]],
      date: ['', [Validators.required, this.futureDateValidator]],
      time: ['', [Validators.required, this.validTimeValidator]],
      location: ['', [Validators.required, Validators.minLength(3)]],
      category: ['', Validators.required],
      imageUrl: [''],
      isUrgent: ['нет'],
      status: ['активно']
    });
  }

  ngOnInit(): void {
    this.loadEvents();
  }

  // Валидатор для проверки что дата в будущем
  futureDateValidator(control: any): { [key: string]: any } | null {
    const selectedDate = new Date(control.value);
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Сбрасываем время для точного сравнения дат

    if (selectedDate < today) {
      return { 'pastDate': true };
    }
    return null;
  }

  // Валидатор для проверки корректности времени
  validTimeValidator(control: any): { [key: string]: any } | null {
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(control.value)) {
      return { 'invalidTime': true };
    }
    return null;
  }

  loadEvents(): void {
    this.loading = true;
    this.error = null;
    this.eventService.getEvents().subscribe({
      next: (events) => {
        this.events = events;
        this.loading = false;
      },
      error: (err) => {
        console.error('Ошибка загрузки событий:', err);
        this.error = 'Не удалось загрузить мероприятия';
        this.loading = false;
      }
    });
  }

  onFileSelected(event: Event): void {
    this.uploadError = '';

    // Получаем элемент input и выбранный файл
    const target = event.target as HTMLInputElement;
    const selected = target.files?.[0];

    if (selected) {
      this.selectedFile = selected;
      const reader = new FileReader();
      reader.onload = (e) => this.previewUrl = e.target?.result as string;
      reader.readAsDataURL(selected);
      // Проверка типа файла
      if (!selected.type.match('image.*')) {
        this.uploadError = 'Можно загружать только изображения';
        this.selectedFile = null;
        return;
      }

      // Проверка размера файла (например, до 5MB)
      if (selected.size > 5 * 1024 * 1024) {
        this.uploadError = 'Размер файла не должен превышать 5MB';
        this.selectedFile = null;
        return;
      }

      const oldImage = this.eventForm.value.imageUrl || '';
      this.uploadInProgress = true;

      this.uploadService.uploadEventImage(selected).subscribe({
        next: (response) => {
          this.eventForm.patchValue({ imageUrl: response.url });
          this.uploadedImageUrl = 'http://localhost:4000' + response.url;
          this.uploadInProgress = false;
        },
        error: (err) => {
          this.uploadError = 'Ошибка при загрузке изображения';
          console.error('Ошибка загрузки:', err);
          this.selectedFile = null;
          this.uploadedImageUrl = null;
          this.uploadInProgress = false;
        }
      });
    } else {
      this.selectedFile = null;
    }
  }
  removeImage(): void {
    // Получаем элемент input file
    const fileInput = document.querySelector('.file-upload__input') as HTMLInputElement;

    // Полный сброс состояния
    this.selectedFile = null;
    this.previewUrl = null;
    this.uploadedImageUrl = null;
    this.uploadError = '';
    this.eventForm.patchValue({ imageUrl: '' });

    // Важно: сбрасываем значение input элемента
    if (fileInput) {
      fileInput.value = '';
    }
  }
  getFileSize(bytes: number): string {
    if (bytes < 1024) return bytes + ' байт';
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' КБ';
    else return (bytes / 1048576).toFixed(1) + ' МБ';
  }
  submitEvent(): void {
    if (this.eventForm.invalid) {
      this.eventForm.markAllAsTouched();
      return;
    }

    const creatorId = this.authService.getCurrentUserId();
    if (!creatorId) {
      this.createError = 'Не удалось определить организатора';
      return;
    }

    const eventData = {
      ...this.eventForm.value,
      datetime: this.combineDateAndTime(this.eventForm.value.date, this.eventForm.value.time),
      participantIds: [], // Инициализируем пустой массив участников
    };

    this.createError = '';
    this.loading = true;

    this.eventService.createEvent(eventData, creatorId).subscribe({
      next: () => {
        this.eventForm.reset({
          isUrgent: 'нет',
          status: 'активно'
        });
        this.uploadedImageUrl = null;
        this.loading = false;
        this.loadEvents();
        this.removeImage();
      },
      error: (err) => {
        this.createError = 'Ошибка при создании события';
        this.loading = false;
        console.error('Ошибка:', err);
      }
    });
  }

  private combineDateAndTime(dateStr: string, timeStr: string): Date {
    const date = new Date(dateStr);
    const [hours, minutes] = timeStr.split(':').map(Number);
    date.setHours(hours, minutes);
    return date;
  }

  getEventImageUrl(imgPath: string | undefined): string {
    if (!imgPath) return 'assets/no-event-img.png';
    return imgPath.startsWith('http') ? imgPath : 'http://localhost:4000' + imgPath;
  }

  onEventDeleted() {
    this.loadEvents();
  }
  get title() { return this.eventForm.get('title'); }
  get description() { return this.eventForm.get('description'); }
  get date() { return this.eventForm.get('date'); }
  get time() { return this.eventForm.get('time'); }
  get location() { return this.eventForm.get('location'); }
  get category() { return this.eventForm.get('category'); }
}
