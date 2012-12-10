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
      var mockUser = {}
      scope = $rootScope.$new();
      ctrl = $controller(MainCtrl, {$scope: scope, currentUser: mockUser});
    }));

    it('should have the right number of listeners', function() {
      expect(scope.$$listeners.betInviteCliked).toBeDefined();
      expect(scope.$$listeners.showMultipleBets).toBeDefined();
    });
  });


  describe('BetInviteCtrl', function() {
    var rootScope, scope, ctrl, mockLocation;

    beforeEach(inject(function($rootScope, $controller) {
      rootScope = $rootScope.$new();
      var mockUser = {}
      var mainCtrl = $controller(MainCtrl, {$scope: rootScope, currentUser: mockUser});
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
      afterEach(function () {
        window.$ = undefined;
      });

      it('should be a function', function() {
        expect(scope.checkInitActions).toBeFunction();
      });

      it('should obtain data from dom', function() {
        expect(window.$).toBeUndefined();

        var data = '/?showBet=123'
        var fakeDom = {
          length: 1,
          attr: function() {return data;},
          remove: jasmine.createSpy('remove')
        }
        window.$ = jasmine.createSpy().andReturn(fakeDom);
        spyOn(scope, 'parseInitData').andReturn([]);
        scope.checkInitActions();
        expect(scope.parseInitData).toHaveBeenCalledWith(data);
        expect(fakeDom.remove).toHaveBeenCalled();
      });

      it('should emit the right event with data', function() {
        expect(window.$).toBeUndefined();
        var bet1 = { betId: '123' };
        var bet2 = { betId: '456' };
        scope.user = {
          bets: {
            pendingUserAccept: [bet1, bet2]
          }
        }
        var fakeDom = {
          length: 1,
          attr: function() {return '/?showBet=123,noSuchBet'},
          remove: jasmine.createSpy('remove')
        }
        window.$ = jasmine.createSpy().andReturn(fakeDom);
        spyOn(scope, 'parseInitData').andReturn(['123', '456', 'noSuchBet']);
        spyOn(scope, '$emit');
        scope.checkInitActions();
        expect(scope.$emit).toHaveBeenCalledWith('showMultipleBets', [bet1, bet2]);
      });

      it('should emit no event if data is not correct', function() {
        scope.user = {
          bets: {
            pendingUserAccept: []
          }
        }
        var fakeDom = {
          attr: function() {return '/?showBet=123,noSuchBet'},
          length: 1,
          remove: jasmine.createSpy('remove')
        }
        window.$ = jasmine.createSpy().andReturn(fakeDom);
        spyOn(scope, 'parseInitData').andReturn(['123', 'noSuchBet']);
        spyOn(scope, '$emit');
        scope.checkInitActions();
        expect(scope.$emit).not.toHaveBeenCalled();
      });


      describe('ProfileCtrl.parseInitData', function() {
        it('should parse data and return an array', function() {
          var data = '/?showBet=123';
          var arr = scope.parseInitData(data);
          expect(arr.length).toBe(1);
          expect(arr[0]).toEqual('123');

          data = '/?showBet=23%2C45';
          arr = scope.parseInitData(data);
          expect(arr.length).toBe(2);
          expect(arr[1]).toEqual('45');
        });

        it('should return nothin if no real data passed in', function() {
          var data = '/';
          var arr = scope.parseInitData(data);
          expect(arr.length).toBe(0);

          data = '/?bogus=abc';
          arr = scope.parseInitData(data);
          expect(arr.length).toBe(0);

          data = '/?bogus-abc';
          arr = scope.parseInitData(data);
          expect(arr.length).toBe(0);
        });
      });
    });
  });
});
