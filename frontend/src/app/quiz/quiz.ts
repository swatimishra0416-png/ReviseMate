
import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
}

@Component({
  imports: [],
  selector: 'app-quiz',
  styleUrl: './quiz.css',
  templateUrl: './quiz.html',
})
export class Quiz {
  subjectName = '';

  questionsBySubject: { [subject: string]: QuizQuestion[] } = {
    'Computer Networks': [
      
{
  question: 'Which protocol provides reliable data delivery?',
  options: ['UDP', 'TCP', 'IP', 'DNS'],
  correctAnswer: 'TCP',
  explanation: 'TCP establishes a connection and provides reliable, ordered data delivery.'
}
,
      {
        question: 'Which protocol translates domain names into IP addresses?',
        options: ['HTTP', 'FTP', 'DNS', 'TCP'],
        correctAnswer: 'DNS',
        explanation: 'DNS translates human-readable domain names into IP addresses.'
      },
      {
        question: 'Which transport protocol is connectionless?',
        options: ['TCP', 'UDP', 'HTTPS', 'SMTP'],
        correctAnswer: 'UDP',
        explanation: 'UDP is connectionless and sends data without establishing a connection first.'
      }
    ],

    'DBMS': [
      {
        question: 'Which key uniquely identifies a row in a table?',
        options: ['Foreign key', 'Primary key', 'Candidate value', 'Duplicate key'],
        correctAnswer: 'Primary key',
        explanation: 'A primary key uniquely identifies each row in a database table.'
      },
      {
        question: 'What is the main purpose of normalization?',
        options: [
          'Increase duplication',
          'Reduce data redundancy',
          'Delete all relationships',
          'Encrypt the database'
        ],
        correctAnswer: 'Reduce data redundancy',
        explanation: 'Normalization reduces redundant data and helps maintain database consistency.'
      },
      {
        question: 'What does ACID stand for?',
        options: [
          'Atomicity, Consistency, Isolation, Durability',
          'Access, Control, Integration, Data',
          'Accuracy, Consistency, Indexing, Design',
          'Atomicity, Control, Isolation, Distribution'
        ],
        correctAnswer: 'Atomicity, Consistency, Isolation, Durability',
        explanation: 'ACID represents Atomicity, Consistency, Isolation, and Durability, the key properties of reliable database transactions.'
      }
    ],

    'Operating Systems': [
      {
        question: 'What is a process?',
        options: [
          'A program in execution',
          'A storage device',
          'A programming language',
          'A type of database'
        ],
        correctAnswer: 'A program in execution',
        explanation: 'A process is an instance of a program that is currently executing.'
      },
      {
        question: 'Which condition occurs when processes wait indefinitely for resources?',
        options: ['Compilation', 'Deadlock', 'Paging', 'Scheduling'],
        correctAnswer: 'Deadlock',
        explanation: 'Deadlock occurs when processes wait indefinitely for resources held by one another.'
      },
      {
        question: 'What does CPU scheduling decide?',
        options: [
          'Which process gets CPU time',
          'Which file gets deleted',
          'How a database is normalized',
          'Which IP address is assigned'
        ],
        correctAnswer: 'Which process gets CPU time',
        explanation: 'CPU scheduling selects which ready process gets CPU time next.'
      }
    ],

    'Data Structures': [
      {
        question: 'Which principle does a stack follow?',
        options: ['FIFO', 'LIFO', 'Random order', 'Sorted order'],
        correctAnswer: 'LIFO',
        explanation: 'LIFO means the last element inserted is the first element removed.'
      },
      {
        question: 'Which principle does a queue follow?',
        options: ['LIFO', 'FIFO', 'Binary search', 'Recursion'],
        correctAnswer: 'FIFO',
        explanation: 'FIFO means the first element inserted is the first element removed.'
      },
      {
        question: 'What is the time complexity of accessing an array element by index?',
        options: ['O(n)', 'O(log n)', 'O(1)', 'O(n²)'],
        correctAnswer: 'O(1)',
        explanation: 'Array elements can be accessed directly by index, giving constant-time O(1) access.'
      }
    ]
  };

  currentQuestionIndex = 0;
  selectedAnswer = '';
  score = 0;
  quizFinished = false;
  answerSubmitted = false;

  constructor(private route: ActivatedRoute) {
    this.subjectName =
      this.route.snapshot.paramMap.get('subject') || 'Computer Networks';
  }

  get questions(): QuizQuestion[] {
    return this.questionsBySubject[this.subjectName] || [];
  }

  selectAnswer(option: string) {
    this.selectedAnswer = option;
  }

  
submitAnswer() {
  if (!this.selectedAnswer || this.answerSubmitted) {
    return;
  }

  this.answerSubmitted = true;

  if (
    this.selectedAnswer ===
    this.questions[this.currentQuestionIndex].correctAnswer
  ) {
    this.score++;
  }
}

nextQuestion() {
  if (!this.answerSubmitted) {
    return;
  }

  if (this.currentQuestionIndex < this.questions.length - 1) {
    this.currentQuestionIndex++;
    this.selectedAnswer = '';
    this.answerSubmitted = false;
  } else {
    this.quizFinished = true;
  }
}


  restartQuiz() {
  this.currentQuestionIndex = 0;
  this.selectedAnswer = '';
  this.score = 0;
  this.quizFinished = false;
  this.answerSubmitted = false;
}
}
