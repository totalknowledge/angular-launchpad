import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CollectionService } from "../../../persistence/collection.service";
import { Post } from './post';

import { NgIf, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';

@Component({
   selector: 'app-post',
   providers: [CollectionService],
   imports: [
      NgIf,
      DatePipe,
      FormsModule,
      MatCardModule,
      MatFormFieldModule,
      MatInputModule,
      MatButtonModule,
   ],
   templateUrl: './post.component.html',
   styleUrl: './post.component.scss',
})
export class PostComponent {
   @Input() post!: Post;
   @Input() index!: number;
   @Output() deleted = new EventEmitter();
   @Output() created = new EventEmitter<Post>();
   @Output() canceled = new EventEmitter<void>();
   edit = false;
   backupcopy = "";
   private readonly collection = 'posts';

   constructor(private service: CollectionService) { }

   deletePost() {
      if (confirm("Delete Post?")) {
         this.service.deleteRecord(this.collection, this.post.id)
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
      this.post.attributes = this.post.attributes || {};
      this.post.attributes['editedTS'] = new Date().toISOString();
      this.service.saveRecord(this.collection, this.post.id, this.post)
         .subscribe(() => this.edit = false);
   }

   createPost() {
      this.post.attributes = this.post.attributes || {};
      if (!this.post.attributes['createdTS']) {
         this.post.attributes['createdTS'] = new Date().toISOString();
      }
      this.service.createRecord(this.collection, this.post)
         .subscribe(post => this.created.emit(post));
   }

   cancelCreate() {
      this.post = { 'attributes': {} } as Post;
      this.canceled.emit();
   }
}
