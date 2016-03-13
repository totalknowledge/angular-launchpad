import {it, describe, expect, beforeEach, inject} from 'angular2/testing';
import {AppComponent} from "../app.component";

describe('Main Tests', () => {
    let main:AppComponent;

    beforeEach(() => {
        main = new AppComponent()
    });

    it('Main Component Test', () => {
        var result = main.appnumber;
        expect(main.appnumber).toEqual('First');
    });
});
