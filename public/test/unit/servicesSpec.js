'use strict';

/* jasmine specs for services go here */

describe('services', function() {
  beforeEach(module('services', function($provide) {
    // $provide.value('fb', {
    //   api: jasmine.createSpy()
    // })
  }));

  beforeEach(function() {
      this.addMatchers({
          toBeFunction: function(expected) {
            this.message = function () {
              return "Expected " + this.actual + " to be a function";
            }
            return typeof this.actual == 'function';
          }
      });
  });


  describe('VideoAd', function() {
    var videoAdService;

    beforeEach(inject(function(videoAd, $injector) {
      videoAdService = videoAd;
    }));

    it('should be defined', function() {
      expect(videoAdService).toBeDefined();
    });
  });


  describe('ParentUrlParser', function() {
    var parser;

    beforeEach(inject(function(parentUrlParser, $injector) {
      parser = parentUrlParser;
    }));

    it('should be defined', function() {
      expect(parser).toBeDefined();
    });

    describe('ParentUrlParser.parseUrl', function() {
      it('should be a function', function() {
        expect(parser.parseUrl).toBeFunction();
      });

      it('should do nothing with empty url', function() {
        expect(parser._data).toEqual({});
        parser.parseUrl('/abc');
        expect(parser._data).toEqual({});
        parser.parseUrl('/?');
        expect(parser._data).toEqual({});
        parser.parseUrl('/?abc');
        expect(parser._data).toEqual({});
      });

      it('should get relevant params and value paris', function() {
        expect(parser._data).toEqual({});
        parser.parseUrl('/?a=aVal');
        expect(parser._data).toEqual({a: 'aVal'});

        parser._data = {};
        parser.parseUrl('/?a=aVal&');
        expect(parser._data).toEqual({a: 'aVal'});

        parser._data = {};
        parser.parseUrl('/?a=aVal&b');
        expect(parser._data).toEqual({a: 'aVal'});

        parser._data = {};
        parser.parseUrl('/?a=aVal&b=');
        expect(parser._data).toEqual({a: 'aVal', b: ''});

        parser._data = {};
        parser.parseUrl('/?a=aVal&b=bVal');
        expect(parser._data).toEqual({a: 'aVal', b: 'bVal'});
      });

      it('should parse more realistic examples', function() {
        expect(parser._data).toEqual({});
        parser.parseUrl('/?showBet=1,2,3&fb_source=notification&');
        expect(parser._data).toEqual({showBet: '1,2,3', fb_source:'notification'});
      });
    });
  });
});
