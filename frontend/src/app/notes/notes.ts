import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NotesService, StudyMaterial } from '../services/notes.service';

@Component({
  selector: 'app-notes',
  imports: [FormsModule],
  templateUrl: './notes.html',
  styleUrl: './notes.css'
})
export class Notes implements OnInit {
  materialTitle = '';
  selectedFileName = '';
  selectedSubject = 'Computer Networks';
  studyMaterial = '';

  subjects = [
    'Computer Networks',
    'DBMS',
    'Operating Systems',
    'Data Structures'
  ];

  savedMaterials: StudyMaterial[] = [];

  message = '';
  editingId: string | null = null;
  isLoading = false;

  constructor(private notesService: NotesService) {}

  ngOnInit(): void {
    this.loadMaterials();
  }

  // Load saved notes from MongoDB through the backend
  loadMaterials(): void {
    this.isLoading = true;

    this.notesService.getNotes().subscribe({
      next: (materials) => {
        this.savedMaterials = materials;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading notes:', error);
        this.message = 'Could not load notes. Check that the backend is running.';
        this.isLoading = false;
      }
    });
  }

  // Create a new note or update an existing one
  saveMaterial(): void {
    if (!this.materialTitle.trim() || !this.studyMaterial.trim()) {
      this.message = 'Please enter a title and study material.';
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
        }
      });
    }
  }

  // Fill the form with an existing note
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

  // Delete a note from MongoDB
  deleteMaterial(material: StudyMaterial): void {
    if (!material._id) {
      this.message = 'Could not identify this note.';
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
      },
      error: (error) => {
        console.error('Error deleting note:', error);
        this.message = error.error?.message || 'Could not delete study material.';
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

  // Read a .txt file and put its contents into the form
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