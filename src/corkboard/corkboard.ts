import {bootstrap} from 'angular2/platform/browser';
import {HTTP_PROVIDERS} from 'angular2/http';
import {Thread} from './cb.threads';
//import {enableProdMode} from "angular2/core";

//enableProdMode();
bootstrap(Thread, [HTTP_PROVIDERS]);
