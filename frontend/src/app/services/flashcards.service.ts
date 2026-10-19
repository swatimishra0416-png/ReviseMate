
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Flashcard {
  _id?: string;
  question: string;
  answer: string;
  subject: string;
  createdAt?: string;
  updatedAt?: string;
  status?: 'needs-revision' | 'known';
}

@Injectable({
  providedIn: 'root'
})
export class FlashcardsService {
  private apiUrl = 'http://localhost:3000/api/flashcards';

  constructor(private http: HttpClient) {}

  getFlashcards(): Observable<Flashcard[]> {
    return this.http.get<Flashcard[]>(this.apiUrl);
  }

  createFlashcard(
    flashcard: Flashcard
  ): Observable<Flashcard> {
    return this.http.post<Flashcard>(this.apiUrl, flashcard);
  }

  updateFlashcard(
    id: string,
    flashcard: Flashcard
  ): Observable<Flashcard> {
    return this.http.put<Flashcard>(
      `${this.apiUrl}/${id}`,
      flashcard
    );
  }

  deleteFlashcard(
    id: string
  ): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(
      `${this.apiUrl}/${id}`
    );
  }
  updateStatus(
  id: string,
  status: 'needs-revision' | 'known'
): Observable<Flashcard> {
  return this.http.patch<Flashcard>(
    `${this.apiUrl}/${id}/status`,
    { status }
  );
}
}
