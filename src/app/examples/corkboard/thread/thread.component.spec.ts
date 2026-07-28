import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CommonModule } from '@angular/common';
import { By } from '@angular/platform-browser';
import { provideRouter, ActivatedRoute } from '@angular/router';

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
    imports: [
        PostComponent,
        ThreadComponent,
        CommonModule,
        FormsModule,
        MatButtonModule,
        MatFormFieldModule,
        MatInputModule,
        MatCardModule,
        NoopAnimationsModule],
    providers: [
        provideHttpClient(withInterceptorsFromDi()), 
        provideHttpClientTesting(),
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: {
            paramMap: of({ get: () => '' }),
            snapshot: {
              paramMap: {
                get: () => ''
              }
            }
          }
        }
    ]
})
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ThreadComponent);
    component = fixture.componentInstance;
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
    expect(component.posts$).toBeTruthy();
    expect(component['service'].getCollection).toHaveBeenCalledWith('posts');
  });

  it('should bind posts to child post components', () => {
    const postsStub: Post[] = [
      { id: '1', attributes: { name: 'First', post: 'Post 1' } },
      { id: '2', attributes: { name: 'Second', post: 'Post 2' } }
    ];
    vi.spyOn(component['service'], 'getCollection').mockReturnValue(of([...postsStub]));
    fixture.detectChanges();

    const postComponents = fixture.debugElement.queryAll(By.directive(PostComponent));

    expect(postComponents.length).toBe(3);
    expect(postComponents[0].componentInstance.post).toEqual(postsStub[0]);
    expect(postComponents[0].componentInstance.index).toBe(0);

    postComponents[0].componentInstance.deleted.emit();
    postComponents[2].componentInstance.created.emit();
    expect(component.posts$).toBeTruthy();
  });

  it('should delete post on onDelete', () => {
    vi.spyOn(component['service'], 'getCollection').mockReturnValue(of([
      { id: '1', attributes: { title: 'Post 1', content: 'Post 1' } },
      { id: '2', attributes: { title: 'Post 2', content: 'Post 2' } }
    ]));

    component.onDelete();

    expect(component['service'].getCollection).toHaveBeenCalledWith('posts');
  });

  it('should create a post and get collection again on onCreate', () => {
    const postsStub: Post[] = [
      { id: '1', attributes: { title: 'Post 1', content: 'Post 1' } },
      { id: '2', attributes: { title: 'Post 2', content: 'Post 2' } }
    ];
    vi.spyOn(component['service'], 'getCollection').mockReturnValue(of(postsStub));

    component.onCreate();

    expect(component['service'].getCollection).toHaveBeenCalledTimes(1);
    expect(component['service'].getCollection).toHaveBeenCalledWith('posts');
    expect(component.posts$).toBeTruthy();
    expect(component.newpost).toEqual({ "attributes": {} } as Post);
  });

  it('should filter and sort posts reverse-chronologically when threadId is set', () => {
    const route = TestBed.inject(ActivatedRoute);
    (route as any).paramMap = of({
      get: (key: string) => key === 'id' ? 'thread-123' : null
    } as any);

    vi.spyOn(component['service'], 'getRecord').mockReturnValue(of({
      id: 'thread-123',
      originPost: { _id: 'origin-post' }
    }));

    const postsStub: Post[] = [
      { id: 'origin-post', attributes: { name: 'Origin', post: 'First body', createdTS: '2024-01-01T00:00:00.000Z' } },
      { id: 'post-1', attributes: { name: 'Reply 1', post: 'Reply body 1', threadId: 'thread-123', createdTS: '2024-01-02T00:00:00.000Z' } },
      { id: 'post-2', attributes: { name: 'Reply 2', post: 'Reply body 2', threadId: 'other-thread', createdTS: '2024-01-03T00:00:00.000Z' } },
      { id: 'post-3', attributes: { name: 'Reply 3', post: 'Reply body 3', threadId: 'thread-123', createdTS: '2024-01-04T00:00:00.000Z' } }
    ];

    vi.spyOn(component['service'], 'getCollection').mockReturnValue(of(postsStub));

    component.ngOnInit();

    component.posts$.subscribe(filteredPosts => {
      expect(filteredPosts.length).toBe(3);
      expect(filteredPosts[0].id).toBe('post-3');
      expect(filteredPosts[1].id).toBe('post-1');
      expect(filteredPosts[2].id).toBe('origin-post');
    });
  });

  it('should identify origin post correctly', () => {
    component.thread = {
      originPost: { _id: 'origin-id' }
    };
    expect(component.isOriginPost({ id: 'origin-id', attributes: {} })).toBe(true);
    expect(component.isOriginPost({ id: 'other-id', attributes: {} })).toBe(false);
  });

  it('should match origin post using _id', () => {
    component.thread = {
      originPost: { _id: 'origin-id' }
    };
    expect(component.isOriginPost({ _id: 'origin-id', attributes: {} } as any)).toBe(true);
  });
});
