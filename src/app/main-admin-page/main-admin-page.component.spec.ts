import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CommonModule } from '@angular/common';

import { MainAdminPageComponent, createNewUser } from './main-admin-page.component';
import { HttpClient, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MatTabsModule } from '@angular/material/tabs';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { FormsModule } from '@angular/forms';
import { CollectionService } from '../persistence/collection.service';
import { AuthService, User } from '../persistence/auth.service';
import { of } from 'rxjs';
import { MatTableDataSource } from '@angular/material/table';

describe('MainAdminPageComponent', () => {
  let component: MainAdminPageComponent;
  let fixture: ComponentFixture<MainAdminPageComponent>;
  const auth: Partial<AuthService> = {
    hasPermission: vi.fn()
  };
  const service: Partial<CollectionService> = {
    createRecord: vi.fn().mockReturnValue(of({ id: '1', attributes: [] })),
    getCollection: vi.fn().mockReturnValue(of([{ id: '1' }])),
    getRecord: vi.fn().mockReturnValue(of({ id: '1', attributes: [{ read: true, create: true, values: [] }] })),
    patchRecord: vi.fn().mockReturnValue(of(null))
  };
  const renderUser = {
    id: '1',
    attributes: {
      firstName: 'Bryan',
      lastLogin: new Date('2024-01-02T00:00:00Z')
    }
  } as User;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    imports: [
        MainAdminPageComponent,
        CommonModule,
        FormsModule,
        MatButtonModule,
        MatCardModule,
        MatFormFieldModule,
        MatInputModule,
        MatPaginatorModule,
        MatSelectModule,
        MatSortModule,
        MatTableModule,
        MatTabsModule,
        NoopAnimationsModule],
    providers: [
        HttpClient,
        { provide: AuthService, useValue: auth },
        { provide: CollectionService, useValue: service },
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting()
    ]
}).compileComponents();

    fixture = TestBed.createComponent(MainAdminPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('ngOnInit should get collection and schema', () => {
    vi.spyOn(auth, 'hasPermission').mockReturnValue(true);
    component.ngOnInit();
    expect(component.users.length).toEqual(1);
    expect(component.displayedColumns).toEqual([]);
    expect(component.editableColumns).toEqual([]);
  });

  it('should render table cells for id, date, and default attribute columns', () => {
    const user = {
      id: '1',
      attributes: {
        firstName: 'Bryan',
        lastLogin: new Date('2024-01-02T00:00:00Z')
      }
    } as User;
    component.displayedColumns = ['id', 'lastLogin', 'firstName'];
    component.fieldLabel = {
      id: 'User ID',
      lastLogin: 'Last Login',
      firstName: 'First Name'
    };
    component.users = [user];
    component.user = user;
    component.dataSource = new MatTableDataSource(component.users);
    fixture.detectChanges();

    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(text).toContain('User ID');
    expect(text).toContain('Last Login');
    expect(text).toContain('First Name');
    expect(text).toContain('Bryan');
  });

  it('should render editable select and input fields for a new user', () => {
    component.user = {
      attributes: {
        permission: 'user',
        firstName: 'Bryan'
      }
    } as User;
    component.editableColumns = ['permission', 'firstName'];
    component.fieldType = {
      permission: 'select',
      firstName: 'text'
    };
    component.fieldLabel = {
      permission: 'Permission',
      firstName: 'First Name'
    };
    component.fieldSelections = {
      permission: ['user', 'admin']
    };
    fixture.detectChanges();

    const root = fixture.nativeElement as HTMLElement;
    expect(root.querySelector('mat-select')).toBeTruthy();
    const firstNameInput = root.querySelector('input[placeholder="First Name"]') as HTMLInputElement;
    expect(firstNameInput).toBeTruthy();
    firstNameInput.value = 'Updated';
    firstNameInput.dispatchEvent(new Event('input'));
    expect(component.user.attributes.firstName).toBe('Updated');
    expect(root.textContent).toContain('Create');
  });

  it('ngOnInit should skip columns when schema permissions are denied', () => {
    vi.mocked(service.getCollection).mockReturnValueOnce(of([]));
    vi.mocked(service.getRecord).mockReturnValueOnce(of({
      id: 'schema',
      read: true,
      create: true,
      attributes: {
        secret: {
          order: 0,
          read: false,
          create: false,
          label: 'Secret',
          type: 'text'
        }
      }
    }));
    vi.spyOn(auth, 'hasPermission').mockReturnValue(false);

    component.ngOnInit();

    expect(component.displayedColumns).toEqual([]);
    expect(component.editableColumns).toEqual([]);
    expect(component.fieldSelections['secret']).toBeUndefined();
  });

  it('should render display actions for an existing user', () => {
    component.user = {
      id: '1',
      attributes: {
        firstName: 'Bryan'
      }
    } as User;
    component.dataSource = new MatTableDataSource([renderUser]);
    component.edit = false;
    component.displayedColumns = ['id', 'firstName'];
    component.fieldLabel = {
      id: 'User ID',
      firstName: 'First Name'
    };
    fixture.detectChanges();

    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(text).toContain('User ID: 1');
    expect(text).toContain('First Name: Bryan');
    expect(text).toContain('Edit');
    expect(text).toContain('Reset password');
    expect(text).toContain('Clear');
  });

  it('should render save and cancel actions while editing', () => {
    component.user = {
      id: '1',
      attributes: {
        firstName: 'Bryan'
      }
    } as User;
    component.edit = true;
    component.editableColumns = ['firstName'];
    component.fieldType = { firstName: 'text' };
    component.fieldLabel = { firstName: 'First Name' };
    fixture.detectChanges();

    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(text).toContain('Save');
    expect(text).toContain('Cancel');
  });

  it('should invoke display action buttons from the template', () => {
    component.user = {
      id: '1',
      attributes: {
        firstName: 'Bryan'
      }
    } as User;
    component.dataSource = new MatTableDataSource([renderUser]);
    component.edit = false;
    component.displayedColumns = ['id', 'firstName'];
    component.fieldLabel = {
      id: 'User ID',
      firstName: 'First Name'
    };
    fixture.detectChanges();

    const buttons = Array.from((fixture.nativeElement as HTMLElement).querySelectorAll('button'));
    buttons.find(button => button.textContent?.includes('Reset password'))?.click();
    buttons.find(button => button.textContent?.includes('Clear'))?.click();

    expect(service.patchRecord).toHaveBeenCalled();
    expect(component.user).toEqual(createNewUser());
  });

  it('should invoke create, edit, save, and cancel buttons from the template', () => {
    component.user = { attributes: { firstName: 'Bryan' } } as User;
    component.dataSource = new MatTableDataSource([renderUser]);
    component.editableColumns = ['firstName'];
    component.fieldType = { firstName: 'text' };
    component.fieldLabel = { firstName: 'First Name' };
    fixture.detectChanges();

    let buttons = Array.from((fixture.nativeElement as HTMLElement).querySelectorAll('button'));
    buttons.find(button => button.textContent?.includes('Create'))?.click();
    expect(service.createRecord).toHaveBeenCalled();

    component.user = { id: '1', attributes: { firstName: 'Bryan' } } as User;
    component.dataSource = new MatTableDataSource([renderUser]);
    component.edit = false;
    component.displayedColumns = ['id', 'firstName'];
    component.fieldLabel = { id: 'User ID', firstName: 'First Name' };
    fixture.detectChanges();

    buttons = Array.from((fixture.nativeElement as HTMLElement).querySelectorAll('button'));
    buttons.find(button => button.textContent?.trim() === 'Edit')?.click();
    expect(component.edit).toBeTruthy();

    fixture.detectChanges();
    buttons = Array.from((fixture.nativeElement as HTMLElement).querySelectorAll('button'));
    buttons.find(button => button.textContent?.includes('Save'))?.click();
    expect(service.patchRecord).toHaveBeenCalled();

    component.user = { id: '1', attributes: { firstName: 'Bryan' } } as User;
    component.backupcopy = JSON.stringify(component.user);
    component.edit = true;
    fixture.detectChanges();

    buttons = Array.from((fixture.nativeElement as HTMLElement).querySelectorAll('button'));
    buttons.find(button => button.textContent?.includes('Cancel'))?.click();
    expect(component.edit).toBeFalsy();
  });

  it('applyFilter should filter paramter', () => {
    const teststring = 'FDdfe ';
    const expectedString = 'fddfe';
    component.applyFilter(teststring);
    expect(component.dataSource.filter).toEqual(expectedString);
  });

  it('populateUser should populate user', () => {
    const user = createNewUser();
    component.populateUser(user);
    expect(component.user).toEqual(user);
  });

  it('editUser should backup user and set to edit', () => {
    component.user = createNewUser();
    component.user.id = '1';
    component.editUser();
    expect(component.backupcopy).toEqual(JSON.stringify(component.user));
    expect(component.edit).toBeTruthy();
  });

  it('editUser should backup user and set to edit', () => {
    component.user = createNewUser();
    component.user.id = '1';
    component.editUser();
    component.user.attributes = { test: 'test' };
    component.cancelEdit();
    expect(component.backupcopy).toEqual(JSON.stringify(component.user));
    expect(component.edit).toBeFalsy();
  });

  it('clearUser should clear user and reset', () => {
    const user = createNewUser();
    component.clearUser();
    expect(component.user).toEqual(user);
  });

  it('patchUser should patch user', () => {
    component.user = createNewUser();
    component.user.id = '1';
    component.edit = true;
    component.patchUser();
    expect(service.patchRecord).toHaveBeenCalled();
    expect(component.edit).toBeFalsy();
  });

  it('resetpassword should change users password', () => {
    component.user = createNewUser();
    component.user.id = '1';
    component.resetpassword();
    expect(service.patchRecord).toHaveBeenCalled();
    expect(component.edit).toBeFalsy();
  });

  it('createUser should create user', () => {
    component.user = createNewUser();
    component.user.id = '1';
    component.createUser();
    expect(service.createRecord).toHaveBeenCalled();
    expect(component.user).toBeTruthy();
  });
});
