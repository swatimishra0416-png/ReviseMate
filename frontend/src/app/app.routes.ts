import { Routes } from '@angular/router';
import { Dashboard } from './dashboard/dashboard';
import { Subjects } from './subjects/subjects';
import { Notes } from './notes/notes';
import { MindMap } from './mind-map/mind-map';
import { Flashcards } from './flashcards/flashcards';
import { Quiz } from './quiz/quiz';
import { Revision } from './revision/revision';

export const routes: Routes = [
  {
    path: 'dashboard',
    component: Dashboard
  },
  {
    path: 'subjects',
    component: Subjects
  },
  {
    path: 'notes',
    component: Notes
  },
  {
    path: 'mind-map',
    component: MindMap
  },
  {
    path: 'flashcards',
    component: Flashcards
  },
  {
    path: 'quiz',
    component: Quiz
  },
  {
    path: 'revision/:subject', 
    component: Revision 
  }
];