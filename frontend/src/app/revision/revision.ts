import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-revision',
  imports: [],
  templateUrl: './revision.html',
  styleUrl: './revision.css'
})
export class Revision {

  subjectName = '';

  constructor(private route: ActivatedRoute) {
    this.subjectName = this.route.snapshot.paramMap.get('subject') || '';
  }

  startQuickRevision() {
    console.log('Starting quick revision for:', this.subjectName);
  }

}