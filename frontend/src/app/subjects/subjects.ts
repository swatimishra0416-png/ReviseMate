
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

interface Subject {
  _id: string;
  name: string;
  normalizedName: string;
}

@Component({
  selector: 'app-subjects',
  imports: [],
  templateUrl: './subjects.html',
  styleUrl: './subjects.css'
})
export class Subjects implements OnInit {
  subjects: Subject[] = [];
  isLoading = true;
  errorMessage = '';

  constructor(
    private router: Router,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    this.loadSubjects();
  }

  loadSubjects(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.http.get<Subject[]>('http://localhost:3000/api/subjects')
      .subscribe({
        next: (data) => {
          this.subjects = data;
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error loading subjects:', error);
          this.errorMessage = 'Could not load subjects. Please try again.';
          this.isLoading = false;
        }
      });
  }

  startRevision(subject: Subject): void {
    this.router.navigate(['/revision', subject.name]);
  }
}
