import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CollectionService } from "../../../persistence/collection.service";
import { Post } from './post';

@Component({
   selector: 'app-post',
   providers: [CollectionService],
   templateUrl: './post.component.html',
   styleUrls: ['./post.component.scss']
})
export class PostComponent {
   @Input() post!: Post;
   @Input() index!: number;
   @Output() deleted = new EventEmitter();
   @Output() created = new EventEmitter();
   edit = false;
   backupcopy = "";

   constructor(private service: CollectionService) {
      service.setCollection('posts');
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
      this.post = { 'attributes': {} } as Post;
   }
}
