import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';

import { ThreadComponent } from './thread.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { PostComponent } from '../post/post.component';
import { MatCardModule } from '@angular/material/card';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { of } from 'rxjs';
import { Post } from '../post/post';

describe('ThreadComponent', () => {
  let component: ThreadComponent;
  let fixture: ComponentFixture<ThreadComponent>;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      declarations: [
        PostComponent,
        ThreadComponent
      ],
      imports: [
        FormsModule,
        HttpClientTestingModule,
        MatFormFieldModule,
        MatInputModule,
        MatCardModule,
        NoopAnimationsModule
      ]
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

  it('should initialize posts on ngOnInit', fakeAsync(() => {
    const postsStub: Post[] = [
      { id: '1', attributes: { title: 'Post 1', content: 'Post 1' } },
      { id: '2', attributes: { title: 'Post 2', content: 'Post 2' } }
    ];
    jest.spyOn(component['service'], 'getCollection').mockReturnValue(of(postsStub));

    component.ngOnInit();
    tick();
    expect(component.posts).toEqual(postsStub);
  }));

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
    jest.spyOn(component['service'], 'getCollection').mockReturnValue(of(postsStub));

    component.onCreate();

    expect(component['service'].getCollection).toHaveBeenCalledTimes(1);
    expect(component.posts).toEqual(postsStub);
    expect(component.newpost).toEqual({ "attributes": {} } as Post);
  });
});
