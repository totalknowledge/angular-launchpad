import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { CorkboardComponent } from './corkboard.component';
import { ThreadComponent } from './thread/thread.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { PostComponent } from './post/post.component';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCardModule } from '@angular/material/card';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule } from '@angular/forms';

describe('CorkboardComponent', () => {
  let component: CorkboardComponent;
  let fixture: ComponentFixture<CorkboardComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [
        CorkboardComponent,
        ThreadComponent,
        PostComponent
      ],
      imports: [
        FormsModule,
        HttpClientTestingModule,
        MatCardModule,
        MatFormFieldModule,
        MatInputModule,
        NoopAnimationsModule
      ]
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
