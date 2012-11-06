'use strict';

/* jasmine specs for controllers go here */
describe('SportsBet controllers', function() {

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

    it('should have initial variables', function() {
      expect(scope.activeTab).toBe(-1);
    });

    describe('setActiveTab', function() {
      it('should be able to set active tab by passing number index', function() {
        scope.setActiveTab(2);
        expect(scope.activeTab).toBe(2);
      });

      it('should be able to set tab by passing name', function() {
        // Override tabNameMap for testing.
        scope.tabNames = ['home', 'profile', 'betpage'];
        scope.setActiveTab('betpage');
        expect(scope.activeTab).toBe(2);
      });
    });
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

    it('should hide nav on initiation but show it before exiting', function() {
      expect(scope.$parent.hideNavBar).toBe(true);
      scope.$destroy();
      expect(scope.$parent.hideNavBar).toBe(false);
    });
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
      var mainCtrl = $controller(MainCtrl, {$scope: mainScope});
      scope = mainScope.$new();
      ctrl = $controller(ProfileCtrl,
          {$scope: scope, fb: mockFb, $location: mockLocation,
              loadMask: mockLoadMask, currentUser: mockCurrentUser});
    }));

    it('should set user obj if fb.api request succeed', function() {
    });
  });
});
