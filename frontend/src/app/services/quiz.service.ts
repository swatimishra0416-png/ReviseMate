
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface QuizQuestion {
  _id: string;
  subject: string;
  question: string;
  options: string[];
}

export interface QuizAnswer {
  correctAnswer: string;
  explanation: string;
}

export interface QuizAttempt {
  _id?: string;
  subject: string;
  score: number;
  totalQuestions: number;
  completedAt?: string;
  createdAt?: string;
}

@Injectable({
  providedIn: 'root'
})
export class QuizService {
  private apiUrl = 'http://localhost:3000/api/quiz/questions';
  private attemptsUrl = 'http://localhost:3000/api/quiz/attempts';

  constructor(private http: HttpClient) {}

  getQuestions(subject: string): Observable<QuizQuestion[]> {
    return this.http.get<QuizQuestion[]>(
      `${this.apiUrl}?subject=${encodeURIComponent(subject)}`
    );
  }

  getAnswer(questionId: string): Observable<QuizAnswer> {
    return this.http.get<QuizAnswer>(
      `${this.apiUrl}/${questionId}/answer`
    );
  }

  saveAttempt(
    subject: string,
    score: number,
    totalQuestions: number
  ): Observable<{ message: string; attempt: QuizAttempt }> {
    return this.http.post<{ message: string; attempt: QuizAttempt }>(
      this.attemptsUrl,
      { subject, score, totalQuestions }
    );
  }

  getAttempts(subject?: string): Observable<QuizAttempt[]> {
    const url = subject
      ? `${this.attemptsUrl}?subject=${encodeURIComponent(subject)}`
      : this.attemptsUrl;

    return this.http.get<QuizAttempt[]>(url);
  }
}
