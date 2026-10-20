
import { CommonModule } from '@angular/common';
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { NotesService } from '../services/notes.service';
import { FlashcardsService, Flashcard } from '../services/flashcards.service';

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

  loading = true;
  errorMessage = '';

  constructor(
    private notesService: NotesService,
    private flashcardsService: FlashcardsService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    this.loading = true;
    this.errorMessage = '';

    let notesLoaded = false;
    let flashcardsLoaded = false;
    let hasError = false;

    const finishLoading = () => {
      if (notesLoaded && flashcardsLoaded) {
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
    });
  }
}
