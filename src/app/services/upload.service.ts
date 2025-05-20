import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UploadService {
 constructor(private http: HttpClient) {}
  private apiUrl = 'http://localhost:4000';
  /* uploadImage(file: File): Observable<{ url: string }> {
    const formData = new FormData();
    formData.append('image', file); // 'image' — то же имя, что в backend
    return this.http.post<{ url: string }>('http://localhost:4000/api/upload', formData);
  } */

  uploadProfileImage(file: File): Observable<{ url: string }> {
    const formData = new FormData();
    formData.append('image', file);
    return this.http.post<{ url: string }>(`${this.apiUrl}/api/upload/profile`, formData);
  }

  uploadEventImage(file: File): Observable<{ url: string }> {
    const formData = new FormData();
    formData.append('image', file);
    return this.http.post<{ url: string }>(`${this.apiUrl}/api/upload/event`, formData);
  }
}
