import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AppComponent, SignInDialogComponent } from './app.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { MAT_DIALOG_DATA, MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatMenuModule } from '@angular/material/menu';
import { RouterTestingModule } from '@angular/router/testing';
import { AuthService, User } from './persistence/auth.service';
import { Observable, Subject, of } from 'rxjs';
import { ThreadComponent } from './examples/corkboard/thread/thread.component';
import { Router } from '@angular/router';
import { PostComponent } from './examples/corkboard/post/post.component';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

interface MatDialogMock extends MatDialog {
  open: jest.Mock;
}

export class MatDialogStub {
  open() {
    return {
      afterClosed: () => of({ name: 'test', password: 'password' })
    } as MatDialogRef<SignInDialogComponent>;
  }
}

class AuthServiceStub {
  signIn() {
    return of({
      id: '1',
      name: 'Test User',
      attributes: { permission: 'admin' },
      token: 'mockToken'
    });
  }
  signOut(): Observable<User> {
    return of({
      attributes: {
        "status": "Signed Out",
      }
    } as User);
  }
  getUser() {
    return {
      id: '1',
      name: 'Test User',
      attributes: { permission: 'admin' },
      token: 'mockToken'
    };
  }
}

describe('AppComponent', () => {
  let component: AppComponent;
  let fixture: ComponentFixture<AppComponent>;
  let mockRoute: Router;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [
        AppComponent,
        ThreadComponent,
        PostComponent
      ],
      imports: [
        HttpClientTestingModule,
        MatDialogModule,
        MatMenuModule,
        MatToolbarModule,
        RouterTestingModule.withRoutes([{
          path: '', component: AppComponent
        }])
      ],
      providers: [
        { provide: MatDialog, useClass: MatDialogStub },
        { provide: MAT_DIALOG_DATA, useValue: {} },
        { provide: AuthService, useClass: AuthServiceStub }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
    mockRoute = TestBed.inject(Router);
    fixture.detectChanges();
  });

  it('should create the app', () => {
    expect(component).toBeTruthy();
  });

  it('should set logged in as true if user.id is present', () => {
    expect(component.loggedin).toBeTruthy();
  });

  it('should open the dialog when signIn() is called', () => {
    const afterClosedSubject = new Subject<{ name: string, password: string; }>();
    const dialogRefMock: { afterClosed: () => Subject<{ name: string, password: string; }>; } = {
      afterClosed: () => afterClosedSubject
    };
    const dialogMock: Partial<MatDialogMock> = {
      open: jest.fn(() => dialogRefMock)
    };
    component.dialog = dialogMock as MatDialogMock;

    component.signIn();
    expect(dialogMock.open).toHaveBeenCalled();

    const mockSignInData = { name: 'testUser', password: 'testPassword' };
    afterClosedSubject.next(mockSignInData);
    afterClosedSubject.complete();
    fixture.detectChanges();

    expect(component.loggedin).toBeTruthy();
  });

  it('should call signOut() and reset user and loggedin properties when signOut() is called', () => {
    jest.spyOn(mockRoute, 'navigate').mockImplementation(jest.fn());
    component.signOut();

    expect(component.user).toEqual({
      "attributes": {
        "status": "Signed Out",
      }
    });
    expect(mockRoute.navigate).toHaveBeenCalled();
    expect(component.loggedin).toBeFalsy();
  });
});

describe('SignInDialogComponent', () => {
  let component: SignInDialogComponent;
  let fixture: ComponentFixture<SignInDialogComponent>;

  const mockDialogRef = {
    close: jest.fn()
  };
  const mockData: User = { id: '1', name: 'Test User', attributes: {}, password: 'test', token: 'token' };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SignInDialogComponent],
      imports: [
        MatDialogModule,
        MatFormFieldModule,
        MatInputModule,
        MatMenuModule,
        NoopAnimationsModule,
        FormsModule
      ],
      providers: [
        { provide: MatDialogRef, useValue: mockDialogRef },
        { provide: MAT_DIALOG_DATA, useValue: mockData }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(SignInDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should create', () => {
    jest.spyOn(mockDialogRef, 'close').mockImplementation(jest.fn());
    component.onNoClick();
    expect(mockDialogRef.close).toHaveBeenCalled();
  });
});
