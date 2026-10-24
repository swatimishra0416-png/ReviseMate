
import {
  Component,
  ChangeDetectorRef,
  OnInit
} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { QuizHistory } from '../quiz-history/quiz-history';

import {
  QuizService,
  QuizQuestion,
  QuizAnswer
} from '../services/quiz.service';

interface Subject {
  _id: string;
  name: string;
  normalizedName: string;
}

@Component({
  standalone: true,
  imports: [QuizHistory],
  selector: 'app-quiz',
  styleUrl: './quiz.css',
  templateUrl: './quiz.html',
})
export class Quiz implements OnInit {
  subjectName = '';
  showSubjectSelection = false;

  subjects: string[] = [];
  isLoadingSubjects = true;

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

  savingAttempt = false;
  attemptSaved = false;
  attemptSaveError = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private quizService: QuizService,
    private cdr: ChangeDetectorRef,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    this.loadSubjects();
  }

  // Load subjects dynamically from MongoDB.
  loadSubjects(): void {
    this.isLoadingSubjects = true;

    this.http.get<Subject[]>('http://localhost:3000/api/subjects')
      .subscribe({
        next: (data) => {
          this.subjects = data.map(subject => subject.name);
          this.isLoadingSubjects = false;

          const routeSubject =
            this.route.snapshot.paramMap.get('subject');

          if (routeSubject && this.subjects.includes(routeSubject)) {
            this.subjectName = routeSubject;
            this.showSubjectSelection = false;
            this.loadQuestions();
          } else {
            this.subjectName = '';
            this.showSubjectSelection = true;
            this.loading = false;

            if (routeSubject) {
              this.errorMessage =
                'That subject is not available. Please choose a subject below.';
            } else if (this.subjects.length === 0) {
              this.errorMessage =
                'No subjects available. Please add a subject first.';
            } else {
              this.errorMessage = '';
            }
          }

          this.cdr.detectChanges();
        },
        error: (error) => {
          console.error('Could not load subjects:', error);
          this.isLoadingSubjects = false;
          this.loading = false;
          this.showSubjectSelection = true;
          this.errorMessage =
            'Could not load subjects. Check that your backend is running.';
          this.cdr.detectChanges();
        }
      });
  }

  get currentQuestion(): QuizQuestion | undefined {
    return this.questions[this.currentQuestionIndex];
  }

  // Load questions for the selected subject.
  loadQuestions(): void {
    if (!this.subjectName) {
      return;
    }

    this.loading = true;
    this.errorMessage = '';
    this.answerError = '';

    this.quizService.getQuestions(this.subjectName).subscribe({
      next: (questions) => {
        this.questions = questions;
        this.currentQuestionIndex = 0;
        this.selectedAnswer = '';
        this.score = 0;
        this.quizFinished = false;
        this.answerSubmitted = false;
        this.currentAnswer = null;

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

  selectSubject(subject: string): void {
    if (!this.subjects.includes(subject)) {
      return;
    }

    this.errorMessage = '';

    this.router.navigate(['/quiz', subject]);
  }

  chooseAnotherSubject(): void {
    this.showSubjectSelection = true;
    this.subjectName = '';
    this.questions = [];
    this.currentQuestionIndex = 0;
    this.selectedAnswer = '';
    this.score = 0;
    this.quizFinished = false;
    this.answerSubmitted = false;
    this.currentAnswer = null;

    this.errorMessage = '';
    this.answerError = '';
    this.savingAttempt = false;
    this.attemptSaved = false;
    this.attemptSaveError = '';

    this.router.navigate(['/quiz']);
  }

  selectAnswer(option: string): void {
    if (this.answerSubmitted || this.loadingAnswer) {
      return;
    }

    this.selectedAnswer = option;
  }

  // Check the selected answer using the backend.
  submitAnswer(): void {
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

    this.quizService.getAnswer(this.currentQuestion._id).subscribe({
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

  // Move to the next question or finish the quiz.
  nextQuestion(): void {
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

  // Save the completed quiz attempt to MongoDB.
  saveQuizAttempt(): void {
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

  // Restart the current quiz.
  restartQuiz(): void {
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

    this.loadQuestions();
  }
}
