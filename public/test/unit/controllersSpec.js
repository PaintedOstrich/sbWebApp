'use strict';

/* jasmine specs for controllers go here */
describe('SportsBet controllers', function() {

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

  // The fb service mock that does nothing but returning a promise,
  // imitating the api of actual fb service in services.js.
  var mockFb, mockLoadMask;
  beforeEach(inject(function($q){
    mockFb = {
      promises: {}
    }
    mockFb.getLoginStatus = function() {
        mockFb.promises.getLoginStatus = $q.defer();
        return mockFb.promises.getLoginStatus.promise;
    }
    mockFb.api = function() {
        mockFb.promises.api = $q.defer();
        return mockFb.promises.api.promise;
    }

    mockLoadMask = {
      show: jasmine.createSpy('showMask'),
      hide: jasmine.createSpy('hideMask')
    };
  }));

  describe('MainCtrl', function() {
    var scope, ctrl;
    beforeEach(inject(function($rootScope, $controller) {
      scope = $rootScope.$new();
      ctrl = $controller(MainCtrl, {$scope: scope});
    }));
  });

  describe('LandingCtrl', function() {
    var scope, ctrl, mockLocation;

    beforeEach(inject(function($rootScope, $controller) {
      mockLocation = {
        path: jasmine.createSpy('location')
      };

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
      }
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
      mockLocation = {
        path: jasmine.createSpy('location')
      };

      mockCurrentUser = {
        isLoaded: jasmine.createSpy(),

        loadUser : jasmine.createSpy().andReturn({
          then: function() {}
        })
      }
      var mainScope = $rootScope.$new();
      var mainCtrl = $controller(MainCtrl,
          {$scope: mainScope, currentUser: mockCurrentUser});
      scope = mainScope.$new();
      ctrl = $controller(ProfileCtrl,
          {$scope: scope, fb: mockFb, $location: mockLocation,
              loadMask: mockLoadMask, currentUser: mockCurrentUser});
    }));

    it('should set showInfoBackground to true on parent', function() {
      expect(scope.$parent.showInfoBackground).toBe(true);
    });

    it('should have initial active tab', function() {
      expect(scope.currentTab).toEqual('active');
    });
  });
});
