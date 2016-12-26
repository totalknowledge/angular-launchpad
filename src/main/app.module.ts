import { NgModule }       from '@angular/core';
import { BrowserModule }  from '@angular/platform-browser';
import { FormsModule }    from '@angular/forms';
import { MaterialModule } from '@angular/material';

import { AppComponent }   from './app.component';
import { PackageControler }        from '../invoice/pkg.mod';

import 'hammerjs/hammer';

@NgModule({
  imports: [
    BrowserModule,
    FormsModule,
    MaterialModule.forRoot()
  ],
  declarations: [
    AppComponent,
    PackageControler
  ],
  bootstrap: [ AppComponent ]
})
export class AppModule { }
