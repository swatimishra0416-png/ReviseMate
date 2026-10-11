
import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

interface MindMapTopic {
  title: string;
  subtopics: string[];
}

interface SubjectMindMap {
  centralTopic: string;
  topics: MindMapTopic[];
}

@Component({
  imports: [],
  selector: 'app-mind-map',
  styleUrl: './mind-map.css',
  templateUrl: './mind-map.html',
})
export class MindMap {
  subjectName = '';

  mindMapsBySubject: { [subject: string]: SubjectMindMap } = {
    'Computer Networks': {
      centralTopic: 'Computer Networks',
      topics: [
        {
          title: 'Transport Layer',
          subtopics: ['TCP', 'UDP', 'Ports']
        },
        {
          title: 'Application Layer',
          subtopics: ['HTTP', 'DNS', 'FTP']
        },
        {
          title: 'Network Layer',
          subtopics: ['IP Addressing', 'Routing', 'Packets']
        },
        {
          title: 'Data Link Layer',
          subtopics: ['MAC Address', 'Ethernet', 'Framing']
        }
      ]
    },

    'DBMS': {
      centralTopic: 'Database Management System',
      topics: [
        {
          title: 'Keys',
          subtopics: ['Primary Key', 'Foreign Key', 'Candidate Key']
        },
        {
          title: 'Normalization',
          subtopics: ['1NF', '2NF', '3NF']
        },
        {
          title: 'SQL',
          subtopics: ['SELECT', 'INSERT', 'UPDATE']
        },
        {
          title: 'Transactions',
          subtopics: ['Atomicity', 'Consistency', 'Isolation', 'Durability']
        }
      ]
    },

    'Operating Systems': {
      centralTopic: 'Operating Systems',
      topics: [
        {
          title: 'Processes',
          subtopics: ['Process States', 'PCB', 'Context Switching']
        },
        {
          title: 'Scheduling',
          subtopics: ['FCFS', 'SJF', 'Round Robin']
        },
        {
          title: 'Memory Management',
          subtopics: ['Paging', 'Segmentation', 'Virtual Memory']
        },
        {
          title: 'Deadlocks',
          subtopics: ['Mutual Exclusion', 'Hold and Wait', 'Circular Wait']
        }
      ]
    },

    'Data Structures': {
      centralTopic: 'Data Structures',
      topics: [
        {
          title: 'Linear Structures',
          subtopics: ['Arrays', 'Linked Lists', 'Stacks', 'Queues']
        },
        {
          title: 'Non-linear Structures',
          subtopics: ['Trees', 'Graphs']
        },
        {
          title: 'Searching',
          subtopics: ['Linear Search', 'Binary Search']
        },
        {
          title: 'Sorting',
          subtopics: ['Bubble Sort', 'Merge Sort', 'Quick Sort']
        }
      ]
    }
  };

  constructor(private route: ActivatedRoute) {
    this.subjectName =
      this.route.snapshot.paramMap.get('subject') || 'Computer Networks';
  }

  get currentMindMap(): SubjectMindMap | undefined {
    return this.mindMapsBySubject[this.subjectName];
  }
}
