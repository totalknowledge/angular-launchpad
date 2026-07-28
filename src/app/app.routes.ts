import { Routes } from '@angular/router';

import { MainPageComponent } from './main-page/main-page.component';
import { MainAdminPageComponent } from './main-admin-page/main-admin-page.component';
import { CorkboardComponent } from './examples/corkboard/corkboard.component';
import { ThreadComponent } from './examples/corkboard/thread/thread.component';

export const routes: Routes = [
    { path: 'examples/corkboard/thread/:id', component: ThreadComponent },
    { path: 'examples/corkboard', component: CorkboardComponent },
    { path: 'admin', component: MainAdminPageComponent },
    { path: '', component: MainPageComponent },
];