import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ServiceWorkerModule } from '@angular/service-worker';
import { environment } from '../environments/environment';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTableModule } from '@angular/material/table';
import { MatSortModule } from '@angular/material/sort';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSelectModule } from '@angular/material/select';

import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

import { AppComponent } from './app.component';
import { MainPageComponent } from './main-page/main-page.component';
import { MainAdminPageComponent } from './main-admin-page/main-admin-page.component';
import { CorkboardComponent } from './examples/corkboard/corkboard.component';
import { ThreadComponent } from './examples/corkboard/thread/thread.component';
import { PostComponent } from './examples/corkboard/post/post.component';
import { DialogComponent } from './examples/dialog/dialog.component';

const appRoutes: Routes = [
    { path: 'examples/corkboard', component: CorkboardComponent },
    { path: 'admin', component: MainAdminPageComponent },
    { path: '', component: MainPageComponent }
];

@NgModule({
    declarations: [
        AppComponent,
        MainPageComponent,
        MainAdminPageComponent,
        CorkboardComponent,
        ThreadComponent,
        PostComponent,
        DialogComponent
    ],
    imports: [
        BrowserModule,
        BrowserAnimationsModule,
        MatToolbarModule,
        MatButtonModule,
        MatMenuModule,
        MatTabsModule,
        MatTableModule,
        MatSortModule,
        MatPaginatorModule,
        MatCardModule,
        MatFormFieldModule,
        MatInputModule,
        MatDialogModule,
        MatSelectModule,
        HttpClientModule,
        FormsModule,
        RouterModule.forRoot(appRoutes, { enableTracing: false } // <-- debugging purposes only
            // <-- debugging purposes only
            // <-- debugging purposes only
        ),
        environment.production
            ? ServiceWorkerModule.register('/ngsw-worker.js')
            : []
    ],
    bootstrap: [AppComponent]
})
export class AppModule { }
