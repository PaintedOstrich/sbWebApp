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
    var scope, ctrl, mockLocation;

    beforeEach(inject(function($rootScope, $controller) {
      mockLocation = {
        path: jasmine.createSpy('location')
      };

      scope = $rootScope.$new();
      ctrl = $controller(ProfileCtrl,
          {$scope: scope, fb: mockFb, $location: mockLocation,
              loadMask: mockLoadMask});
    }));

    it('should set user obj if fb.api request succeed', function() {
      expect(scope.user).toEqual({});
      var mockUser = {username: 'abc', id: 123};
      scope.$apply(function() {
        mockFb.promises.api.resolve(mockUser);
      });
      expect(scope.user).toBe(mockUser);
      expect(scope.imgUrl).toBeDefined();
    });
  });


  describe('SocialBetCtrl', function() {
    var scope, ctrl;

    beforeEach(inject(function($rootScope, $controller) {
      scope = $rootScope.$new();
      ctrl = $controller(SocialBetCtrl,
          {$scope: scope, fb: mockFb, loadMask: mockLoadMask});
    }));

    it('should have variables initialized and functions called' , function() {
      expect(scope.selectedFriends).toEqual([]);
      expect(scope.allFriends).toEqual({});
      expect(scope.events).toBeDefined();
      expect(scope.panels.length > 0).toBe(true);
      expect(scope.currentPanel).toEqual(scope.panels[0]);
      expect(scope.betPlaced).toBe(false);
    });

    it('should update selected event', function() {
      var eventA = {name: 'e1'};
      var eventB = {name: 'e2'};
      expect(scope.selectedEvent).toBeUndefined();

      scope.eventSelected(eventA);
      expect(scope.selectedEvent).toBe(eventA);

      scope.eventSelected(eventB);
      expect(scope.selectedEvent).toBe(eventB);
    });

    it('should show/hide next btn on friends panel', function() {
      expect(scope.validateFriendsPanel()).toBe(false);

      scope.selectedFriends = [{}, {}];
      expect(scope.validateFriendsPanel()).toBe(true);
    });

    it('should navigate between panels', function() {
      var panelsCount = scope.panels;
      expect(panelsCount) > 0;
      expect(scope.currentPanel).toBe(scope.panels[0]);

      scope.nextPanel();
      expect(scope.currentPanel).toBe(scope.panels[1]);

      scope.prevPanel();
      expect(scope.currentPanel).toBe(scope.panels[0]);
    });

    it('should allow selecting event', function() {
      var myEvent = {};
      spyOn(scope, 'nextPanel');
      scope.eventSelected(myEvent);
      expect(scope.selectedEvent).toBe(myEvent);
      expect(scope.nextPanel).toHaveBeenCalled();
    });

    it('should be able to place a bet on a team', function() {
      scope.selectedFriends = [{name: 'a'}, {name: 'b'}];
      var mockTeam = {};
      expect(scope.betPlaced).toBe(false);
      scope.betOnTeam(mockTeam);
      expect(scope.betPlaced).toBe(true);
      expect(scope.currentBet.winner).toBe(mockTeam);
      expect(scope.currentBet.bets.length).toBe(scope.selectedFriends.length);
      expect(scope.currentBet.bets[0].friend).toBe(scope.selectedFriends[0]);
      expect(scope.currentBet.bets[0].amount).toBe(0);
    });
  });
});
