import {
  Component,
  EventEmitter,
  Input,
  Output,
  ViewChild,
  ElementRef,
  OnInit,
  SimpleChanges,
  OnChanges,
  inject
} from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { User } from '../../../models/user.model';
import { CommonModule } from '@angular/common';
import { UploadService } from '../../../services/upload.service';
import { ProfileService } from '../../../services/profile.service';

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
  private uploadService: UploadService = inject(UploadService);
  oldProfileImage: string | null = null;
  selectedInterests: string[] = [];

  availableInterests = [
    { id: 'ecology', name: 'Экология' },
    { id: 'animals', name: 'Защита животных' },
    { id: 'education', name: 'Образование' },
    { id: 'social', name: 'Социальная помощь' },
    { id: 'health', name: 'Здравоохранение' },
    { id: 'culture', name: 'Культура и искусство' },
    { id: 'sport', name: 'Спорт' },
    { id: 'events', name: 'Организация мероприятий' },
    { id: 'media', name: 'Медиа и IT' },
    { id: 'emergency', name: 'Помощь в ЧС' }
  ];

  constructor(private fb: FormBuilder, private profileService: ProfileService) {
    this.form = this.fb.group({
      fullName: [''],
      email: [''],
      phone: [''],
      city: [''],
      aboutMe: [''],
      interests: [[]],
      profileImage: ['']
    });
  }

  ngOnInit(): void {
    if (this.user) {
      this.patchUser();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['user'] && this.user) {
      this.patchUser();
    }
  }

  private patchUser() {
    this.form.patchValue({
      fullName: this.user.fullName,
      email: this.user.email,
      phone: this.user.phone || '',
      city: this.user.city || '',
      aboutMe: this.user.aboutMe || '',
      interests: this.user.interests || [],
      profileImage: this.user.profileImage || ''
    });

    this.selectedInterests = [...(this.user.interests || [])];

    if (this.user.profileImage) {
      this.previewImage = this.user.profileImage.startsWith('http') 
        ? this.user.profileImage 
        : 'http://localhost:4000' + this.user.profileImage;
    } else {
      this.previewImage = null;
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
      this.onFileSelected({ target: { files: [file] } } as any);
    }
  }

  isInterestSelected(interestId: string): boolean {
    return this.selectedInterests.includes(interestId);
  }

  toggleInterest(interestId: string): void {
    const index = this.selectedInterests.indexOf(interestId);
    if (index === -1) {
      this.selectedInterests.push(interestId);
    } else {
      this.selectedInterests.splice(index, 1);
    }
    this.form.patchValue({ interests: this.selectedInterests });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (file) {
      this.oldProfileImage = this.form.value.profileImage || null;
      this.uploadService.uploadProfileImage(file).subscribe({
        next: (response) => {
          this.form.patchValue({ profileImage: response.url });
          this.previewImage = 'http://localhost:4000' + response.url;
        },
        error: (err) => {
          console.error('Ошибка загрузки:', err);
        }
      });
    }
  }

  onSave(): void {
    const formValue = this.form.value;
    const updatedUser: Partial<User> = {
      ...formValue,
      interests: this.selectedInterests
    };

    if (this.user.id && this.oldProfileImage) {
      this.profileService.updateUserWithProfileImageDelete(
        this.user.id,
        updatedUser,
        this.oldProfileImage
      ).subscribe({
        next: (user) => {
          this.save.emit(updatedUser);
        },
        error: (err) => {
          console.error('Ошибка при обновлении профиля:', err);
        }
      });
    } else {
      this.save.emit(updatedUser);
    }
  }

  clearImage(): void {
    const oldImage = this.form.value.profileImage || '';
    this.previewImage = null;
    this.form.patchValue({ profileImage: '' });

    if (oldImage) {
      this.uploadService.deleteProfileImage(oldImage).subscribe({
        next: () => this.save.emit({ profileImage: '' }),
        error: (err) => {
          console.error('Ошибка удаления файла:', err);
        }
      });
    } 
  }

  onCancel(): void {
    this.cancel.emit();
  }
}