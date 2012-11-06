'use strict';

/* jasmine specs for services go here */

describe('serverApi', function() {
  beforeEach(module('serverApi', function($provide) {
    // Override fb service using a mock one.
    $provide.service('fb', function() {
      
    });
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

  describe('User singleton', function() {
    var user, $mockHttp;
    beforeEach(inject(function(currentUser, $injector) {
      user = currentUser;
      $mockHttp = $injector.get('$httpBackend');
    }));

    afterEach(function() {
      $mockHttp.verifyNoOutstandingExpectation();
      $mockHttp.verifyNoOutstandingRequest();
    });

    it('should exist', function() {
      expect(user).toBeDefined();
    });

    it('should not be loaded at first', function() {
      expect(user.isLoaded()).toBe(false);
    });
  });
  
});
