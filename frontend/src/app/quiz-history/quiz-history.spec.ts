import { ComponentFixture, TestBed } from '@angular/core/testing';
import { QuizHistory } from './quiz-history';

describe('QuizHistory', () => {
  let component: QuizHistory;
  let fixture: ComponentFixture<QuizHistory>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [QuizHistory],
    }).compileComponents();

    fixture = TestBed.createComponent(QuizHistory);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
