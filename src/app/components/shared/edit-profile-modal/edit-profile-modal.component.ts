import {
  Component,
  EventEmitter,
  Input,
  Output,
  ViewChild,
  ElementRef,
  OnInit,
  SimpleChanges, OnChanges
} from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { User } from '../../../models/user.model';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-edit-profile-modal',
  templateUrl: './edit-profile-modal.component.html',
  imports: [ReactiveFormsModule, CommonModule],
  styleUrl: './edit-profile-modal.component.css'
})


export class EditProfileModalComponent implements OnInit, OnChanges {
  @Input() user!: User;
  @Output() save = new EventEmitter<Partial<User>>();
  @Output() cancel = new EventEmitter<void>();
  @ViewChild('fileInput') fileInputRef!: ElementRef<HTMLInputElement>;

  form: FormGroup;
  previewImage: string | null = null;
  isDragging = false;
  private readonly IMAGE_STORAGE_KEY = 'user_profile_image';

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      fullName: [''],
      email: [''],
      phone: [''],
      city: [''],
      aboutMe: [''],
      interests: [''],
      profileImage: ['']
    });
  }

  ngOnInit(): void {
    this.loadImageFromStorage();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['user'] && this.user) {
      this.form.patchValue({
        fullName: this.user.fullName,
        email: this.user.email,
        phone: this.user.phone || '',
        city: this.user.city || '',
        aboutMe: this.user.aboutMe || '',
        interests: this.user.interests?.join(', ') || ''
      });

      this.previewImage = this.user.profileImage || this.loadImageFromStorage();
    }
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    this.isDragging = true;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    this.isDragging = false;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    this.isDragging = false;
    const file = event.dataTransfer?.files?.[0];
    if (file) {
      this.processImageFile(file);
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (file) {
      this.processImageFile(file);
    }
  }

  private async processImageFile(file: File): Promise<void> {
    try {
      const optimizedImage = await this.compressImage(file);
      this.previewImage = optimizedImage;
      this.form.patchValue({ profileImage: optimizedImage });
      this.saveImageToStorage(optimizedImage);
    } catch (error) {
      console.error('Error processing image:', error);
    }
  }

  private compressImage(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;

        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');

          // Устанавливаем максимальные размеры
          const MAX_WIDTH = 800;
          const MAX_HEIGHT = 800;
          let width = img.width;
          let height = img.height;

          // Изменяем размеры, если нужно
          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }

          canvas.width = width;
          canvas.height = height;

          // Рисуем сжатое изображение
          ctx?.drawImage(img, 0, 0, width, height);

          // Конвертируем в base64 с качеством 70%
          resolve(canvas.toDataURL('image/jpeg', 0.7));
        };

        img.onerror = () => reject(new Error('Failed to load image'));
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsDataURL(file);
    });
  }

  private saveImageToStorage(imageData: string): void {
    localStorage.setItem(this.IMAGE_STORAGE_KEY, imageData);
  }

  private loadImageFromStorage(): string | null {
    return localStorage.getItem(this.IMAGE_STORAGE_KEY);
  }

  onSave(): void {
    const formValue = this.form.value;
    const updatedUser: Partial<User> = {
      ...formValue,
      interests: formValue.interests?.split(',').map((i: string) => i.trim()) || []
    };
    this.save.emit(updatedUser);
  }

  clearImage(): void {
    this.previewImage = null;
    this.form.patchValue({ profileImage: '' });
    localStorage.removeItem(this.IMAGE_STORAGE_KEY);
  }
}