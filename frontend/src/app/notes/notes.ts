
import {
  Component,
  OnInit,
  ChangeDetectorRef
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { NotesService, StudyMaterial } from '../services/notes.service';

interface Subject {
  _id: string;
  name: string;
  normalizedName: string;
}

@Component({
  selector: 'app-notes',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './notes.html',
  styleUrl: './notes.css'
})
export class Notes implements OnInit {
  materialTitle = '';
  selectedFileName = '';
  selectedSubject = 'Computer Networks';
  studyMaterial = '';

  subjects: string[] = [];
  savedMaterials: StudyMaterial[] = [];

  message = '';
  editingId: string | null = null;

  isLoading = false;
  isLoadingSubjects = true;

  // Search and filter
  searchText = '';
  filterSubject = '';

  constructor(
    private notesService: NotesService,
    private cdr: ChangeDetectorRef,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    this.loadSubjects();
    this.loadMaterials();
  }

  // Fetch subjects from the backend
  loadSubjects(): void {
    this.isLoadingSubjects = true;

    this.http.get<Subject[]>('http://localhost:3000/api/subjects')
      .subscribe({
        next: (data) => {
          this.subjects = data.map(subject => subject.name);

          if (!this.subjects.includes(this.selectedSubject)) {
            this.selectedSubject = this.subjects[0] || '';
          }

          this.isLoadingSubjects = false;
          this.cdr.detectChanges();
        },
        error: (error) => {
          console.error('Error loading subjects:', error);
          this.message = 'Could not load subjects. Check that the backend is running.';
          this.isLoadingSubjects = false;
          this.cdr.detectChanges();
        }
      });
  }

  // Fetch saved notes from the backend
  loadMaterials(): void {
    this.isLoading = true;
    this.cdr.markForCheck();

    this.notesService.getNotes().subscribe({
      next: (materials) => {
        this.savedMaterials = materials;
        this.isLoading = false;
        console.log('Notes received from API:', materials.length);
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error loading notes:', error);
        this.message = 'Could not load notes. Check that the backend is running.';
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  // Search by title or content and filter by subject
  get filteredMaterials(): StudyMaterial[] {
    const query = this.searchText.trim().toLowerCase();

    return this.savedMaterials.filter((material) => {
      const title = (material.title || '').toLowerCase();
      const content = (material.content || '').toLowerCase();

      const matchesSearch =
        !query ||
        title.includes(query) ||
        content.includes(query);

      const matchesSubject =
        !this.filterSubject ||
        material.subject === this.filterSubject;

      return matchesSearch && matchesSubject;
    });
  }

  clearFilters(): void {
    this.searchText = '';
    this.filterSubject = '';
  }

  // Create a new note or update an existing one
  saveMaterial(): void {
    if (!this.materialTitle.trim() || !this.studyMaterial.trim()) {
      this.message = 'Please enter a title and study material.';
      return;
    }

    if (this.isLoadingSubjects || this.subjects.length === 0) {
      this.message = 'Please wait for subjects to load, or add a subject first.';
      return;
    }

    const material: StudyMaterial = {
      title: this.materialTitle.trim(),
      subject: this.selectedSubject,
      content: this.studyMaterial.trim()
    };

    if (this.editingId !== null) {
      this.notesService.updateNote(this.editingId, material).subscribe({
        next: (updatedMaterial) => {
          const index = this.savedMaterials.findIndex(
            item => item._id === updatedMaterial._id
          );

          if (index !== -1) {
            this.savedMaterials[index] = updatedMaterial;
          }

          this.message = 'Study material updated successfully!';
          this.resetForm();
          this.loadMaterials();
        },
        error: (error) => {
          console.error('Error updating note:', error);
          this.message = error.error?.message || 'Could not update study material.';
          this.cdr.detectChanges();
        }
      });
    } else {
      this.notesService.createNote(material).subscribe({
        next: () => {
          this.message = 'Study material saved successfully!';
          this.resetForm();
          this.loadMaterials();
        },
        error: (error) => {
          console.error('Error saving note:', error);
          this.message = error.error?.message || 'Could not save study material.';
          this.cdr.detectChanges();
        }
      });
    }
  }

  // Load an existing note into the form
  editMaterial(material: StudyMaterial): void {
    if (!material._id) {
      this.message = 'Could not identify this note.';
      return;
    }

    this.materialTitle = material.title;
    this.selectedSubject = material.subject;
    this.studyMaterial = material.content;
    this.editingId = material._id;
    this.selectedFileName = '';

    this.message = 'Editing your study material.';
  }

  // Delete a note
  deleteMaterial(material: StudyMaterial): void {
    if (!material._id) {
      this.message = 'Could not identify this note.';
      return;
    }

    if (!window.confirm(`Delete "${material.title}"? This cannot be undone.`)) {
      return;
    }

    this.notesService.deleteNote(material._id).subscribe({
      next: () => {
        this.savedMaterials = this.savedMaterials.filter(
          item => item._id !== material._id
        );

        if (this.editingId === material._id) {
          this.resetForm();
        }

        this.message = 'Study material deleted successfully!';
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error deleting note:', error);
        this.message = error.error?.message || 'Could not delete study material.';
        this.cdr.detectChanges();
      }
    });
  }

  cancelEdit(): void {
    this.resetForm();
    this.message = 'Editing cancelled.';
  }

  private resetForm(): void {
    this.materialTitle = '';
    this.studyMaterial = '';
    this.selectedFileName = '';
    this.editingId = null;
  }

  // Read a .txt file into the study material form
  async onFileSelected(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (!file) {
      return;
    }

    if (!file.name.toLowerCase().endsWith('.txt')) {
      this.message = 'Please select a .txt file.';
      input.value = '';
      return;
    }

    try {
      this.studyMaterial = await file.text();
      this.materialTitle = file.name.replace(/\.txt$/i, '');
      this.selectedFileName = file.name;
      this.message = 'File loaded successfully! You can now save your study material.';
      input.value = '';
    } catch (error) {
      console.error('Error reading file:', error);
      this.message = 'Could not read the file. Please try again.';
    }
  }
}
