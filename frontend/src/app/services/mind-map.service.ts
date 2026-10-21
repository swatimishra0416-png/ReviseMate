
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface MindMapTopic {
  title: string;
  subtopics: string[];
}

export interface SubjectMindMap {
  _id?: string;
  subject: string;
  centralTopic: string;
  topics: MindMapTopic[];
  createdAt?: string;
  updatedAt?: string;
}

@Injectable({
  providedIn: 'root'
})
export class MindMapService {
  private http = inject(HttpClient);

  private apiUrl = 'http://localhost:3000/api/mindmaps';

  // Get all saved mind maps
  getAllMindMaps(): Observable<SubjectMindMap[]> {
    return this.http.get<SubjectMindMap[]>(this.apiUrl);
  }

  // Get a mind map for a particular subject
  getMindMap(subject: string): Observable<SubjectMindMap> {
    return this.http.get<SubjectMindMap>(
      `${this.apiUrl}/${encodeURIComponent(subject)}`
    );
  }

  // Create or update a subject's mind map
  saveMindMap(
    subject: string,
    mindMap: Pick<SubjectMindMap, 'centralTopic' | 'topics'>
  ): Observable<SubjectMindMap> {
    return this.http.put<SubjectMindMap>(
      `${this.apiUrl}/${encodeURIComponent(subject)}`,
      mindMap
    );
  }

  // Delete a subject's saved mind map
  deleteMindMap(subject: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(
      `${this.apiUrl}/${encodeURIComponent(subject)}`
    );
  }
}
