import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PostComponent } from './post.component';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCardModule } from '@angular/material/card';
import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { Post } from './post';
import { of } from 'rxjs';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

describe('PostComponent', () => {
  let component: PostComponent;
  let fixture: ComponentFixture<PostComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    declarations: [
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
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PostComponent);
    component = fixture.componentInstance;
    component.post = {
      id: '1',
      attributes: {
        name: 'This is a post',
        post: 'This is a post body'
      }
    } as Post;
    component.index = 0;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should delete a post', () => {
    const serviceSpy = jest.spyOn(component['service'], 'deleteRecord').mockReturnValue(of({}));
    window.confirm = jest.fn(() => true); // simulate user confirming the delete action

    component.deletePost();

    expect(serviceSpy).toHaveBeenCalledWith(component.post.id);
    expect(window.confirm).toHaveBeenCalledWith('Delete Post?');
  });

  it('should start editing a post', () => {
    const postBackup = JSON.stringify(component.post);

    component.editPost();

    expect(component.backupcopy).toBe(postBackup);
    expect(component.edit).toBe(true);
  });

  it('should cancel editing a post', () => {
    const postBackup = JSON.stringify(component.post);
    component.backupcopy = postBackup;
    component.edit = true;

    component.cancelEdit();

    expect(component.post).toEqual(JSON.parse(postBackup));
    expect(component.backupcopy).toBe("");
    expect(component.edit).toBe(false);
  });

  it('should save a post', () => {
    const serviceSpy = jest.spyOn(component['service'], 'saveRecord').mockReturnValue(of({}));

    component.savePost();

    expect(serviceSpy).toHaveBeenCalledWith(component.post.id, component.post);
    expect(component.edit).toBe(false);
  });

  it('should create a post', () => {
    const serviceSpy = jest.spyOn(component['service'], 'createRecord').mockReturnValue(of({}));

    component.createPost();

    expect(serviceSpy).toHaveBeenCalledWith(component.post);
  });

  it('should cancel post creation', () => {
    component.post = {
      id: '1',
      attributes: {
        name: 'This is a post',
        post: 'This is a post body'
      }
    } as Post;

    component.cancelCreate();

    expect(component.post).toEqual({ 'attributes': {} } as Post);
  });

  describe('Post class', () => {
    it('should create a new instance with given values', () => {
      const post = new Post();
      post.id = '1';
      post.attributes = { title: 'Post title', content: 'Post content' };

      expect(post.id).toEqual('1');
      expect(post.attributes).toEqual({ title: 'Post title', content: 'Post content' });
    });
  });
});
