'use strict';

/* jasmine specs for controllers go here */
describe('SportsBet controllers', function() {

  beforeEach(function() {
      this.addMatchers({
          toBeFunction: function(expected) {
            this.message = function () {
              return "Expected " + this.actual + " to be a function";
            };
            return typeof this.actual == 'function';
          }
      });

      module('services', function($provide) {
      });
  });

  // The fb service mock that does nothing but returning a promise,
  // imitating the api of actual fb service in services.js.
  var mockFb, mockLocation;
  beforeEach(inject(function($q){
    mockLocation = {
      path: jasmine.createSpy('location')
    };

    mockFb = {
      promises: {}
    };
    mockFb.getLoginStatus = function() {
        mockFb.promises.getLoginStatus = $q.defer();
        return mockFb.promises.getLoginStatus.promise;
    };
    mockFb.api = function() {
        mockFb.promises.api = $q.defer();
        return mockFb.promises.api.promise;
    };
  }));

  describe('MainCtrl', function() {
    var scope, ctrl;
    beforeEach(inject(function($rootScope, $controller) {
      var mockUser = {}
      scope = $rootScope.$new();
      ctrl = $controller(MainCtrl,
        {$scope: scope, currentUser: mockUser, $location: mockLocation});
    }));

    it('should have the right number of listeners', function() {
      expect(scope.$$listeners.betInviteCliked).toBeDefined();
      expect(scope.$$listeners.showMultipleBets).toBeDefined();
    });
  });


  describe('BetInviteCtrl', function() {
    var rootScope, scope, ctrl;

    beforeEach(inject(function($rootScope, $controller) {
      rootScope = $rootScope.$new();
      var mockUser = {}
      var mainCtrl = $controller(MainCtrl,
          {$scope: rootScope, currentUser: mockUser, $location: mockLocation});
      scope = rootScope.$new();
      ctrl = $controller(BetInviteCtrl, {$scope: scope});
    }));

    it('should have the right number of listeners', function() {
      expect(scope.$$listeners.showBetInvite).toBeDefined();
    });

    it('should invoke different methods depending on the type of params passed in', function() {
      spyOn(scope, 'showBet');
      spyOn(scope, 'showMultipleBets');
      rootScope.$broadcast('showBetInvite', {});
      expect(scope.showBet).toHaveBeenCalled();
      expect(scope.showMultipleBets).not.toHaveBeenCalled();
    });
  });

  describe('LandingCtrl', function() {
    var scope, ctrl;

    beforeEach(inject(function($rootScope, $controller) {
      var mainScope = $rootScope.$new();
      var mainCtrl = $controller(MainCtrl, {$scope: mainScope});
      scope = mainScope.$new();
      ctrl = $controller(LandingCtrl,
          {$scope: scope, $location: mockLocation, fb: mockFb});
    }));
  });

  describe('RouteCtrl', function() {
    var scope, $ctrl;

    beforeEach(inject(function($rootScope, $controller) {
      scope = $rootScope.$new();
      $ctrl = $controller;
    }));

    it('should redirect to profile', function() {
      var location = {
        path: jasmine.createSpy('location')
      }
      var ctrl = $ctrl(RouteCtrl,
          {$scope: scope, fb: mockFb, $location: location});

      scope.$apply(function() {
        mockFb.promises.getLoginStatus.resolve({status: 'connected'});
      });
      expect(location.path).toHaveBeenCalledWith('/profile');
    });

    it('should redirect to login page', function() {
      var location = {
        path: jasmine.createSpy('location')
      };
      var ctrl = $ctrl(RouteCtrl,
          {$scope: scope, fb: mockFb, $location: location});
      scope.$apply(function() {
        mockFb.promises.getLoginStatus.resolve({status: 'not connected'});
      });
      expect(location.path).toHaveBeenCalledWith('/login');
    });
  });


  describe('ProfileCtrl', function() {
    var scope, ctrl, mockLocation, mockCurrentUser;

    beforeEach(inject(function($rootScope, $controller) {
      mockCurrentUser = {
        isLoaded: jasmine.createSpy(),

        loadUser : jasmine.createSpy().andReturn({
          then: function() {}
        })
      };
      var mainScope = $rootScope.$new();
      var mainCtrl = $controller(MainCtrl,
          {$scope: mainScope, currentUser: mockCurrentUser, $location: mockLocation});
      scope = mainScope.$new();
      ctrl = $controller(ProfileCtrl,
          {$scope: scope, fb: mockFb, $location: mockLocation,
              SwSpinner: {}, currentUser: mockCurrentUser});
    }));

    it('should set showInfoBackground to true on parent', function() {
      expect(scope.$parent.showInfoBackground).toBe(true);
    });

    it('should have initial active tab', function() {
      expect(scope.currentTab).toEqual('active');
    });

    it('should have functions', function() {
      expect(scope.loadUser).toBeFunction();
      expect(scope.loadBetInfo).toBeFunction();
    });


    describe('ProfileCtrl.loadBetFailed', function() {
      it('should be a function', function() {
        expect(scope.loadBetFailed).toBeFunction();
      });
    });


    describe('ProfileCtrl.checkInitActions', function() {
      var realParentUrlParser;

      beforeEach(inject(function(parentUrlParser) {
        realParentUrlParser = parentUrlParser;
      }));

      afterEach(function () {
        window.$ = undefined;
      });

      it('should be a function', function() {
        expect(scope.checkInitActions).toBeFunction();
      });

      it('should emit the right event with data', function() {
        expect(window.$).toBeUndefined();
        var bet1 = { _id: '123' };
        var bet2 = { _id: '456' };
        scope.user = {
          bets: {
            pendingUserAccept: [bet1, bet2]
          }
        };
        spyOn(realParentUrlParser, 'get').andReturn('123%2C456%2CnoSuchBet');
        spyOn(scope, '$emit');
        scope.checkInitActions();
        expect(scope.$emit).toHaveBeenCalledWith('showMultipleBets', [bet1, bet2]);
      });

      it('should emit no event if data is not correct', function() {
        scope.user = {
          bets: {
            pendingUserAccept: []
          }
        };
        spyOn(realParentUrlParser, 'get').andReturn('noSuchBet');
        spyOn(scope, '$emit');
        scope.checkInitActions();
        expect(scope.$emit).not.toHaveBeenCalled();
      });
    });
  });
});
