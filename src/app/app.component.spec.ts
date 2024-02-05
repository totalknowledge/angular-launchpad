import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AppComponent, SignInDialogComponent } from './app.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { MAT_DIALOG_DATA, MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { Injectable } from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatMenuModule } from '@angular/material/menu';
import { RouterTestingModule } from '@angular/router/testing';
import { AuthService, User } from './persistence/auth.service';
import { Subject, of } from 'rxjs';
import { ThreadComponent } from './examples/corkboard/thread/thread.component';
import { ActivatedRoute } from '@angular/router';
import { PostComponent } from './examples/corkboard/post/post.component';

interface MatDialogMock extends MatDialog {
  open: jest.Mock;
}

@Injectable()
export class MatDialogStub {
  open() {
    return {
      afterClosed: () => of({ name: 'test', password: 'password' })
    } as MatDialogRef<SignInDialogComponent>;
  }
}

describe('AppComponent', () => {
  let component: AppComponent;
  let fixture: ComponentFixture<AppComponent>;
  let authService: AuthService;
  /* const mockUser: Partial<User> = {
    id: '1',
    name: 'string',
    attributes: { name: 'test' },
    password: 'string;',
    token: 'string;'
  }; */

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [
        AppComponent,
        ThreadComponent,
        PostComponent
      ],
      imports: [
        HttpClientModule,
        HttpClientTestingModule,
        MatDialogModule,
        MatMenuModule,
        MatToolbarModule,
        RouterTestingModule
      ],
      providers: [
        AuthService,
        HttpClient,
        { provide: MatDialog, useClass: MatDialogStub },
        { provide: MAT_DIALOG_DATA, useValue: {} },
        { provide: ActivatedRoute, useValue: authService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
    authService = TestBed.inject(AuthService);
    fixture.detectChanges();
  });

  it('should create the app', () => {
    expect(component).toBeTruthy();
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
  });

  it('should call signOut() and reset user and loggedin properties when signOut() is called', () => {
    const signOutSpy = jest.spyOn(authService, 'signOut').mockReturnValue(of({} as User));
    component.signOut();

    expect(signOutSpy).toHaveBeenCalled();
    expect(component.user).toEqual({ "attributes": {} });
    expect(component.loggedin).toBeFalsy();
  });
});
