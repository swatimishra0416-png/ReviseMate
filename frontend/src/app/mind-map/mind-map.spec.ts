import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MindMap } from './mind-map';

describe('MindMap', () => {
  let component: MindMap;
  let fixture: ComponentFixture<MindMap>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MindMap],
    }).compileComponents();

    fixture = TestBed.createComponent(MindMap);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
