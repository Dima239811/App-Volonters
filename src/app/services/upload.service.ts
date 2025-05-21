import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UploadService {
 constructor(private http: HttpClient) {}
  private apiUrl = 'http://localhost:4000';

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

  deleteProfileImage(imageUrl: string) {
  return this.http.delete('http://localhost:4000/api/delete/profile-image', {
    body: { imageUrl }
  });
}
}
