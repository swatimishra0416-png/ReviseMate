
import { CommonModule } from '@angular/common';
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  Flashcard,
  FlashcardsService
} from '../services/flashcards.service';

@Component({
  selector: 'app-flashcards',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './flashcards.html',
  styleUrl: './flashcards.css'
})
export class Flashcards implements OnInit {
  flashcards: Flashcard[] = [];

  subjects = [
    'Computer Networks',
    'DBMS',
    'Operating Systems',
    'Data Structures'
  ];
  updatingStatus = false;

  selectedSubject = 'Computer Networks';
  currentIndex = 0;
  isFlipped = false;

  question = '';
  answer = '';
  formSubject = 'Computer Networks';

  editingId: string | null = null;
  loading = false;
  saving = false;
  errorMessage = '';
  successMessage = '';

  constructor(
    private flashcardsService: FlashcardsService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadFlashcards();
  }

  get filteredFlashcards(): Flashcard[] {
    return this.flashcards.filter(
      card => card.subject === this.selectedSubject
    );
  }

  get currentCard(): Flashcard | undefined {
    return this.filteredFlashcards[this.currentIndex];
  }

  loadFlashcards(): void {
    this.loading = true;
    this.errorMessage = '';

    this.flashcardsService.getFlashcards().subscribe({
      next: cards => {
        this.flashcards = cards;
        this.currentIndex = 0;
        this.isFlipped = false;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: error => {
        console.error('Error loading flashcards:', error);
        this.errorMessage =
          'Could not load flashcards. Check that your backend is running.';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  changeSubject(subject: string): void {
    this.selectedSubject = subject;
    this.currentIndex = 0;
    this.isFlipped = false;
    this.clearMessages();
  }

  flipCard(): void {
    this.isFlipped = !this.isFlipped;
  }

  previousCard(): void {
    if (this.currentIndex > 0) {
      this.currentIndex--;
      this.isFlipped = false;
    }
  }

  nextCard(): void {
    if (this.currentIndex < this.filteredFlashcards.length - 1) {
      this.currentIndex++;
      this.isFlipped = false;
    }
  }

  saveFlashcard(): void {
    this.clearMessages();

    const trimmedQuestion = this.question.trim();
    const trimmedAnswer = this.answer.trim();

    if (!trimmedQuestion || !trimmedAnswer) {
      this.errorMessage = 'Please enter both a question and an answer.';
      return;
    }

    const flashcard: Flashcard = {
      question: trimmedQuestion,
      answer: trimmedAnswer,
      subject: this.formSubject
    };

    this.saving = true;

    const request = this.editingId
      ? this.flashcardsService.updateFlashcard(
          this.editingId,
          flashcard
        )
      : this.flashcardsService.createFlashcard(flashcard);

    request.subscribe({
      next: savedCard => {
        if (this.editingId) {
          const index = this.flashcards.findIndex(
            card => card._id === this.editingId
          );

          if (index !== -1) {
            this.flashcards[index] = savedCard;
          }

          this.successMessage = 'Flashcard updated successfully.';
        } else {
          this.flashcards.unshift(savedCard);
          this.successMessage = 'Flashcard saved successfully.';
        }

        this.selectedSubject = savedCard.subject;
        this.formSubject = savedCard.subject;
        this.currentIndex = this.filteredFlashcards.findIndex(
          card => card._id === savedCard._id
        );

        if (this.currentIndex < 0) {
          this.currentIndex = 0;
        }

        this.isFlipped = false;
        this.question = '';
        this.answer = '';
        this.editingId = null;
        this.saving = false;
        this.cdr.detectChanges();
      },
      error: error => {
        console.error('Error saving flashcard:', error);
        this.errorMessage =
          error.error?.message || 'Could not save the flashcard.';
        this.saving = false;
        this.cdr.detectChanges();
      }
    });
  }

  editFlashcard(card: Flashcard): void {
    if (!card._id) {
      return;
    }

    this.editingId = card._id;
    this.question = card.question;
    this.answer = card.answer;
    this.formSubject = card.subject;
    this.clearMessages();
  }

  cancelEdit(): void {
    this.editingId = null;
    this.question = '';
    this.answer = '';
    this.formSubject = this.selectedSubject;
    this.clearMessages();
  }

  deleteFlashcard(card: Flashcard): void {
    if (!card._id) {
      return;
    }

    const confirmed = confirm(
      'Are you sure you want to delete this flashcard?'
    );

    if (!confirmed) {
      return;
    }

    this.flashcardsService.deleteFlashcard(card._id).subscribe({
      next: () => {
        this.flashcards = this.flashcards.filter(
          item => item._id !== card._id
        );

        this.currentIndex = Math.min(
          this.currentIndex,
          Math.max(0, this.filteredFlashcards.length - 1)
        );

        this.isFlipped = false;
        this.successMessage = 'Flashcard deleted successfully.';
        this.cdr.detectChanges();
      },
      error: error => {
        console.error('Error deleting flashcard:', error);
        this.errorMessage = 'Could not delete the flashcard.';
        this.cdr.detectChanges();
      }
    });
  }

  clearMessages(): void {
    this.errorMessage = '';
    this.successMessage = '';
  }
  get knownCount(): number {
  return this.filteredFlashcards.filter(
    card => card.status === 'known'
  ).length;
}

get progressPercentage(): number {
  const total = this.filteredFlashcards.length;

  if (total === 0) {
    return 0;
  }

  return Math.round((this.knownCount / total) * 100);
}
markStatus(status: 'needs-revision' | 'known'): void {
  const card = this.currentCard;

  if (!card?._id || this.updatingStatus) {
    return;
  }

  this.errorMessage = '';
  this.successMessage = '';
  this.updatingStatus = true;

  this.flashcardsService.updateStatus(card._id, status).subscribe({
    next: updatedCard => {
      const index = this.flashcards.findIndex(
        item => item._id === updatedCard._id
      );

      if (index !== -1) {
        this.flashcards[index] = updatedCard;
      }

      this.successMessage =
        status === 'known'
          ? 'Marked as known!'
          : 'Added back to your revision list.';

      this.updatingStatus = false;
      this.cdr.detectChanges();
    },
    error: error => {
      console.error('Error updating revision status:', error);
      this.errorMessage =
        error.error?.message || 'Could not save revision progress.';
      this.updatingStatus = false;
      this.cdr.detectChanges();
    }
  });
}
}
