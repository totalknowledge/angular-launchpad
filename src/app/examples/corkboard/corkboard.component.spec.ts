import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { CorkboardComponent } from './corkboard.component';
import { ThreadComponent } from './thread/thread.component';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { PostComponent } from './post/post.component';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCardModule } from '@angular/material/card';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule } from '@angular/forms';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

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
    imports: [FormsModule,
        MatCardModule,
        MatFormFieldModule,
        MatInputModule,
        NoopAnimationsModule],
    providers: [provideHttpClient(withInterceptorsFromDi()), provideHttpClientTesting()]
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
