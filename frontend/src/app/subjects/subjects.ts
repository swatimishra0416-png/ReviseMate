import { Component } from '@angular/core';
import { Router } from '@angular/router';

interface Subject {
  name: string;
  progress: number;
}

@Component({
  selector: 'app-subjects',
  imports: [],
  templateUrl: './subjects.html',
  styleUrl: './subjects.css'
})
export class Subjects {
  constructor(private router: Router) {}

  subjects: Subject[] = [
    {
      name: 'Computer Networks',
      progress: 65
    },
    {
      name: 'DBMS',
      progress: 45
    },
    {
      name: 'Operating Systems',
      progress: 30
    },
    {
      name: 'Data Structures',
      progress: 70
    }
  ];

  startRevision(subject: Subject) {
    console.log('Starting revision for:', subject.name);
    this.router.navigate(['/revision', subject.name]);
  }
}