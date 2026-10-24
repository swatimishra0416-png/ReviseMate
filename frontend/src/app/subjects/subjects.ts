
import {
  Component,
  OnInit,
  ChangeDetectorRef
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

interface Subject {
  _id: string;
  name: string;
  normalizedName: string;
}

@Component({
  selector: 'app-subjects',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './subjects.html',
  styleUrl: './subjects.css'
})
export class Subjects implements OnInit {
  private readonly apiUrl = 'http://localhost:3000/api/subjects';

  subjects: Subject[] = [];
  isLoading = true;
  isSaving = false;

  errorMessage = '';
  successMessage = '';

  newSubjectName = '';
  editingSubjectId: string | null = null;
  editSubjectName = '';

  constructor(
    private router: Router,
    private http: HttpClient,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadSubjects();
  }

  loadSubjects(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.http.get<Subject[]>(this.apiUrl).subscribe({
      next: (data) => {
        this.subjects = data;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error loading subjects:', error);
        this.errorMessage = 'Could not load subjects. Please try again.';
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  addSubject(): void {
    const name = this.newSubjectName.trim();
    this.errorMessage = '';
    this.successMessage = '';

    if (!name) {
      this.errorMessage = 'Please enter a subject name.';
      return;
    }

    if (name.length > 100) {
      this.errorMessage = 'Subject name cannot exceed 100 characters.';
      return;
    }

    this.isSaving = true;

    this.http.post<Subject>(this.apiUrl, { name }).subscribe({
      next: (createdSubject) => {
        this.subjects = [...this.subjects, createdSubject];
        this.newSubjectName = '';
        this.isSaving = false;
        this.successMessage = `"${createdSubject.name}" added successfully.`;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error adding subject:', error);
        this.errorMessage =
          error.error?.message || 'Could not add the subject. Please try again.';
        this.isSaving = false;
        this.cdr.detectChanges();
      }
    });
  }

  startRename(subject: Subject): void {
    this.editingSubjectId = subject._id;
    this.editSubjectName = subject.name;
    this.errorMessage = '';
    this.successMessage = '';
  }

  cancelRename(): void {
    this.editingSubjectId = null;
    this.editSubjectName = '';
    this.errorMessage = '';
  }

  renameSubject(subject: Subject): void {
    const name = this.editSubjectName.trim();
    this.errorMessage = '';
    this.successMessage = '';

    if (!name) {
      this.errorMessage = 'Please enter a subject name.';
      return;
    }

    if (name.length > 100) {
      this.errorMessage = 'Subject name cannot exceed 100 characters.';
      return;
    }

    if (name === subject.name) {
      this.cancelRename();
      return;
    }

    this.isSaving = true;

    this.http.put<Subject>(
      `${this.apiUrl}/${subject._id}`,
      { name }
    ).subscribe({
      next: (updatedSubject) => {
        this.subjects = this.subjects.map((item) =>
          item._id === subject._id
            ? { ...item, ...updatedSubject }
            : item
        );

        this.editingSubjectId = null;
        this.editSubjectName = '';
        this.isSaving = false;
        this.successMessage = `Subject renamed to "${updatedSubject.name}".`;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error renaming subject:', error);
        this.errorMessage =
          error.error?.message || 'Could not rename the subject. Please try again.';
        this.isSaving = false;
        this.cdr.detectChanges();
      }
    });
  }

  deleteSubject(subject: Subject): void {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${subject.name}" from your subject list?\n\n` +
      'Related notes, flashcards, quizzes, and mind maps may remain in the database.'
    );

    if (!confirmed) {
      return;
    }

    this.errorMessage = '';
    this.successMessage = '';
    this.isSaving = true;

    this.http.delete(`${this.apiUrl}/${subject._id}`).subscribe({
      next: () => {
        this.subjects = this.subjects.filter(
          (item) => item._id !== subject._id
        );

        if (this.editingSubjectId === subject._id) {
          this.cancelRename();
        }

        this.isSaving = false;
        this.successMessage = `"${subject.name}" removed from your subject list.`;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error deleting subject:', error);
        this.errorMessage =
          error.error?.message || 'Could not delete the subject. Please try again.';
        this.isSaving = false;
        this.cdr.detectChanges();
      }
    });
  }

  startRevision(subject: Subject): void {
    this.router.navigate(['/revision', subject.name]);
  }
}
