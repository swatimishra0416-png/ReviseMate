
import { CommonModule } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  OnInit
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';

import {
  MindMapService,
  SubjectMindMap
} from '../services/mind-map.service';

interface Subject {
  _id: string;
  name: string;
  normalizedName: string;
}

@Component({
  selector: 'app-mind-map',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './mind-map.html',
  styleUrl: './mind-map.css'
})
export class MindMap implements OnInit {
  subjectName = '';
  subjects: string[] = [];

  isLoadingSubjects = true;
  private subjectsLoaded = false;

  expandedTopics: string[] = [];

  newTopicTitle = '';
  newSubtopicTitle = '';
  selectedTopicTitle = '';

  message = '';
  isLoading = true;
  isSaving = false;

  // Preserve the existing sample maps for the original subjects.
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
    private cdr: ChangeDetectorRef,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    // Load available subjects first.
    this.loadSubjects();

    // Respond to subject changes in the URL.
    this.route.queryParamMap.subscribe(params => {
      if (!this.subjectsLoaded) {
        return;
      }

      const requestedSubject = params.get('subject');

      if (
        requestedSubject &&
        this.subjects.includes(requestedSubject) &&
        requestedSubject !== this.subjectName
      ) {
        this.subjectName = requestedSubject;
        this.resetTopicSelection();
        this.loadMindMap();
      }
    });
  }

  loadSubjects(): void {
    this.isLoadingSubjects = true;
    this.message = '';

    this.http.get<Subject[]>('http://localhost:3000/api/subjects')
      .subscribe({
        next: data => {
          this.subjects = data.map(subject => subject.name);
          this.subjectsLoaded = true;
          this.isLoadingSubjects = false;

          const requestedSubject =
            this.route.snapshot.queryParamMap.get('subject');

          // Use the URL subject if valid; otherwise use the first subject.
          const initialSubject =
            requestedSubject && this.subjects.includes(requestedSubject)
              ? requestedSubject
              : this.subjects[0] || '';

          if (initialSubject) {
            this.subjectName = initialSubject;

            // Keep the URL in sync with the selected subject.
            if (requestedSubject !== initialSubject) {
              this.router.navigate([], {
                relativeTo: this.route,
                queryParams: { subject: initialSubject },
                queryParamsHandling: 'merge'
              });
            }

            this.loadMindMap();
          } else {
            this.subjectName = '';
            this.isLoading = false;
            this.message = 'No subjects available. Add a subject first.';
          }

          this.cdr.detectChanges();
        },
        error: error => {
          console.error('Error loading subjects:', error);
          this.isLoadingSubjects = false;
          this.isLoading = false;
          this.message =
            'Could not load subjects. Check that your backend is running.';
          this.cdr.detectChanges();
        }
      });
  }

  private resetTopicSelection(): void {
    this.expandedTopics = [];
    this.selectedTopicTitle = '';
    this.newTopicTitle = '';
    this.newSubtopicTitle = '';
  }

  changeSubject(subject: string): void {
    if (!this.subjects.includes(subject) || subject === this.subjectName) {
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

  // Load the saved map, or initialize a map for this subject.
  loadMindMap(): void {
    if (!this.subjectName) {
      this.isLoading = false;
      return;
    }

    this.isLoading = true;
    this.message = '';

    this.mindMapService.getAllMindMaps().subscribe({
      next: savedMaps => {
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
          return;
        }

        // Preserve original sample maps. New subjects start with an empty map.
        if (!this.mindMapsBySubject[this.subjectName]) {
          this.mindMapsBySubject[this.subjectName] = {
            subject: this.subjectName,
            centralTopic: this.subjectName,
            topics: []
          };
        }

        this.saveCurrentMindMap(true);
      },
      error: error => {
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
      next: savedMap => {
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
          this.message = 'Mind map saved to database.';
          this.isLoading = false;
        } else {
          this.message = 'Changes saved to database.';
        }

        this.cdr.detectChanges();
      },
      error: error => {
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
      this.message = 'Enter a subtopic and select its parent topic.';
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
