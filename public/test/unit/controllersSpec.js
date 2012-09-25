'use strict';

/* jasmine specs for controllers go here */
describe('SportsBet controllers', function() {

  var mockFb;
  beforeEach(inject(function($q){
    mockFb = {
      promises: {}
    }
    mockFb.getLoginStatus = function() {
        mockFb.promises.getLoginStatus = $q.defer();
        return mockFb.promises.getLoginStatus.promise;
    }
  }));

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
        mockFb.promises.getLoginStatus.resolve('uid', 'token');
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
        mockFb.promises.getLoginStatus.reject('not logged in');
      });
      expect(location.path).toHaveBeenCalledWith('/login');
    });
  });
});
