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
  selectedOption = '';

  constructor(private route: ActivatedRoute) {
    this.subjectName = this.route.snapshot.paramMap.get('subject') || '';
  }

  startQuickRevision() {
  if (!this.selectedOption) {
    return;
  }

  this.showRevisionContent = true;

  console.log(
    'Starting',
    this.selectedOption,
    'for:',
    this.subjectName
  );
}

selectOption(option: string) {
  this.selectedOption = option;
  console.log('Selected revision option:', option);
}
revisionContent: { [key: string]: string[] } = {
  'Computer Networks': [
    'TCP is a connection-oriented transport protocol.',
    'UDP is a connectionless transport protocol.',
    'DNS translates domain names into IP addresses.'
  ],
  'DBMS': [
    'A primary key uniquely identifies each record.',
    'Normalization reduces data redundancy.',
    'ACID stands for Atomicity, Consistency, Isolation, and Durability.'
  ]
};
showRevisionContent = false;

}