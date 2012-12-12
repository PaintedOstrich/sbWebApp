'use strict';

/* jasmine specs for services go here */

describe('serverApi', function() {
  var mockFb;
  beforeEach(module('serverApi', function($provide) {
    // Override fb service using a mock one.
    $provide.service('fb', function() {
      this.api =  jasmine.createSpy().andReturn({
        then: function() {}
      });
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

  describe('BetAPI', function() {
    var api, $mockHttp;

    beforeEach(inject(function(betAPI, $injector) {
      api = betAPI;
      $mockHttp = $injector.get('$httpBackend');
    }));

    afterEach(function() {
      $mockHttp.verifyNoOutstandingExpectation();
      $mockHttp.verifyNoOutstandingRequest();
    });

    it('should exist', function() {
      expect(api).toBeDefined();
    });


    describe('BetAPI.loadGames', function() {
      it('should be function', function() {
        expect(api.loadGames).toBeFunction();
      });
    });


    describe('BetAPI.placeBet', function() {
      it('should be function', function() {
        expect(api.placeBet).toBeFunction();
      });

      it('should return a resolve a future when request suceed', function() {
        var bet = {};
        $mockHttp.expectPOST(api.url + 'bet', bet).respond({});
        var p = api.placeBet(bet);
        $mockHttp.flush();
      });
    });
  });

  describe('currentUser singleton', function() {
    var user, $mockHttp;
    beforeEach(inject(function(currentUser, $injector) {
      user = currentUser;
      $mockHttp = $injector.get('$httpBackend');
      mockFb = $injector.get('fb');
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


    describe('currentUser.processDataFromFb', function() {
      it('should processDataFromFb', function() {
        var mockResFromFb = {
          "id": "759868917",
          "name": "Peng Di",
          "first_name": "Peng",
          "last_name": "Di",
          "link": "http://www.facebook.com/peng.di2",
          "username": "peng.di2",
          "hometown": {
            "id": "108161842545076",
            "name": "Guiyang"
          },
          "location": {
            "id": "111718848845755",
            "name": "Saint Louis, Missouri"
          },
          "work": [],
          "education": [],
          "gender": "male",
          "timezone": -6,
          "locale": "en_US",
          "languages": [],
          "verified": true,
          "updated_time": "2012-10-27T03:41:13+0000"
        }
        var mockScope = {
          $apply: function() {}
        }

        user.processDataFromFb(mockScope, mockResFromFb);
        expect(user.id).toEqual("759868917");
        expect(user.name).toEqual("Peng Di");
        expect(user.work).toEqual([]);
        expect(user.imgUrl).toBeDefined();
      });

      it('should not allow overriding exiting property on user', function() {
        var mockResFromFb = {
          "id": "759868917",
          "isLoaded": true
        }
        var mockScope = {
          $apply: function() {}
        }

        spyOn(window.console, 'error');
        user.processDataFromFb(mockScope, mockResFromFb);
        expect(window.console.error).toHaveBeenCalled();
      });
    });
  });

});
