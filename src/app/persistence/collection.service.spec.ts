import { TestBed } from '@angular/core/testing';

import { CollectionService } from './collection.service';
import { HttpClient, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { of } from 'rxjs';

describe('CollectionService', () => {
  let mockUserService: CollectionService;
  let mockWidgetService: CollectionService;
  let httpMock: HttpTestingController;
  let httpClient: HttpClient;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    imports: [],
    providers: [
        CollectionService,
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting()
    ]
}).compileComponents();
    httpMock = TestBed.inject(HttpTestingController);
    httpClient = TestBed.inject(HttpClient);

    mockUserService = CollectionService.serviceFactory(httpClient, 'users');
    mockWidgetService = CollectionService.serviceFactory(httpClient, 'widgets');
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(mockUserService).not.toEqual(mockWidgetService);
  });

  it('setApiUrl should be change the api call', () => {
    mockUserService.setApiUrl('/api/v1');
    expect(mockUserService['apiUrl']).toBe('/api/v1');
    mockUserService.setApiUrl();
    expect(mockUserService['apiUrl']).toBe('/api/v1');
  });

  it('getCollection should return entire collection based on constructed URI', () => {
    let users: Record<string, string>[];
    const spy = jest.spyOn(httpClient, 'get').mockReturnValue(of({ data: [{ id: '1' }, { id: '2' }] }));
    mockUserService.getCollection().subscribe({
      next: (_users) => {
        users = _users;
      }
    });
    expect(users).toEqual([{ id: '1' }, { id: '2' }]);
    expect(spy).toHaveBeenCalledWith('/api/v0/users');
  });

  it('getSchema should be call for schema', () => {
    const spy = jest.spyOn(httpClient, 'get').mockReturnValue(of({}));
    mockUserService.getSchema();
    expect(spy).toHaveBeenCalledWith('/api/v0/schema/users');
  });

  it('getSchemas should be call for all schemas', () => {
    const spy = jest.spyOn(httpClient, 'get').mockReturnValue(of([{}]));
    mockUserService.getSchemas();
    expect(spy).toHaveBeenCalledWith('/api/v0/schema');
  });

  it('getRecord should be call for a record of type collection', () => {
    let widget;
    const spy = jest.spyOn(httpClient, 'get').mockReturnValue(of({ data: {} }));
    mockWidgetService.getRecord('1').subscribe({
      next: (_widget) => {
        widget = _widget;
      }
    });
    expect(spy).toHaveBeenCalledWith('/api/v0/widgets/1');
    expect(widget).toEqual({});
  });

  it('deleteRecord should be call for deletion of record of type collection', () => {
    const spy = jest.spyOn(httpClient, 'delete').mockReturnValue(of(true));
    mockWidgetService.deleteRecord('1').subscribe();
    expect(spy).toHaveBeenCalledWith('/api/v0/widgets/1');
  });

  it('saveRecord should be call for save of record of type collection', () => {
    const spy = jest.spyOn(httpClient, 'put').mockReturnValue(of(true));
    mockWidgetService.saveRecord('1', {}).subscribe();
    expect(spy).toHaveBeenCalledWith('/api/v0/widgets/1', "{}");
  });

  it('patchRecord should be call for save of record of type collection', () => {
    const spy = jest.spyOn(httpClient, 'patch').mockReturnValue(of(true));
    mockWidgetService.patchRecord('1', {}).subscribe();
    expect(spy).toHaveBeenCalledWith('/api/v0/widgets/1', "{}");
  });

  it('createRecord should be call for save of record of type collection', () => {
    let newRecord;
    const spy = jest.spyOn(httpClient, 'post').mockReturnValue(of({ data: { id: '1' } }));
    mockWidgetService.createRecord({}).subscribe({
      next: (record) => {
        newRecord = record;
      }
    });
    expect(spy).toHaveBeenCalledWith('/api/v0/widgets', "{}");
    expect(newRecord).toEqual({ id: '1' });
  });
});
