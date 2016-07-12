import {bootstrap} from '@angular/platform-browser-dynamic';
import {HTTP_PROVIDERS} from '@angular/http';
import {Thread} from './cb.threads';
//import {enableProdMode} from "@angular/core";

//enableProdMode();
bootstrap(Thread, [HTTP_PROVIDERS]);
