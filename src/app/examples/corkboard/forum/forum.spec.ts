import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { By } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';

import { ForumComponent } from './forum';

describe('ForumComponent', () => {
  let component: ForumComponent;
  let fixture: ComponentFixture<ForumComponent>;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ForumComponent],
      providers: [
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting(),
        provideRouter([]),
      ],
    })
    .compileComponents();

    fixture = TestBed.createComponent(ForumComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  async function flushCollections(forums = [], threads = []) {
    httpMock.expectOne('/api/v0/forums').flush({ data: forums });
    httpMock.expectOne('/api/v0/threads').flush({ data: threads });
    await fixture.whenStable();
    fixture.detectChanges();
  }

  function text() {
    return (fixture.nativeElement as HTMLElement).textContent ?? '';
  }

  beforeEach(() => {
    fixture.detectChanges();
  });

  it('should create', async () => {
    await flushCollections();

    expect(component).toBeTruthy();
  });

  it('should list forums with threads in reverse chronological order', async () => {
    await flushCollections(
      [
        { id: '100', name: 'General', description: 'General discussion', createdTS: '2024-01-01T00:00:00.000Z' },
        { id: '101', name: 'Support', createdTS: '2024-01-03T00:00:00.000Z' },
      ],
      [
        { id: '200', forumId: '100', title: 'Older thread', createdTS: '2024-01-01T00:00:00.000Z' },
        { id: '201', forumId: '100', title: 'Newer thread', updatedTS: '2024-01-02T00:00:00.000Z' },
        { id: '202', forumId: '999', title: 'Other forum', createdTS: '2024-01-04T00:00:00.000Z' },
      ],
    );

    const content = text();
    expect(content.indexOf('Support')).toBeLessThan(content.indexOf('General'));
    expect(content.indexOf('Newer thread')).toBeLessThan(content.indexOf('Older thread'));
    expect(content).not.toContain('Other forum');
    expect(component.threadsForForum(component.forums.find(forum => forum.id === '101'))).toEqual([]);
  });

  it('should render fallback labels and thread metadata', async () => {
    await flushCollections(
      [{ id: '100', createdTS: '2024-01-01T00:00:00.000Z' }],
      [{
        id: '200',
        forumId: '100',
        creator: 'Bryan',
        updatedTS: '2024-01-02T12:00:00.000Z'
      }],
    );

    const content = text();
    expect(content).toContain('Untitled forum');
    expect(content).toContain('Untitled thread');
    expect(content).toContain('Started by Bryan');
    expect(content).toContain('Jan 2, 2024');
  });

  it('should group legacy forum ids and skip orphan threads', async () => {
    await flushCollections();

    const grouped = component['groupThreads']([
      { id: '200', forum: { _id: 'legacy-forum' }, title: 'Legacy thread' },
      { id: '201', title: 'Orphan thread' },
    ]);
    const sortedForums = component['sortForums']([
      { _id: '10', name: 'Older id' },
      { id: '11', name: 'Newer id' },
    ]);

    expect(component.forumKey({ _id: 'legacy-forum' })).toBe('legacy-forum');
    expect(component.forumKey({})).toBe('');
    expect(grouped['legacy-forum'][0].title).toBe('Legacy thread');
    expect(grouped['']).toBeUndefined();
    expect(sortedForums[0].name).toBe('Newer id');

    component.creatingThreadFor = 'other-forum';
    component.originPostDrafts['legacy-forum'] = { attributes: { name: 'Draft' } };
    component.cancelNewThread({ _id: 'legacy-forum' });

    expect(component.creatingThreadFor).toBe('other-forum');
    expect(component.originPostDrafts['legacy-forum']).toBeUndefined();
  });

  it('should create a forum through the generic collection endpoint', async () => {
    await flushCollections();

    fixture.debugElement.query(By.css('.forum-board-header button')).triggerEventHandler('click');
    fixture.detectChanges();

    const inputs = fixture.debugElement.queryAll(By.css('input, textarea'));
    inputs[0].nativeElement.value = 'Announcements';
    inputs[0].nativeElement.dispatchEvent(new Event('input'));
    inputs[1].nativeElement.value = 'News and release notes';
    inputs[1].nativeElement.dispatchEvent(new Event('input'));

    fixture.debugElement.queryAll(By.css('button'))
      .find(button => button.nativeElement.textContent.includes('Create Forum'))
      .triggerEventHandler('click');

    const request = httpMock.expectOne('/api/v0/forums');
    expect(request.request.method).toBe('POST');
    const body = JSON.parse(request.request.body);
    expect(body.name).toBe('Announcements');
    expect(body.description).toBe('News and release notes');
    request.flush({ data: { id: '102', ...body } });
    await flushCollections([{ id: '102', ...body }], []);

    expect(component.creatingForum).toBeFalsy();
    expect(component.forums[0].name).toBe('Announcements');
  });

  it('should create a new thread inside a forum', async () => {
    await flushCollections([{ id: '100', name: 'General' }], []);

    fixture.debugElement.queryAll(By.css('button'))
      .find(button => button.nativeElement.textContent.trim() === 'New')
      .triggerEventHandler('click');
    fixture.detectChanges();

    const nameInput = fixture.debugElement.query(By.css('input[placeholder="Name"]'));
    const postTextarea = fixture.debugElement.query(By.css('textarea[placeholder="Post"]'));
    nameInput.nativeElement.value = 'First thread';
    nameInput.nativeElement.dispatchEvent(new Event('input'));
    postTextarea.nativeElement.value = 'This is the first post';
    postTextarea.nativeElement.dispatchEvent(new Event('input'));

    fixture.debugElement.queryAll(By.css('button'))
      .find(button => button.nativeElement.textContent.includes('Post'))
      .triggerEventHandler('click');

    const postRequest = httpMock.expectOne('/api/v0/posts');
    expect(postRequest.request.method).toBe('POST');
    const postBody = JSON.parse(postRequest.request.body);
    expect(postBody.attributes.name).toBe('First thread');
    expect(postBody.attributes.post).toBe('This is the first post');
    postRequest.flush({ data: { id: '300', ...postBody } });

    const request = httpMock.expectOne('/api/v0/threads');
    expect(request.request.method).toBe('POST');
    const body = JSON.parse(request.request.body);
    expect(body.title).toBe('First thread');
    expect(body.forumId).toBe('100');
    expect(body.originPost.id).toBe('300');
    expect(body.originPost.attributes.post).toBe('This is the first post');
    request.flush({ data: { id: '200', ...body } });
    await flushCollections([{ id: '100', name: 'General' }], [{ id: '200', ...body }]);

    expect(component.creatingThreadFor).toBe('');
    expect(text()).toContain('First thread');
  });
});
