import {it, describe, expect, beforeEach, inject, beforeEachProviders} from '@angular/core/testing';
import {provide} from '@angular/core';
import {Http, Response, ResponseOptions, XHRBackend, HTTP_PROVIDERS} from '@angular/http';
import {MockBackend, MockConnection} from '@angular/http/testing'
import {Post} from "../cb.posts";
import {CollectionService} from "../cb.services";

describe('Post Tests', () => {
   let postclass:Post

   beforeEachProviders(() => {
      return [
         HTTP_PROVIDERS,
         provide(XHRBackend, {useClass: MockBackend}),
         CollectionService
      ];
   });

   beforeEach(inject([XHRBackend, CollectionService],
      (mockBackend, collectionService) => {
         mockBackend.connections.subscribe((connection: MockConnection) => {
            connection.mockRespond(new Response(
               new ResponseOptions(null)
            ));
         });

      postclass = new Post(collectionService);
      postclass.post = {"attributes": {"body": "Lorem Ipsum"}}
   }));

   it('Edit Post', () => {
      postclass.editPost();
      expect(postclass.edit).toBe(true);
      expect(postclass.backupcopy).toBe('{"attributes":{"body":"Lorem Ipsum"}}');
   });

   it('Cancel Edit', () => {
      postclass.editPost();
      postclass.post.attributes.body = "Test Cancel Edit";
      postclass.cancelEdit();
      expect(postclass.post.attributes.body).toBe("Lorem Ipsum");
   });

   it('Cancel Create', () => {
      postclass.cancelCreate();
      expect(postclass.post.attributes).toEqual({});
   });
});
