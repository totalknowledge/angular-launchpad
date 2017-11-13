import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CorkboardComponent } from './corkboard.component';

describe('CorkboardComponent', () => {
  let component: CorkboardComponent;
  let fixture: ComponentFixture<CorkboardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CorkboardComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CorkboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
