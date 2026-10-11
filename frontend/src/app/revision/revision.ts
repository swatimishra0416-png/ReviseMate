
import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';


interface Flashcard {
  question: string;
  answer: string;
}

@Component({
  selector: 'app-revision',
  imports: [],
  templateUrl: './revision.html',
  styleUrl: './revision.css'
})
export class Revision {
  subjectName = '';
  selectedOption = '';
  showRevisionContent = false;

  completedTopics: string[] = [];

  currentFlashcardIndex = 0;
  showFlashcardAnswer = false;

  revisionContent: { [key: string]: string[] } = {
    'Computer Networks': [
      'TCP is a connection-oriented transport protocol.',
      'UDP is a connectionless transport protocol.',
      'DNS translates domain names into IP addresses.'
    ],

    'DBMS': [
      'A primary key uniquely identifies each record.',
      'Normalization reduces data redundancy.',
      'ACID stands for Atomicity, Consistency, Isolation, and Durability.'
    ],

    'Operating Systems': [
      'A process is a program in execution.',
      'Deadlock occurs when processes wait indefinitely for resources.',
      'Virtual memory extends the available memory using secondary storage.'
    ],

    'Data Structures': [
      'A stack follows Last In, First Out (LIFO).',
      'A queue follows First In, First Out (FIFO).',
      'A linked list consists of nodes connected using links.'
    ]
  };

  flashcardsBySubject: { [subject: string]: Flashcard[] } = {
    'Computer Networks': [
      {
        question: 'What is TCP?',
        answer: 'TCP is a connection-oriented transport layer protocol that provides reliable data delivery.'
      },
      {
        question: 'What is UDP?',
        answer: 'UDP is a connectionless transport layer protocol with low overhead.'
      },
      {
        question: 'What is DNS?',
        answer: 'DNS translates domain names into IP addresses.'
      }
    ],

    'DBMS': [
      {
        question: 'What is a primary key?',
        answer: 'A primary key uniquely identifies each record in a table.'
      },
      {
        question: 'What is normalization?',
        answer: 'Normalization organizes database tables to reduce redundancy and improve data integrity.'
      },
      {
        question: 'What does ACID stand for?',
        answer: 'Atomicity, Consistency, Isolation, and Durability.'
      }
    ],

    'Operating Systems': [
      {
        question: 'What is a process?',
        answer: 'A process is a program in execution.'
      },
      {
        question: 'What is deadlock?',
        answer: 'Deadlock occurs when processes wait indefinitely for resources held by one another.'
      },
      {
        question: 'What is virtual memory?',
        answer: 'Virtual memory allows a system to use secondary storage as an extension of RAM.'
      }
    ],

    'Data Structures': [
      {
        question: 'What is a stack?',
        answer: 'A stack is a linear data structure that follows Last In, First Out (LIFO).'
      },
      {
        question: 'What is a queue?',
        answer: 'A queue is a linear data structure that follows First In, First Out (FIFO).'
      },
      {
        question: 'What is a linked list?',
        answer: 'A linked list is a collection of nodes where each node stores data and a link to another node.'
      }
    ]
  };

  constructor(
  private route: ActivatedRoute,
  private router: Router
) {
  this.subjectName =
    this.route.snapshot.paramMap.get('subject') || '';
}

  selectOption(option: string) {
    this.selectedOption = option;
    this.showRevisionContent = false;
    console.log('Selected revision option:', option);
  }

  
startQuickRevision() {
  if (!this.selectedOption) {
    return;
  }

  if (this.selectedOption === 'Quiz') {
    this.router.navigate(['/quiz', this.subjectName]);
    return;
  }

  this.showRevisionContent = true;

  if (this.selectedOption === 'Flashcards') {
    this.currentFlashcardIndex = 0;
    this.showFlashcardAnswer = false;
  }

  console.log(
    'Starting',
    this.selectedOption,
    'for:',
    this.subjectName
  );
}


  get currentFlashcards(): Flashcard[] {
    return this.flashcardsBySubject[this.subjectName] || [];
  }

  get currentFlashcard(): Flashcard | undefined {
    return this.currentFlashcards[this.currentFlashcardIndex];
  }

  flipFlashcard() {
    if (this.currentFlashcard) {
      this.showFlashcardAnswer = !this.showFlashcardAnswer;
    }
  }

  nextFlashcard() {
    if (this.currentFlashcardIndex < this.currentFlashcards.length - 1) {
      this.currentFlashcardIndex++;
      this.showFlashcardAnswer = false;
    }
  }

  previousFlashcard() {
    if (this.currentFlashcardIndex > 0) {
      this.currentFlashcardIndex--;
      this.showFlashcardAnswer = false;
    }
  }

  get progressPercentage(): number {
    const points = this.revisionContent[this.subjectName];

    if (!points || points.length === 0) {
      return 0;
    }

    return Math.round(
      (this.completedTopics.length / points.length) * 100
    );
  }

  toggleTopic(point: string) {
    if (this.completedTopics.includes(point)) {
      this.completedTopics = this.completedTopics.filter(
        topic => topic !== point
      );
    } else {
      this.completedTopics = [...this.completedTopics, point];
    }
  }

  resetProgress() {
    this.completedTopics = [];
  }
}
