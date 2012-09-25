'use strict';

/* jasmine specs for controllers go here */
describe('SportsBet controllers', function() {

  beforeEach(function(){});

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
          {$scope: scope, loggedIn: true, $location: location});
      expect(location.path).toHaveBeenCalledWith('/profile');
    });

    it('should redirect to profile', function() {
      var location = {
        path: jasmine.createSpy('location')
      }
      var ctrl = $ctrl(RouteCtrl,
          {$scope: scope, loggedIn: false, $location: location});
      expect(location.path).toHaveBeenCalledWith('/login');
    });
  });
});
