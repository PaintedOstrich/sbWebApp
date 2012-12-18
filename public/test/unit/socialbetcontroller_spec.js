describe('SocialBetCtrl', function() {
  var scope, ctrl, mockFb, mockQ,
      mockUser, mockVideoAd, mockLocation, realParentUrlParser, mockSwSpinner;

  beforeEach(function() {
      // Services module need to be inluded so we can use the real url parser.
      module('services', function($provide) {});
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

  beforeEach(inject(function($rootScope, $controller, $q, parentUrlParser) {
    realParentUrlParser = parentUrlParser;

    mockSwSpinner = {
      createSpinner: jasmine.createSpy()
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
    mockLocation = {

    };
    scope = $rootScope.$new();

    var mainScope = $rootScope.$new();
    var mainCtrl = $controller(MainCtrl,
      {$scope: mainScope, currentUser: mockUser,
       $location: mockLocation, parentUrlParser: realParentUrlParser});
    scope = mainScope.$new();
    ctrl = $controller(SocialBetCtrl,
        {$scope: scope, fb: mockFb, SwSpinner: mockSwSpinner,
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
      var f1 = {id: '123', installed: true};
      var f2 = {id: '456'};
      var friends = {data:[f1, f2]};
      expect(scope.allFriends).toEqual([]);

      scope.processFriendsData(friends);
      expect(scope.allFriends).toEqual([f1, f2]);
      expect(scope.otherUsers).toEqual([f1]);
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

    it('should init bet', function() {
      expect(scope.bet).toBeUndefined();

      var winnerName = 'name1';
      var winRatio = 1;
      var game = {
        team1Id: '11',
        team2Id: '22',
        spreadTeam1: 'sp1',
        spreadTeam2: 'sp2',
        team1Name: winnerName,
        team2Name: 'name2'
      };
      var winnerId = '11';
      spyOn(scope, 'calcWinRatio').andReturn(winRatio);
      spyOn(scope, 'calcBetAmount');
      var sampleBet = {
        game: game,
        winner: winnerId,
        winRatio: winRatio,
        displayAmount:  0,
        realAmount: 0,
        winnerName: winnerName
      }

      scope.initBet(game, winnerId);
      expect(scope.bet).toEqual(sampleBet);
      expect(scope.calcWinRatio).toHaveBeenCalledWith('sp1');
      expect(scope.calcBetAmount).toHaveBeenCalled();
    });
  });


  describe('SocialBetCtrl.calcBetAmount', function() {
    it('should be a function', function() {
      expect(scope.calcBetAmount).toBeFunction();
    });

    it('should calc the right amount', function() {
      scope.selectedFriends = [1, 2, 3];
      scope.otherUsers = [1];
      scope.bet = {};
      scope.calcBetAmount();
      expect(scope.bet.displayAmount).toBe(0.3);
      expect(scope.bet.realAmount).toBe(0.2);
    });
  });


  describe('SocialBetCtrl.watchAd', function() {
    it('should be a function', function() {
      expect(scope.watchAd).toBeFunction();
    });

    it('should show mask and invoke videoAd.showAd', function() {
      scope.watchAd();
      expect(mockVideoAd.showAd).toHaveBeenCalled();
    });
  });


  describe('SocialBetCtrl.postBet', function() {
    it('should be a function', function() {
      expect(scope.postBet).toBeFunction();
    });

    it('should make user watch ad if realAmount > user balance', function() {
      scope.user = {balance: 0.1};
      // We let calcBetAmount to calculate the amounts.
      scope.bet = {};
      spyOn(scope, 'calcBetAmount').andCallFake(function() {
        scope.bet.realAmount = 0.2;
      });
      spyOn(scope, 'watchAd');
      spyOn(scope, 'doPostBet');

      scope.postBet();
      expect(scope.watchAd).toHaveBeenCalled();
      expect(scope.doPostBet).not.toHaveBeenCalled();
    });

    it('should just post the bet if user has enough fund', function() {
      scope.user = {balance: 0.1};
      // We let calcBetAmount to calculate the amounts.
      scope.bet = {};
      spyOn(scope, 'calcBetAmount').andCallFake(function() {
        scope.bet.realAmount = 0;
      });
      spyOn(scope, 'watchAd');
      spyOn(scope, 'doPostBet');

      scope.postBet();
      expect(scope.watchAd).not.toHaveBeenCalled();
      expect(scope.doPostBet).toHaveBeenCalled();
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
        initTeamBetId: '18', // this is the teamId of the team the user wants to bet on
        spreadTeam1: "-105",
        spreadTeam2: "-115"
      }

      scope.postBet();
      expect(mockBetAPI.placeBet).toHaveBeenCalledWith(apiBetFormat);
    });
  });
});

