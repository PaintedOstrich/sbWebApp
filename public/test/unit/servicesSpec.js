'use strict';

/* jasmine specs for services go here */

describe('service', function() {
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

  describe('User singleton', function() {
    var user, $mockHttp;
    beforeEach(inject(function(User, $injector) {
      user = User;
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

    describe('User.loadUser', function() {
      beforeEach(function() {
        $mockHttp.when('GET', user.getAPIUrl()).respond({
          id: '123',
          name: 'Di Peng',
          firstName: 'Di',
          lastName: 'Peng',
          balance: 77
        });
      });

      it('should be function', function() {
        expect(user.loadUser).toBeFunction();
      });

      it('should load user from backend', function() {
        user.loadUser();
        $mockHttp.flush();
        expect(user.isLoaded()).toBe(true);
      });

      it('should have all relevant getters and setters', function() {
         user.loadUser();
         $mockHttp.flush();
         expect(user.setName).toBeFunction();
         expect(user.getName).toBeFunction();
         expect(user.setId).toBeFunction();
         expect(user.getId).toBeFunction();
         expect(user.getBalance).toBeFunction();
         expect(user.setBalance).toBeFunction();

         expect(user.getName()).toEqual('Di Peng');
         user.setName('abc')
         expect(user.getName()).toEqual('abc');

         expect(user.getBalance()).toBe(77);
         user.setBalance(88);
         expect(user.getBalance()).toBe(88);
      });
    });
  });
});
