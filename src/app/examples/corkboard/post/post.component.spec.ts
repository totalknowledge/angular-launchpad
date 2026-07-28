import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CommonModule } from '@angular/common';
import { By } from '@angular/platform-browser';

import { PostComponent } from './post.component';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
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
    imports: [
        PostComponent,
        CommonModule,
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
    const serviceSpy = vi.spyOn(component['service'], 'deleteRecord').mockReturnValue(of({}));
    window.confirm = vi.fn(() => true); // simulate user confirming the delete action

    component.deletePost();

    expect(serviceSpy).toHaveBeenCalledWith('posts', component.post.id);
    expect(window.confirm).toHaveBeenCalledWith('Delete Post?');
  });

  it('should invoke display actions from the template', () => {
    const editSpy = vi.spyOn(component, 'editPost');
    const deleteSpy = vi.spyOn(component, 'deletePost');

    const actions = Array.from((fixture.nativeElement as HTMLElement).querySelectorAll('a'));
    actions.find(action => action.textContent?.includes('Edit'))?.click();
    actions.find(action => action.textContent?.includes('Delete'))?.click();

    expect(editSpy).toHaveBeenCalled();
    expect(deleteSpy).toHaveBeenCalled();
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
    const serviceSpy = vi.spyOn(component['service'], 'saveRecord').mockReturnValue(of({}));

    component.savePost();

    expect(serviceSpy).toHaveBeenCalledWith('posts', component.post.id, component.post);
    expect(component.edit).toBe(false);
  });

  it('should save a post after entering edit mode', () => {
    const serviceSpy = vi.spyOn(component['service'], 'saveRecord').mockReturnValue(of({}));
    component.editPost();

    component.savePost();

    expect(serviceSpy).toHaveBeenCalledWith('posts', component.post.id, component.post);
    expect(component.edit).toBeFalsy();
  });

  it('should cancel editing after entering edit mode', () => {
    component.editPost();
    component.post.attributes.name = 'Changed';

    component.cancelEdit();

    expect(component.post.attributes.name).toBe('This is a post');
    expect(component.edit).toBeFalsy();
  });

  it('should create a post', () => {
    const serviceSpy = vi.spyOn(component['service'], 'createRecord').mockReturnValue(of({}));

    component.createPost();

    expect(serviceSpy).toHaveBeenCalledWith('posts', component.post);
  });

  it('should invoke create actions from the template', async () => {
    const createSpy = vi.spyOn(component, 'createPost');
    const cancelSpy = vi.spyOn(component, 'cancelCreate');
    vi.spyOn(component['service'], 'createRecord').mockReturnValue(of({}));
    fixture.componentRef.setInput('post', { attributes: {} } as Post);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const postButton = fixture.debugElement.queryAll(By.css('button'))
      .find(button => button.nativeElement.textContent.includes('Post'));
    const cancelAction = fixture.debugElement.queryAll(By.css('a'))
      .find(action => action.nativeElement.textContent.includes('Cancel'));

    expect(postButton).toBeTruthy();
    expect(cancelAction).toBeTruthy();
    const nameInput = fixture.debugElement.query(By.css('input')).nativeElement as HTMLInputElement;
    const postTextarea = fixture.debugElement.query(By.css('textarea')).nativeElement as HTMLTextAreaElement;
    nameInput.value = 'New poster';
    nameInput.dispatchEvent(new Event('input'));
    postTextarea.value = 'New post body';
    postTextarea.dispatchEvent(new Event('input'));
    expect(component.post.attributes.name).toBe('New poster');
    postButton?.triggerEventHandler('click');
    cancelAction?.triggerEventHandler('click');

    expect(createSpy).toHaveBeenCalled();
    expect(cancelSpy).toHaveBeenCalled();
  });

  it('should invoke edit actions from the template', async () => {
    const saveSpy = vi.spyOn(component, 'savePost');
    const cancelSpy = vi.spyOn(component, 'cancelEdit');
    vi.spyOn(component['service'], 'saveRecord').mockReturnValue(of({}));
    fixture.componentRef.setInput('post', {
      id: '1',
      attributes: {
        name: 'This is a post',
        post: 'This is a post body'
      }
    } as Post);
    component.backupcopy = JSON.stringify(component.post);
    component.edit = true;
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const postButton = fixture.debugElement.queryAll(By.css('button'))
      .find(button => button.nativeElement.textContent.includes('Post'));
    const cancelAction = fixture.debugElement.queryAll(By.css('a'))
      .find(action => action.nativeElement.textContent.includes('Cancel'));

    expect(postButton).toBeTruthy();
    expect(cancelAction).toBeTruthy();
    const nameInput = fixture.debugElement.query(By.css('input')).nativeElement as HTMLInputElement;
    const postTextarea = fixture.debugElement.query(By.css('textarea')).nativeElement as HTMLTextAreaElement;
    nameInput.value = 'Edited poster';
    nameInput.dispatchEvent(new Event('input'));
    postTextarea.value = 'Edited post body';
    postTextarea.dispatchEvent(new Event('input'));
    postButton?.triggerEventHandler('click');
    cancelAction?.triggerEventHandler('click');

    expect(saveSpy).toHaveBeenCalled();
    expect(cancelSpy).toHaveBeenCalled();
  });

  it('should hide the post title for replies', () => {
    fixture.componentRef.setInput('index', 1);
    fixture.detectChanges();

    expect((fixture.nativeElement as HTMLElement).querySelector('mat-card-title')).toBeFalsy();
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

  it('should initialize attributes if undefined when creating/saving a post', () => {
    component.post = { id: '1' } as Post;
    vi.spyOn(component['service'], 'saveRecord').mockReturnValue(of({}));
    component.savePost();
    expect(component.post.attributes).toBeDefined();
    expect(component.post.attributes['editedTS']).toBeDefined();
  });

  it('should not delete a post if user cancels', () => {
    const serviceSpy = vi.spyOn(component['service'], 'deleteRecord');
    window.confirm = vi.fn(() => false);
    component.deletePost();
    expect(serviceSpy).not.toHaveBeenCalled();
  });

  it('should preserve existing createdTS when creating a post', () => {
    const existingTS = '2024-01-01T00:00:00.000Z';
    component.post = {
      attributes: {
        createdTS: existingTS
      }
    } as Post;
    vi.spyOn(component['service'], 'createRecord').mockReturnValue(of({}));
    component.createPost();
    expect(component.post.attributes['createdTS']).toBe(existingTS);
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
