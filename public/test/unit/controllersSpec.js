'use strict';

/* jasmine specs for controllers go here */
describe('SportsBet controllers', function() {

  beforeEach(function(){});
  
  describe('RouteCtrl', function() {
    var scope, ctrl;

    beforeEach(inject(function($rootScope, $controller) {
      scope = $rootScope.$new();
      ctrl = $controller(RouteCtrl, {$scope: scope, loggedIn: true});
    }));
    
    it('should pass', function() {
      expect(ctrl).toBeDefined();
    })
  });
});
