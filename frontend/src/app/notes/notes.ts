
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
@Component({
  imports: [FormsModule],
  selector: 'app-notes',
  styleUrl: './notes.css',
  templateUrl: './notes.html',
})
export class Notes {
  materialTitle = '';
  selectedFileName = '';
  selectedSubject = 'Computer Networks';
  studyMaterial = '';

  subjects = [
    'Computer Networks',
    'DBMS',
    'Operating Systems',
    'Data Structures',
  ];
  
  savedMaterials: {
  title: string;
  subject: string;
  content: string;
}[] = [];

  message = '';
  editingIndex: number | null = null;

 

saveMaterial() {
  if (!this.materialTitle.trim() || !this.studyMaterial.trim()) {
    this.message = 'Please enter a title and study material.';
    return;
  }

  const material = {
    title: this.materialTitle.trim(),
    subject: this.selectedSubject,
    content: this.studyMaterial.trim(),
  };

  if (this.editingIndex !== null) {
    this.savedMaterials[this.editingIndex] = material;
    this.message = 'Study material updated successfully!';
    this.editingIndex = null;
  } else {
    this.savedMaterials.push(material);
    this.message = 'Study material saved successfully!';
  }

  this.materialTitle = '';
  this.studyMaterial = '';
  this.selectedFileName = '';
}


deleteMaterial(index: number) {
  this.savedMaterials.splice(index, 1);
  this.message = 'Study material deleted successfully!';
}

editMaterial(index: number) {
  const material = this.savedMaterials[index];

  this.materialTitle = material.title;
  this.selectedSubject = material.subject;
  this.studyMaterial = material.content;

  this.editingIndex = index;
  this.message = 'Editing your study material.';
}

cancelEdit() {
  this.materialTitle = '';
  this.studyMaterial = '';
  this.selectedFileName = '';
  this.editingIndex = null;
  this.message = 'Editing cancelled.';
}



  
async onFileSelected(event: Event) {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];
  console.log('Selected file:', file?.name);

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

  console.log('Filename stored:', this.selectedFileName);

  input.value = '';

  console.log('Filename after clearing input:', this.selectedFileName);

  this.message = 'File loaded successfully! You can now save your study material.';
} catch {
  this.message = 'Could not read the file. Please try again.';
}

console.log('Final filename value:', this.selectedFileName);
}

}
