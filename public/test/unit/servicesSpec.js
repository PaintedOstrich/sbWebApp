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
});
