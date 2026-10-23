
import { CommonModule } from '@angular/common';
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { NotesService } from '../services/notes.service';
import { FlashcardsService, Flashcard } from '../services/flashcards.service';
import { QuizService, QuizAttempt } from '../services/quiz.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class Dashboard implements OnInit {
  studentName = 'Swati';

  totalNotes = 0;
  totalFlashcards = 0;
  masteredFlashcards = 0;
  revisionProgress = 0;
  totalQuizAttempts = 0;
  averageQuizScore = 0;

  loading = true;
  errorMessage = '';

  constructor(
  private notesService: NotesService,
  private flashcardsService: FlashcardsService,
  private quizService: QuizService,
  private cdr: ChangeDetectorRef
)  {}

  ngOnInit(): void {
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    this.loading = true;
    this.errorMessage = '';

    let notesLoaded = false;
    let flashcardsLoaded = false;
    let hasError = false;
    let quizLoaded = false;

    const finishLoading = () => {
      if (notesLoaded && flashcardsLoaded && quizLoaded) {
        this.loading = false;

        if (hasError) {
          this.errorMessage =
            'Some dashboard statistics could not be loaded. Please check your backend.';
        }

        this.cdr.detectChanges();
      }
    };

    this.notesService.getNotes().subscribe({
      next: notes => {
        this.totalNotes = notes.length;
        notesLoaded = true;
        finishLoading();
      },
      error: error => {
        console.error('Could not load notes:', error);
        hasError = true;
        notesLoaded = true;
        finishLoading();
      }
    });

    this.flashcardsService.getFlashcards().subscribe({
      next: (cards: Flashcard[]) => {
        this.totalFlashcards = cards.length;

        this.masteredFlashcards = cards.filter(
          card => card.status === 'known'
        ).length;

        this.revisionProgress = cards.length
          ? Math.round(
              (this.masteredFlashcards / cards.length) * 100
            )
          : 0;

        flashcardsLoaded = true;
        finishLoading();
      },
      error: error => {
        console.error('Could not load flashcards:', error);
        hasError = true;
        flashcardsLoaded = true;
        finishLoading();
      }
    }
  );
  this.quizService.getAttempts().subscribe({
  next: (attempts: QuizAttempt[]) => {
    this.totalQuizAttempts = attempts.length;

    this.averageQuizScore = attempts.length
      ? Math.round(
          attempts.reduce(
            (sum, attempt) =>
              sum +
              (attempt.totalQuestions > 0
                ? (attempt.score / attempt.totalQuestions) * 100
                : 0),
            0
          ) / attempts.length
        )
      : 0;

    quizLoaded = true;
    finishLoading();
  },
  error: error => {
    console.error('Could not load quiz attempts:', error);
    hasError = true;
    quizLoaded = true;
    finishLoading();
  }
});
  }
}
