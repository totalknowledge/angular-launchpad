import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { By } from '@angular/platform-browser';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatToolbarModule } from '@angular/material/toolbar';
import { of } from 'rxjs';

import { AppComponent } from './app.component';
import { DialogService } from './examples/dialog/dialog.service';
import { AuthService, User } from './persistence/auth.service';

@Component({
  template: '',
  standalone: false
})
class EmptyRouteComponent {}

class AuthServiceStub {
  user: User = {
    id: '1',
    name: 'Test User',
    attributes: { permission: 'admin' },
    token: 'mockToken',
  };

  signIn = vi.fn(() => of(this.user));

  signOut = vi.fn(() => of({
    attributes: {
      status: 'Signed Out',
    },
  } as User));

  getUser() {
    return this.user;
  }
}

class DialogServiceStub {
  open = vi.fn(() => of({ name: 'testUser', password: 'testPassword' }));
  close = vi.fn();
}

describe('AppComponent', () => {
  let component: AppComponent;
  let fixture: ComponentFixture<AppComponent>;
  let authService: AuthServiceStub;
  let dialogService: DialogServiceStub;
  let router: Router;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [EmptyRouteComponent],
      imports: [
        AppComponent,
        CommonModule,
        FormsModule,
        MatButtonModule,
        MatMenuModule,
        MatToolbarModule,
        RouterTestingModule.withRoutes([{ path: '', component: EmptyRouteComponent }]),
      ],
      providers: [
        { provide: AuthService, useClass: AuthServiceStub },
        { provide: DialogService, useClass: DialogServiceStub },
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting(),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
    authService = TestBed.inject(AuthService) as unknown as AuthServiceStub;
    dialogService = TestBed.inject(DialogService) as unknown as DialogServiceStub;
    router = TestBed.inject(Router);
    fixture.detectChanges();
  });

  it('should create the app', () => {
    expect(component).toBeTruthy();
  });

  it('should mark the user logged in when a stored user has an id', () => {
    expect(component.loggedin).toBeTruthy();
  });

  it('should open the sign-in dialog and call AuthService with user credentials', () => {
    component.signIn();

    expect(dialogService.open).toHaveBeenCalled();
    expect(authService.signIn).toHaveBeenCalledWith(
      { name: 'testUser', attributes: {} },
      'testPassword',
    );
    expect(component.loggedin).toBeTruthy();
  });

  it('should be ready to sign in after signing out', () => {
    component.signOut();
    vi.clearAllMocks();

    component.signIn();

    expect(dialogService.open).toHaveBeenCalled();
    expect(authService.signIn).toHaveBeenCalled();
    expect(component.loggedin).toBeTruthy();
  });

  it('should sign out, reset the user, and navigate home', () => {
    const navigate = vi.spyOn(router, 'navigate').mockResolvedValue(true);

    component.signOut();

    expect(authService.signOut).toHaveBeenCalled();
    expect(component.user).toEqual({
      attributes: {
        status: 'Signed Out',
      },
    });
    expect(navigate).toHaveBeenCalledWith(['/']);
    expect(component.loggedin).toBeFalsy();
  });

  it('should sign out from the toolbar button', () => {
    const navigate = vi.spyOn(router, 'navigate').mockResolvedValue(true);
    const signOutButton = Array.from((fixture.nativeElement as HTMLElement).querySelectorAll('button'))
      .find(button => button.textContent?.includes('Sign Out'));

    signOutButton?.click();

    expect(authService.signOut).toHaveBeenCalled();
    expect(navigate).toHaveBeenCalledWith(['/']);
    expect(component.loggedin).toBeFalsy();
  });

  it('should sign in from the toolbar button', () => {
    authService.user = { attributes: {} } as User;
    const signedOutFixture = TestBed.createComponent(AppComponent);
    const signedOutComponent = signedOutFixture.componentInstance;
    signedOutFixture.detectChanges();
    authService.signIn.mockReturnValueOnce(of({
      id: '2',
      name: 'Signed In User',
      attributes: { permission: 'user' },
      token: 'signedInToken',
    } as User));
    vi.clearAllMocks();

    const signInButton = signedOutFixture.debugElement.queryAll(By.css('button'))
      .find(button => button.nativeElement.textContent.includes('Sign In'));

    expect(signInButton).toBeTruthy();
    signInButton?.triggerEventHandler('click');

    expect(dialogService.open).toHaveBeenCalled();
    expect(authService.signIn).toHaveBeenCalled();
    expect(signedOutComponent.loggedin).toBeTruthy();
  });

  it('should mark the component signed out when no user is logged in', () => {
    component.signOut();

    expect(component.user).toEqual({
      attributes: {
        status: 'Signed Out',
      },
    });
    expect(component.loggedin).toBeFalsy();
  });

  it('should render the sign-in dialog template', () => {
    const view = component.dialogTemplate.createEmbeddedView({});
    view.detectChanges();

    const text = view.rootNodes
      .map(node => (node as HTMLElement).textContent ?? '')
      .join(' ');

    expect(text).toContain('Name:');
    expect(text).toContain('Password:');
    const form = view.rootNodes.find(
      node => (node as HTMLElement).tagName === 'FORM',
    ) as HTMLFormElement;
    const inputs = Array.from(form.querySelectorAll('input'));
    inputs[0].value = 'templateUser';
    inputs[0].dispatchEvent(new Event('input', { bubbles: true }));
    inputs[1].value = 'templatePassword';
    inputs[1].dispatchEvent(new Event('input', { bubbles: true }));
    view.destroy();
  });
});
