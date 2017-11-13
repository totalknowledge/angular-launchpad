import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';

import { HttpModule }   from '@angular/http';
import { FormsModule }   from '@angular/forms';

import { AppComponent } from './app.component';
import { MainPageComponent } from './main-page/main-page.component';
import { MainAdminPageComponent } from './main-admin-page/main-admin-page.component';
import { CorkboardComponent } from './examples/corkboard/corkboard.component';
import { ThreadComponent } from './examples/corkboard/thread/thread.component';
import { PostComponent } from './examples/corkboard/post/post.component';

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
    PostComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    MatToolbarModule,
    MatButtonModule,
    MatMenuModule,
    HttpModule,
    FormsModule,
    RouterModule.forRoot(
      appRoutes,
      { enableTracing: false } // <-- debugging purposes only
    )
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
