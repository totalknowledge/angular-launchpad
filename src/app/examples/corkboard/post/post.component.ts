import { Component, Input, Output, EventEmitter, ViewEncapsulation } from '@angular/core';
import { CollectionService } from "../service.service";

@Component({
   selector: 'app-post',
   providers: [CollectionService],
   templateUrl: './post.component.html',
   styleUrls: ['./post.component.scss'],
   encapsulation: ViewEncapsulation.None
})
export class PostComponent {
   @Input() post;
   @Input() index;
   @Output() deleted = new EventEmitter();
   @Output() created = new EventEmitter();
   service:CollectionService;
   edit = false;
   backupcopy = "";

   constructor(service:CollectionService) {
      this.service = service;
   }
   deletePost() {
      if (confirm("Delete Post?")) {
         this.service.deleteRecord(this.post.id)
            .subscribe(() => this.deleted.emit("deleted"));
      }
   }
   editPost() {
      this.backupcopy = JSON.stringify(this.post);
      this.edit = true;
   }
   cancelEdit() {
      this.post = JSON.parse(this.backupcopy);
      this.backupcopy = "";
      this.edit = false;
   }
   savePost() {
      this.service.saveRecord(this.post.id, this.post)
         .subscribe(() => this.edit = false);
   }
   createPost() {
      this.service.createRecord(this.post)
         .subscribe(() => this.created.emit("created"));
   }
   cancelCreate() {
      this.post = {"attributes":{}};
   }
}
