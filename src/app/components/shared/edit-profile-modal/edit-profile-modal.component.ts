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

  constructor(private fb: FormBuilder, private profileSevice: ProfileService) {
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
      interests: this.user.interests?.join(', ') || '',
      profileImage: this.user.profileImage || ''
    });

    if (this.user.profileImage) {
      // если profileImage хранится как '/uploads/файл.jpg'
      this.previewImage = 'http://localhost:4000' + this.user.profileImage;
      // если хранится как полный url, просто: this.previewImage = this.user.profileImage;
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

  onFileSelected(event: Event): void {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];
  if (file) {
    // Сохраняем старое фото для удаления при onSave
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
    interests: formValue.interests?.split(',').map((i: string) => i.trim()) || []
  };

  // Тут можно добавить удаление старого фото, если оно было (опционально)
  if (this.user.id && this.oldProfileImage) {
    this.profileSevice.updateUserWithProfileImageDelete(
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
    this.oldProfileImage = null;
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
}