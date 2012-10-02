'use strict';

/* jasmine specs for controllers go here */
describe('SportsBet controllers', function() {

  // The fb service mock that does nothing but returning a promise,
  // imitating the api of actual fb service in services.js.
  var mockFb;
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
      }
      scope = $rootScope.$new();
      ctrl = $controller(ProfileCtrl,
          {$scope: scope, fb: mockFb, $location: mockLocation});
    }));

    it('should set user obj if fb.api request succeed', function() {
      expect(scope.user).toEqual({});
      scope.$apply(function() {
        mockFb.promises.api.resolve({username: 'abc'});
      });
      expect(scope.user).toEqual({username: 'abc'});
    });
  });


  describe('SocialBetCtrl', function() {
    var scope, ctrl;

    beforeEach(inject(function($rootScope, $controller) {
      scope = $rootScope.$new();
      ctrl = $controller(SocialBetCtrl,
          {$scope: scope});
    }));

    it('should add friend', function() {
      expect(scope.selectedFriends.length).toBe(0);
      scope.addFriend();
      expect(scope.selectedFriends.length).toBe(1);
    });

    it('should remove friend', function() {
      var oldArr = ['a', 'b', 'c'];
      var newArr = ['a', 'c'];
      scope.selectedFriends = oldArr;
      scope.removeFriend(1);
      expect(scope.selectedFriends).toEqual(newArr);

      oldArr = [];
      scope.selectedFriends = oldArr;
      scope.removeFriend(1);
      expect(scope.selectedFriends).toEqual([]);

      var oldArr = ['a', 'b'];
      var newArr = ['a', 'b'];
      scope.selectedFriends = oldArr;
      scope.removeFriend(-5);
      expect(scope.selectedFriends).toEqual(newArr);
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
      expect(scope.validateFriendsPanel()).toBe(false);

      scope.selectedFriends[0].name = 'Di Peng';
      expect(scope.validateFriendsPanel()).toBe(false);
      scope.selectedFriends[1].name = 'Parker';
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
  });
});
