import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CommonModule } from '@angular/common';

import { CorkboardComponent } from './corkboard.component';
import { ThreadComponent } from './thread/thread.component';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { PostComponent } from './post/post.component';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule } from '@angular/forms';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

describe('CorkboardComponent', () => {
  let component: CorkboardComponent;
  let fixture: ComponentFixture<CorkboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    declarations: [
        CorkboardComponent,
        ThreadComponent,
        PostComponent
    ],
    imports: [CommonModule,
        FormsModule,
        MatButtonModule,
        MatCardModule,
        MatFormFieldModule,
        MatInputModule,
        NoopAnimationsModule],
    providers: [provideHttpClient(withInterceptorsFromDi()), provideHttpClientTesting()]
})
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CorkboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
