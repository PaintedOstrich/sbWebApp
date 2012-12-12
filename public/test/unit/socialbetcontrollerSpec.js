describe('SocialBetCtrl', function() {
  var scope, ctrl, mockFb, mockLoadMask, mockQ, mockUser, mockVideoAd;

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
      loadGames: jasmine.createSpy('loadGames'),
      placeBet: jasmine.createSpy('placeBet').andReturn({then: function() {}})
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
    mockVideoAd = {
      showAd: jasmine.createSpy('showAd')
    };
    scope = $rootScope.$new();

    var mainScope = $rootScope.$new();
    var mainCtrl = $controller(MainCtrl, {$scope: mainScope, currentUser: mockUser});
    scope = mainScope.$new();
    ctrl = $controller(SocialBetCtrl,
        {$scope: scope, fb: mockFb, loadMask: mockLoadMask,
          betAPI: mockBetAPI, $q: mockQ,
          $timeout: undefined, currentUser: mockUser,
          videoAd: mockVideoAd});
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


  describe('SocialBetCtrl.watchAd', function() {
    it('should be a function', function() {
      expect(scope.watchAd).toBeFunction();
    });

    it('should show mask and invoke videoAd.showAd', function() {
      scope.watchAd();
      expect(mockVideoAd.showAd).toHaveBeenCalled();
      expect(mockLoadMask.show).toHaveBeenCalled();
    });
  });


  describe('SocialBetCtrl.betBtnClicked', function() {
    it('should be a function', function() {
      expect(scope.betBtnClicked).toBeFunction();
    });

    it('should make user watch an ad if not sufficient fund', function() {
      mockUser.balance = 0;
      scope.bet = {amount: 10};
      spyOn(scope, 'watchAd');
      scope.betBtnClicked();
      expect(scope.watchAd).toHaveBeenCalled();
    });

    it('should post bet right away if user have sufficient fund', function() {

    });
  });


  describe('SocialBetCtrl.postBet', function() {
    it('should be a function', function() {
      expect(scope.postBet).toBeFunction();
    });

    it('should convert bet into usable format', function() {
      mockUser.id = '123';
      scope.selectedFriends = [
        {id: '1'},
        {id: '2'}
      ]
      // The bet object stored in social bet controller.
      scope.bet = {
        amount: 0.1,
        game: {
          gdate: "2012-12-02 13:00:00",
          gid: "11",
          header: "Indianapolis Colts At Detroit Lions",
          sport: "NFL",
          spreadTeam1: "-105",
          spreadTeam2: "-115",
          team1Id: "17",
          team1Name: "Indianapolis Colts",
          team2Id: "18",
          team2Name: "Detroit Lions",
          wagerCutoff: "2012-12-02 12:55:00"
        },
        winRatio: 0.8695652173913043,
        winner: "18",
        winnerName: "Detroit Lions"
      }

      // The format to be sent to the server for real.
      var apiBetFormat = {
        initFBId: '123',
        callFBIds: ['1', '2'],
        betAmount: 0.1,
        type:'spread',
        gameId: '11',
        initTeamBet: '18', // this is the teamId of the team the user wants to bet on
        spreadTeam1: "-105",
        spreadTeam2: "-115"
      }

      scope.postBet();
      expect(mockBetAPI.placeBet).toHaveBeenCalledWith(apiBetFormat);
    });
  });
});

