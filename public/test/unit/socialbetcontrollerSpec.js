describe('SocialBetCtrl', function() {
  var scope, ctrl, mockFb, mockLoadMask, mockQ, mockUser;

  beforeEach(function() {
      this.addMatchers({
          toBeFunction: function(expected) {
            this.message = function () {
              return "Expected " + this.actual + " to be a function";
            }
            return typeof this.actual == 'function';
          },
          toHaveWatcher: function(name) {
            var watchers = this.actual.$$watchers;
            if (!watchers || watchers.length == 0) {
              this.message = function () {
                return "Passed in object/scope has no watcher at all";
               }
               return false;
            }

            var found = false;
            for (var i = 0; i < watchers.length; i++) {
             if (watchers[i].exp == name) {
               found = true;
               break;
             }
            }

            this.message = function () {
              return "Passed in object/scope has no watcher on " + name;
             }
             return found;
          }
      });
  });

  beforeEach(inject(function($rootScope, $controller, $q) {
    mockLoadMask = {
      show: jasmine.createSpy('showMask'),
      hide: jasmine.createSpy('hideMask')
    };

    mockBetAPI = {
      loadGames: jasmine.createSpy()
    }
    mockFb = {
      api: jasmine.createSpy()
    }
    mockQ = {
      all: jasmine.createSpy().andReturn({then: function() {}})
    }
    mockUser = {
      isLoaded: jasmine.createSpy().andReturn(true)
    };
    scope = $rootScope.$new();

    var mainScope = $rootScope.$new();
    var mainCtrl = $controller(MainCtrl, {$scope: mainScope, currentUser: mockUser});
    scope = mainScope.$new();
    ctrl = $controller(SocialBetCtrl,
        {$scope: scope, fb: mockFb, loadMask: mockLoadMask,
          betAPI: mockBetAPI, $q: mockQ, $timeout: undefined, currentUser: mockUser});
  }));

  it('should set showInfoBackground to true on parent', function() {
    expect(scope.$parent.showInfoBackground).toBe(true);
  });

  it('should have currentPage set to 0 and pages array', function() {
    expect(scope.pages).toBeDefined();
    expect(scope.currentPage).toBe(0);
  });

  it('should have watchers', function() {
    var watchers = scope.$$watchers;
    expect(watchers.length).toBe(3);
    expect(scope).toHaveWatcher('currentPage');
    expect(scope).toHaveWatcher('friendFilter');
    expect(scope).toHaveWatcher('selectedFriends.length');
  });


  describe('SocialBetCtrl.loadData', function() {
    it('should be function', function() {
      expect(typeof scope.loadData).toEqual('function');
    });

    it('should call services to load data', function() {
      expect(mockBetAPI.loadGames).toHaveBeenCalled();
      expect(mockFb.api).toHaveBeenCalled();
      expect(mockQ.all).toHaveBeenCalled();
    });
  });


  describe('SocialBetCtrl.processData', function() {
    it('should be function', function() {
      expect(typeof scope.processData).toEqual('function');
    });
  });


  describe('SocialBetCtrl.processFriendsData', function() {
    it('parse friend array into map=> id: obj', function() {
      var f1 = {id: '123'};
      var f2 = {id: '456'};
      var friends = {data:[f1, f2]};
      expect(scope.allFriends).toEqual([]);

      scope.processFriendsData(friends);
      expect(scope.allFriends).toEqual([f1, f2]);
    });
  });


  describe('SocialBetCtrl.processGameData', function() {
    var mockData, game1, game2;
    beforeEach(function() {
      game1 = {
        date: '2012-10-28 20:30:00',
        id: '1234'
      };
      game2 = {
        date: '2011-10-28 20:30:00',
        id: '5678'
      };
      mockData = [game1, game2];
    });

    it('should be function', function() {
      expect(typeof scope.processGameData).toEqual('function');
    });

    it('should process raw resource objects passed in', function() {
      expect(scope.games).toEqual([]);
      scope.processGameData(mockData);
      expect(scope.games).toEqual(mockData);
      expect(mockData[0].date instanceof Date).toBe(true);
    });
  });


  describe('SocialBetCtrl.initBet', function() {
    it('should be a function', function() {
      expect(typeof scope.initBet).toEqual('function');
    });

    it('should init bet', function() {
      expect(scope.bet).toBeUndefined();
      scope.initBet({}, 1);
      expect(scope.bet).toBeDefined()
    });
  });
});

