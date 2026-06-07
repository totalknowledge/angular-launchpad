import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CommonModule } from '@angular/common';
import { By } from '@angular/platform-browser';

import { ThreadComponent } from './thread.component';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { PostComponent } from '../post/post.component';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { of } from 'rxjs';
import { Post } from '../post/post';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

describe('ThreadComponent', () => {
  let component: ThreadComponent;
  let fixture: ComponentFixture<ThreadComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    declarations: [
        PostComponent,
        ThreadComponent
    ],
    imports: [CommonModule,
        FormsModule,
        MatButtonModule,
        MatFormFieldModule,
        MatInputModule,
        MatCardModule,
        NoopAnimationsModule],
    providers: [provideHttpClient(withInterceptorsFromDi()), provideHttpClientTesting()]
})
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ThreadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize posts on ngOnInit', () => {
    const postsStub: Post[] = [
      { id: '1', attributes: { title: 'Post 1', content: 'Post 1' } },
      { id: '2', attributes: { title: 'Post 2', content: 'Post 2' } }
    ];
    vi.spyOn(component['service'], 'getCollection').mockReturnValue(of(postsStub));

    component.ngOnInit();
    expect(component.posts).toEqual(postsStub);
  });

  it('should bind posts to child post components', () => {
    const postsStub: Post[] = [
      { id: '1', attributes: { name: 'First', post: 'Post 1' } },
      { id: '2', attributes: { name: 'Second', post: 'Post 2' } }
    ];
    component.posts = [...postsStub];
    component.newpost = { attributes: {} } as Post;
    fixture.detectChanges();

    const postComponents = fixture.debugElement.queryAll(By.directive(PostComponent));

    expect(postComponents.length).toBe(3);
    expect(postComponents[0].componentInstance.post).toEqual(postsStub[0]);
    expect(postComponents[0].componentInstance.index).toBe(0);

    postComponents[0].componentInstance.deleted.emit();
    expect(component.posts).toEqual([postsStub[1]]);
  });

  it('should delete post on onDelete', () => {
    component.posts = [
      { id: '1', attributes: { title: 'Post 1', content: 'Post 1' } },
      { id: '2', attributes: { title: 'Post 2', content: 'Post 2' } }
    ];
    const initialLength = component.posts.length;

    component.onDelete(0);

    expect(component.posts.length).toEqual(initialLength - 1);
  });

  it('should create a post and get collection again on onCreate', () => {
    const postsStub: Post[] = [
      { id: '1', attributes: { title: 'Post 1', content: 'Post 1' } },
      { id: '2', attributes: { title: 'Post 2', content: 'Post 2' } }
    ];
    vi.spyOn(component['service'], 'getCollection').mockReturnValue(of(postsStub));

    component.onCreate();

    expect(component['service'].getCollection).toHaveBeenCalledTimes(1);
    expect(component.posts).toEqual(postsStub);
    expect(component.newpost).toEqual({ "attributes": {} } as Post);
  });
});
