
import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
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
  selector: 'app-mind-map',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './mind-map.html',
  styleUrl: './mind-map.css'
})
export class MindMap {
  subjectName = '';
  expandedTopics: string[] = [];

  newTopicTitle = '';
  newSubtopicTitle = '';
  selectedTopicTitle = '';

  message = '';

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
      this.route.snapshot.queryParamMap.get('subject') ||
      'Computer Networks';
  }

  get currentMindMap(): SubjectMindMap | undefined {
    return this.mindMapsBySubject[this.subjectName];
  }

  toggleTopic(topicTitle: string): void {
    if (this.expandedTopics.includes(topicTitle)) {
      this.expandedTopics = this.expandedTopics.filter(
        topic => topic !== topicTitle
      );
    } else {
      this.expandedTopics = [...this.expandedTopics, topicTitle];
    }
  }

  expandAll(): void {
    this.expandedTopics =
      this.currentMindMap?.topics.map(topic => topic.title) || [];
  }

  collapseAll(): void {
    this.expandedTopics = [];
  }

  addTopic(): void {
    const title = this.newTopicTitle.trim();
    const mindMap = this.currentMindMap;

    if (!mindMap || !title) {
      this.message = 'Please enter a topic name.';
      return;
    }

    const exists = mindMap.topics.some(
      topic => topic.title.toLowerCase() === title.toLowerCase()
    );

    if (exists) {
      this.message = 'This topic already exists.';
      return;
    }

    mindMap.topics.push({
      title,
      subtopics: []
    });

    this.newTopicTitle = '';
    this.message = 'Topic added successfully.';
  }

  selectTopic(topicTitle: string): void {
    this.selectedTopicTitle = topicTitle;
    this.message = '';
  }

  addSubtopic(): void {
    const title = this.newSubtopicTitle.trim();
    const mindMap = this.currentMindMap;

    if (!mindMap || !title || !this.selectedTopicTitle) {
      this.message = 'Enter a subtopic and select its parent topic.';
      return;
    }

    const topic = mindMap.topics.find(
      item => item.title === this.selectedTopicTitle
    );

    if (!topic) {
      this.message = 'Please select a valid topic.';
      return;
    }

    const exists = topic.subtopics.some(
      item => item.toLowerCase() === title.toLowerCase()
    );

    if (exists) {
      this.message = 'This subtopic already exists in that topic.';
      return;
    }

    topic.subtopics.push(title);
    this.expandedTopics = [
      ...new Set([...this.expandedTopics, topic.title])
    ];

    this.newSubtopicTitle = '';
    this.message = 'Subtopic added successfully.';
  }

  deleteTopic(topicTitle: string): void {
    const mindMap = this.currentMindMap;

    if (!mindMap) {
      return;
    }

    mindMap.topics = mindMap.topics.filter(
      topic => topic.title !== topicTitle
    );

    this.expandedTopics = this.expandedTopics.filter(
      topic => topic !== topicTitle
    );

    if (this.selectedTopicTitle === topicTitle) {
      this.selectedTopicTitle = '';
    }

    this.message = 'Topic deleted.';
  }

  deleteSubtopic(topicTitle: string, subtopicTitle: string): void {
    const topic = this.currentMindMap?.topics.find(
      item => item.title === topicTitle
    );

    if (!topic) {
      return;
    }

    topic.subtopics = topic.subtopics.filter(
      item => item !== subtopicTitle
    );

    this.message = 'Subtopic deleted.';
  }
}
