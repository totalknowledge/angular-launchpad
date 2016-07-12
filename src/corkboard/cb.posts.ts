
import {Component, Input, Output, EventEmitter} from '@angular/core';
import {CollectionService} from "./cb.services";
import {TitleCase} from "./cb.pipes";

@Component({
   selector: 'cb-post',
   pipes: [TitleCase],
   templateUrl: '/app/corkboard/partials/post.html',
   styleUrls: ['app/corkboard/css/post.css']
})
export class Post {
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
         this.service.deleteRecord("posts", this.post.id)
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
      this.service.saveRecord("posts", this.post.id, this.post)
         .subscribe(() => this.edit = false);
   }
   createPost() {
      this.service.createRecord("posts", this.post)
         .subscribe(() => this.created.emit("created"));
   }
   cancelCreate() {
      this.post = {"attributes":{}};
   }
}
