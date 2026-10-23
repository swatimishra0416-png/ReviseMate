
import { CommonModule } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  OnInit
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import {
  MindMapService,
  SubjectMindMap
} from '../services/mind-map.service';

@Component({
  selector: 'app-mind-map',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './mind-map.html',
  styleUrl: './mind-map.css'
})
export class MindMap implements OnInit {
  subjectName = '';

subjects = [
  'Computer Networks',
  'DBMS',
  'Operating Systems',
  'Data Structures'
];

  expandedTopics: string[] = [];

  newTopicTitle = '';
  newSubtopicTitle = '';
  selectedTopicTitle = '';

  message = '';
  isLoading = true;
  isSaving = false;

  // Existing sample maps are preserved as initial data.
  mindMapsBySubject: { [subject: string]: SubjectMindMap } = {
    'Computer Networks': {
      subject: 'Computer Networks',
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
      subject: 'DBMS',
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
          subtopics: [
            'Atomicity',
            'Consistency',
            'Isolation',
            'Durability'
          ]
        }
      ]
    },

    'Operating Systems': {
      subject: 'Operating Systems',
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
          subtopics: [
            'Mutual Exclusion',
            'Hold and Wait',
            'Circular Wait'
          ]
        }
      ]
    },

    'Data Structures': {
      subject: 'Data Structures',
      centralTopic: 'Data Structures and Algorithms',
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

  constructor(
  private route: ActivatedRoute,
  private router: Router,
  private mindMapService: MindMapService,
  private cdr: ChangeDetectorRef
) {}

ngOnInit(): void {
  this.route.queryParamMap.subscribe(params => {
    const subject =
      params.get('subject') || 'Computer Networks';

    if (!this.subjects.includes(subject)) {
      this.message = 'Please select a valid subject.';
      this.isLoading = false;
      this.cdr.detectChanges();
      return;
    }
    if (this.subjectName !== subject) {
      this.subjectName = subject;
      this.expandedTopics = [];
      this.selectedTopicTitle = '';
      this.loadMindMap();
    }
  });
}

changeSubject(subject: string): void {
  if (!this.subjects.includes(subject)) {
    return;
  }

  this.router.navigate([], {
    relativeTo: this.route,
    queryParams: { subject },
    queryParamsHandling: 'merge'
  });
}

  get currentMindMap(): SubjectMindMap | undefined {
    return this.mindMapsBySubject[this.subjectName];
  }

  // Load the saved map, or save the existing sample map on first visit.
  loadMindMap(): void {
    this.isLoading = true;
    this.message = '';

    this.mindMapService.getAllMindMaps().subscribe({
      next: (savedMaps) => {
        const savedMap = savedMaps.find(
          map => map.subject === this.subjectName
        );

        if (savedMap) {
          this.mindMapsBySubject[this.subjectName] = {
            subject: savedMap.subject,
            centralTopic: savedMap.centralTopic,
            topics: savedMap.topics.map(topic => ({
              title: topic.title,
              subtopics: [...topic.subtopics]
            }))
          };

          this.message = 'Mind map loaded from database.';
          this.finishLoading();
        } else {
          // Preserve and save the existing sample map.
          this.saveCurrentMindMap(true);
        }
      },

      error: (error) => {
        console.error('Error loading mind maps:', error);
        this.message =
          'Could not connect to the Mind Maps API. Check your backend.';
        this.finishLoading();
      }
    });
  }

  private finishLoading(): void {
    this.isLoading = false;
    this.cdr.detectChanges();
  }

  // Save the current subject's map to MongoDB.
  private saveCurrentMindMap(isInitialSave = false): void {
    const mindMap = this.currentMindMap;

    if (!mindMap) {
      this.isSaving = false;
      this.finishLoading();
      return;
    }

    this.isSaving = true;

    this.mindMapService.saveMindMap(
      this.subjectName,
      {
        centralTopic: mindMap.centralTopic,
        topics: mindMap.topics
      }
    ).subscribe({
      next: (savedMap) => {
        this.mindMapsBySubject[this.subjectName] = {
          subject: savedMap.subject,
          centralTopic: savedMap.centralTopic,
          topics: savedMap.topics.map(topic => ({
            title: topic.title,
            subtopics: [...topic.subtopics]
          }))
        };

        this.isSaving = false;

        if (isInitialSave) {
          this.message = 'Initial mind map saved to database.';
          this.isLoading = false;
        } else {
          this.message = 'Changes saved to database.';
        }

        this.cdr.detectChanges();
      },

      error: (error) => {
        console.error('Error saving mind map:', error);
        this.isSaving = false;
        this.message =
          'Could not save changes. Please check your backend connection.';

        if (isInitialSave) {
          this.isLoading = false;
        }

        this.cdr.detectChanges();
      }
    });
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

    if (title.length > 100) {
      this.message = 'Topic names cannot exceed 100 characters.';
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
    this.message = '';
    this.saveCurrentMindMap();
  }

  selectTopic(topicTitle: string): void {
    this.selectedTopicTitle = topicTitle;
    this.message = '';
  }

  addSubtopic(): void {
    const title = this.newSubtopicTitle.trim();
    const mindMap = this.currentMindMap;

    if (!mindMap || !title || !this.selectedTopicTitle) {
      this.message =
        'Enter a subtopic and select its parent topic.';
      return;
    }

    if (title.length > 150) {
      this.message = 'Subtopic names cannot exceed 150 characters.';
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
    this.message = '';
    this.saveCurrentMindMap();
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

    this.message = '';
    this.saveCurrentMindMap();
  }

  deleteSubtopic(
    topicTitle: string,
    subtopicTitle: string
  ): void {
    const topic = this.currentMindMap?.topics.find(
      item => item.title === topicTitle
    );

    if (!topic) {
      return;
    }

    topic.subtopics = topic.subtopics.filter(
      item => item !== subtopicTitle
    );

    this.message = '';
    this.saveCurrentMindMap();
  }
}
