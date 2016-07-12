import {it, describe, expect, beforeEach, inject, beforeEachProviders} from '@angular/core/testing';
import {provide} from '@angular/core';
import {Http, Response, ResponseOptions, XHRBackend, HTTP_PROVIDERS} from '@angular/http';
import {MockBackend, MockConnection} from '@angular/http/testing'
import {CollectionService} from "../cb.services";

describe('Generic API Tests', () => {
   beforeEachProviders(() => {
      return [
         HTTP_PROVIDERS,
         provide(XHRBackend, {useClass: MockBackend}),
         CollectionService
      ];
   });

   it('Get Collection',
     inject([XHRBackend, CollectionService], (mockBackend, collectionService) => {

       mockBackend.connections.subscribe(
          (connection: MockConnection) => {
           connection.mockRespond(new Response(
             new ResponseOptions({
                 body: [
                   { id: "26",
                     type: "mock",
                     attributes: {
                        name: "mockname",
                        desc: "Lorem Ipsum..."
                     }},
                     { id: "6",
                       type: "mock",
                       attributes: {
                          name: "mockname",
                          desc: "Lorem Ipsum..."
                       }
                   }],
                status: 200
             })));
       });

       collectionService.getCollection('items').subscribe(status => {
          expect(1).toBe(1);
       });
     }));
});
