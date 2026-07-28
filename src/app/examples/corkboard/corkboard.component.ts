import { Component, ViewEncapsulation } from '@angular/core';
import { CollectionService } from "../../persistence/collection.service";
import { ForumComponent } from './forum/forum';

@Component({
   selector: 'app-corkboard',
   providers: [CollectionService],
   imports: [ForumComponent],
   templateUrl: './corkboard.component.html',
   styleUrls: ['./corkboard.component.scss'],
   encapsulation: ViewEncapsulation.None
})
export class CorkboardComponent {

   constructor() { }
}
