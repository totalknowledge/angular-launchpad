import {it, describe, expect, beforeEach, inject} from '@angular/core/testing';
import {TitleCase} from "../cb.pipes";

describe('TitleCase Tests', () => {
    let pipe:TitleCase;

    beforeEach(() => {
        pipe = new TitleCase();
    });

    it('Should capitalize all words in a string', () => {
        var result = pipe.transform('a room with a view', null);
        expect(result).toEqual('A Room With a View');
    });
});

// describe('TitleCase Tests', () => {
//     it('Test One', () => {
//       it('true is true', function(){expect("true").toEqual(true)});
//       it('is true', function(){expect(true).toEqual(true)});
//     });
//
//     it('Test Two', () => {
//       it('true is true', function(){expect(true).toEqual(true)});
//       it('is true', function(){expect(true).toEqual(true)});
//     });
// });
