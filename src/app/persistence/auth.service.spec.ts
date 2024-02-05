import { TestBed } from '@angular/core/testing';

import { AuthService, User } from './auth.service';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { Md5 } from 'ts-md5';
import { of } from 'rxjs';

describe('AuthService', () => {
  let authService: AuthService;
  let fakeHttpClient: HttpTestingController;
  let dummyUser: User;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule
      ],
      providers: [
        AuthService
      ]
    });
    authService = TestBed.inject(AuthService);
    fakeHttpClient = TestBed.inject(HttpTestingController);
  });

  beforeEach(() => {
    dummyUser = {
      id: '1',
      name: 'testUser',
      password: 'pwd',
      attributes: {}
    };
    authService.user = dummyUser;
  });

  afterEach(() => {
    fakeHttpClient.verify();
  });

  it('should be created', () => {
    expect(authService).toBeTruthy();
    expect(authService.applicationKey).toBe('Hlsdkfo3498298oisdf9w2jfsoef983iqwja90fd3af');
  });

  it('should correctly check permissions', () => {
    authService.user.attributes = { permission: "user" };
    expect(authService.hasPermission([])).toBeTruthy();
    expect(authService.hasPermission(['user'])).toBeTruthy();
    expect(authService.hasPermission(['inherited'], ['user'])).toBeTruthy();
    expect(authService.hasPermission(['differentPermission'], [])).toBeFalsy();
  });

  it('should correctly check permissions for admin', () => {
    authService.user.attributes = { permission: "admin" };
    expect(authService.hasPermission([])).toBeTruthy();
    expect(authService.hasPermission(['user'])).toBeTruthy();
    expect(authService.hasPermission(['inherited'], ['user'])).toBeTruthy();
    expect(authService.hasPermission(['differentPermission'], [])).toBeTruthy();
  });

  it('should return instance stamp with getInstanceStamp', () => {
    const spy = jest.spyOn(authService['http'], 'patch').mockReturnValue(of(''));
    authService.signOut();
    expect(authService.user).toBeFalsy();
    expect(authService.token).toBeFalsy();
    expect(spy).toHaveBeenCalled();
  });

  it('should return instance stamp with getInstanceStamp', () => {
    expect(authService.getInstanceStamp()).toBeTruthy();
  });

  it('should return token with getToken', (done: jest.DoneCallback) => {
    const spy = jest.spyOn(authService['http'], 'get').mockReturnValue(of(
      {
        data: [{
          id: 1,
          password: Md5.hashStr('pwd'),
          attributes: {
            name: 'testUser'
          }
        }]
      }
    ));
    authService.signIn(dummyUser, 'pwd').subscribe({
      next: (user) => {
        expect(user).toBeDefined();
        expect(authService.getToken()).toBeTruthy();
        done();
      }
    });
    expect(authService.getToken()).toBeTruthy();
    expect(spy).toHaveBeenCalled();
  });

  it('should return default admin when no users returned', (done: jest.DoneCallback) => {
    const spy = jest.spyOn(authService['http'], 'get').mockReturnValue(of(
      {
        data: []
      }
    ));
    authService.signIn(dummyUser, 'pwd').subscribe({
      next: (user) => {
        expect(user).toBeDefined();
        done();
      }
    });
    expect(spy).toHaveBeenCalled();
  });

  it('should return user with getUser', () => {
    expect(authService.getUser()).toBeTruthy();
  });

  it('should return application key with getApplicationKey', () => {
    expect(authService.getApplicationKey()).toBe('Hlsdkfo3498298oisdf9w2jfsoef983iqwja90fd3af');
  });
});
