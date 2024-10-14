import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MainAdminPageComponent, createNewUser } from './main-admin-page.component';
import { HttpClient, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MatTabsModule } from '@angular/material/tabs';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { CollectionService } from '../persistence/collection.service';
import { AuthService } from '../persistence/auth.service';
import { of } from 'rxjs';

describe('MainAdminPageComponent', () => {
  let component: MainAdminPageComponent;
  let fixture: ComponentFixture<MainAdminPageComponent>;
  const auth: Partial<AuthService> = {
    hasPermission: jest.fn()
  };
  const service: Partial<CollectionService> = {
    createRecord: jest.fn().mockReturnValue(of({ id: '1', attributes: [] })),
    getCollection: jest.fn().mockReturnValue(of([{ id: '1' }])),
    getRecord: jest.fn().mockReturnValue(of({ id: '1', attributes: [{ read: true, create: true, values: [] }] })),
    setCollection: jest.fn().mockReturnValue(of(true)),
    patchRecord: jest.fn().mockReturnValue(of(null))
  };

  beforeEach(async () => {
    TestBed.configureTestingModule({
    declarations: [
        MainAdminPageComponent
    ],
    imports: [MatCardModule,
        MatFormFieldModule,
        MatInputModule,
        MatPaginatorModule,
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
    jest.spyOn(auth, 'hasPermission').mockReturnValue(true);
    component.ngOnInit();
    expect(component.users.length).toEqual(1);
    expect(component.displayedColumns).toEqual([]);
    expect(component.editableColumns).toEqual([]);
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
