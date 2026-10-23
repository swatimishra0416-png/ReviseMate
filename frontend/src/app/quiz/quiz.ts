
import { Component, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { QuizHistory } from '../quiz-history/quiz-history';
import {
  QuizService,
  QuizQuestion,
  QuizAnswer
} from '../services/quiz.service';

@Component({
  imports: [QuizHistory],
  selector: 'app-quiz',
  styleUrl: './quiz.css',
  templateUrl: './quiz.html',
})
export class Quiz {
  subjectName = '';
  showSubjectSelection = false;

subjects = [
  'Computer Networks',
  'DBMS',
  'Operating Systems',
  'Data Structures'
];

  questions: QuizQuestion[] = [];

  currentQuestionIndex = 0;
  selectedAnswer = '';
  score = 0;

  quizFinished = false;
  answerSubmitted = false;

  loading = true;
  loadingAnswer = false;

  errorMessage = '';
  answerError = '';
  currentAnswer: QuizAnswer | null = null;

  // Quiz attempt saving status
  savingAttempt = false;
  attemptSaved = false;
  attemptSaveError = '';

  constructor(
  private route: ActivatedRoute,
  private router: Router,
  private quizService: QuizService,
  private cdr: ChangeDetectorRef
) {
  const subject = this.route.snapshot.paramMap.get('subject');

  if (subject) {
    this.subjectName = subject;
    this.showSubjectSelection = false;
    this.loadQuestions();
  } else {
    this.showSubjectSelection = true;
    this.loading = false;
  }
}

  get currentQuestion(): QuizQuestion | undefined {
    return this.questions[this.currentQuestionIndex];
  }

  // Load questions from MongoDB through the backend API
  loadQuestions() {
    this.loading = true;
    this.errorMessage = '';

    this.quizService.getQuestions(this.subjectName).subscribe({
      next: (questions) => {
        this.questions = questions;
        this.currentQuestionIndex = 0;
        this.loading = false;

        if (questions.length === 0) {
          this.errorMessage =
            'No quiz questions are available for this subject yet.';
        }

        this.cdr.detectChanges();
      },

      error: (error) => {
        console.error('Could not load quiz questions:', error);

        this.loading = false;
        this.errorMessage =
          'Could not load quiz questions. Please check that the backend is running and try again.';

        this.cdr.detectChanges();
      }
    });
  }
selectSubject(subject: string) {
  console.log('Selected subject:', subject);

  this.router.navigate(['/quiz', subject]).then((success) => {
    console.log('Navigation successful:', success);
    console.log('Current URL:', this.router.url);
  });
}
  // Select an answer
  selectAnswer(option: string) {
    if (this.answerSubmitted || this.loadingAnswer) {
      return;
    }

    this.selectedAnswer = option;
  }

  // Check the selected answer using the backend
  submitAnswer() {
    if (
      !this.selectedAnswer ||
      this.answerSubmitted ||
      this.loadingAnswer ||
      !this.currentQuestion
    ) {
      return;
    }

    this.loadingAnswer = true;
    this.answerError = '';

    this.quizService
      .getAnswer(this.currentQuestion._id)
      .subscribe({
        next: (answer) => {
          this.currentAnswer = answer;

          if (this.selectedAnswer === answer.correctAnswer) {
            this.score++;
          }

          this.answerSubmitted = true;
          this.loadingAnswer = false;

          this.cdr.detectChanges();
        },

        error: (error) => {
          console.error('Could not load the answer:', error);

          this.loadingAnswer = false;
          this.answerError =
            'Could not check your answer. Please try again.';

          this.cdr.detectChanges();
        }
      });
  }

  // Move to the next question or finish the quiz
  nextQuestion() {
    if (!this.answerSubmitted) {
      return;
    }

    if (this.currentQuestionIndex < this.questions.length - 1) {
      this.currentQuestionIndex++;
      this.selectedAnswer = '';
      this.answerSubmitted = false;
      this.currentAnswer = null;
      this.answerError = '';
    } else {
      this.quizFinished = true;
      this.saveQuizAttempt();
    }
  }

  // Save the completed quiz attempt to MongoDB
  saveQuizAttempt() {
    if (this.savingAttempt || this.attemptSaved) {
      return;
    }

    if (this.questions.length === 0) {
      return;
    }

    this.savingAttempt = true;
    this.attemptSaveError = '';

    this.quizService
      .saveAttempt(
        this.subjectName,
        this.score,
        this.questions.length
      )
      .subscribe({
        next: (response) => {
          console.log(response.message);

          this.savingAttempt = false;
          this.attemptSaved = true;

          this.cdr.detectChanges();
        },

        error: (error) => {
          console.error('Could not save quiz attempt:', error);

          this.savingAttempt = false;
          this.attemptSaveError =
            'Your score could not be saved. Please try again.';

          this.cdr.detectChanges();
        }
      });
  }

  // Restart the quiz
  restartQuiz() {
    this.currentQuestionIndex = 0;
    this.selectedAnswer = '';
    this.score = 0;
    this.quizFinished = false;
    this.answerSubmitted = false;
    this.currentAnswer = null;
    this.answerError = '';

    this.savingAttempt = false;
    this.attemptSaved = false;
    this.attemptSaveError = '';
  }
}
