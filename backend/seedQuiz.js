
const dns = require('node:dns');
dns.setServers(['8.8.8.8']);

require('dotenv').config();

const mongoose = require('mongoose');
const QuizQuestion = require('./models/QuizQuestion');

const questions = [
  {
    subject: 'Computer Networks',
    question: 'Which protocol provides reliable data delivery?',
    options: ['TCP', 'UDP', 'IP', 'ARP'],
    correctAnswer: 'TCP',
    explanation: 'TCP provides reliable, ordered delivery using acknowledgements and retransmissions.'
  },
  {
    subject: 'Computer Networks',
    question: 'What is the primary purpose of DNS?',
    options: [
      'Encrypt network traffic',
      'Translate domain names into IP addresses',
      'Assign MAC addresses',
      'Transfer files'
    ],
    correctAnswer: 'Translate domain names into IP addresses',
    explanation: 'DNS resolves human-readable domain names to IP addresses.'
  },
  {
    subject: 'Computer Networks',
    question: 'Which protocol is connectionless?',
    options: ['TCP', 'FTP', 'UDP', 'SSH'],
    correctAnswer: 'UDP',
    explanation: 'UDP sends datagrams without establishing a connection first.'
  },
  {
    subject: 'DBMS',
    question: 'What is the purpose of a primary key?',
    options: [
      'To uniquely identify each row',
      'To store duplicate rows',
      'To encrypt a table',
      'To sort every column automatically'
    ],
    correctAnswer: 'To uniquely identify each row',
    explanation: 'A primary key uniquely identifies each record and cannot contain NULL values.'
  },
  {
    subject: 'DBMS',
    question: 'Why is normalization used in a database?',
    options: [
      'To increase data duplication',
      'To reduce redundancy and update anomalies',
      'To delete all relationships',
      'To replace SQL'
    ],
    correctAnswer: 'To reduce redundancy and update anomalies',
    explanation: 'Normalization organizes data to reduce redundancy and prevent modification anomalies.'
  },
  {
    subject: 'DBMS',
    question: 'What does ACID stand for in database transactions?',
    options: [
      'Atomicity, Consistency, Isolation, Durability',
      'Accuracy, Control, Integrity, Data',
      'Access, Consistency, Indexing, Durability',
      'Atomicity, Connectivity, Isolation, Dependency'
    ],
    correctAnswer: 'Atomicity, Consistency, Isolation, Durability',
    explanation: 'ACID properties help ensure reliable transaction processing.'
  },
  {
    subject: 'Operating Systems',
    question: 'What is a process?',
    options: [
      'A program in execution',
      'A type of database',
      'A network cable',
      'A programming language'
    ],
    correctAnswer: 'A program in execution',
    explanation: 'A process is an executing instance of a program with its own execution state and resources.'
  },
  {
    subject: 'Operating Systems',
    question: 'Which condition can lead to deadlock?',
    options: [
      'Circular wait',
      'Code compilation',
      'DNS resolution',
      'File compression'
    ],
    correctAnswer: 'Circular wait',
    explanation: 'Circular wait is one of the four necessary conditions for deadlock.'
  },
  {
    subject: 'Operating Systems',
    question: 'What is the main purpose of CPU scheduling?',
    options: [
      'Choose which ready process runs next',
      'Create database tables',
      'Resolve domain names',
      'Encrypt files'
    ],
    correctAnswer: 'Choose which ready process runs next',
    explanation: 'CPU scheduling selects a process from the ready queue for execution.'
  },
  {
    subject: 'Data Structures',
    question: 'Which data structure follows LIFO?',
    options: ['Queue', 'Stack', 'Linked list', 'Graph'],
    correctAnswer: 'Stack',
    explanation: 'A stack follows Last In, First Out: the most recently inserted item is removed first.'
  },
  {
    subject: 'Data Structures',
    question: 'Which data structure follows FIFO?',
    options: ['Stack', 'Tree', 'Queue', 'Heap'],
    correctAnswer: 'Queue',
    explanation: 'A queue follows First In, First Out: the earliest inserted item is removed first.'
  },
  {
    subject: 'Data Structures',
    question: 'What is the time complexity of accessing an array element by index?',
    options: ['O(1)', 'O(n)', 'O(log n)', 'O(n²)'],
    correctAnswer: 'O(1)',
    explanation: 'Direct array indexing takes constant time, O(1), under the usual random-access array model.'
  }
];

async function seedQuiz() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB.');

    // Prevent duplicate insertion when this seed file is run again.
    const existingCount = await QuizQuestion.countDocuments();

    if (existingCount > 0) {
      console.log(
        `The database already contains ${existingCount} quiz questions. No questions were added.`
      );
      return;
    }

    await QuizQuestion.insertMany(questions);
    console.log(`Successfully inserted ${questions.length} quiz questions.`);
  } catch (error) {
    console.error('Could not seed quiz questions:', error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
}

seedQuiz();
