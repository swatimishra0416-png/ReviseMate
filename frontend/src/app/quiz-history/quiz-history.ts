
import { Component, ChangeDetectorRef, OnInit } from '@angular/core';
import { QuizService, QuizAttempt } from '../services/quiz.service';
import { DatePipe } from '@angular/common';
@Component({
  selector: 'app-quiz-history',
  imports: [DatePipe],
  templateUrl: './quiz-history.html',
  styleUrl: './quiz-history.css'
})
export class QuizHistory implements OnInit {
  attempts: QuizAttempt[] = [];
  loading = true;
  errorMessage = '';

  constructor(
    private quizService: QuizService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.loadHistory();
  }

  loadHistory() {
    this.loading = true;
    this.errorMessage = '';

    this.quizService.getAttempts().subscribe({
      next: (attempts) => {
        this.attempts = attempts;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Could not load quiz history:', error);
        this.loading = false;
        this.errorMessage =
          'Could not load quiz history. Please check that the backend is running.';
        this.cdr.detectChanges();
      }
    });
  }

  getPercentage(attempt: QuizAttempt): number {
    return attempt.totalQuestions > 0
      ? Math.round((attempt.score / attempt.totalQuestions) * 100)
      : 0;
  }
  getAveragePercentage(): number {
  if (this.attempts.length === 0) {
    return 0;
  }

  const total = this.attempts.reduce(
    (sum, attempt) => sum + this.getPercentage(attempt),
    0
  );

  return Math.round(total / this.attempts.length);
}
}
