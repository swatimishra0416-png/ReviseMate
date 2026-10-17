import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface StudyMaterial {
  _id?: string;
  title: string;
  subject: string;
  content: string;
  createdAt?: string;
  updatedAt?: string;
}

@Injectable({
  providedIn: 'root'
})
export class NotesService {
  private apiUrl = 'http://localhost:3000/api/notes';

  constructor(private http: HttpClient) {}

  getNotes(): Observable<StudyMaterial[]> {
    return this.http.get<StudyMaterial[]>(this.apiUrl);
  }

  createNote(material: StudyMaterial): Observable<StudyMaterial> {
    return this.http.post<StudyMaterial>(this.apiUrl, material);
  }

  updateNote(
    id: string,
    material: StudyMaterial
  ): Observable<StudyMaterial> {
    return this.http.put<StudyMaterial>(
      `${this.apiUrl}/${id}`,
      material
    );
  }

  deleteNote(id: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(
      `${this.apiUrl}/${id}`
    );
  }
}