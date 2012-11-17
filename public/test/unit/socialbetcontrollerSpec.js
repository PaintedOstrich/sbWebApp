describe('SocialBetCtrl', function() {
  var scope, ctrl, mockFb, mockLoadMask, mockQ;

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
    scope = $rootScope.$new();

    var mainScope = $rootScope.$new();
    var mainCtrl = $controller(MainCtrl, {$scope: mainScope});
    scope = mainScope.$new();
    ctrl = $controller(SocialBetCtrl,
        {$scope: scope, fb: mockFb, loadMask: mockLoadMask,
          betAPI: mockBetAPI, $q: mockQ});
  }));


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
      scope.initBet();
      expect(scope.bet).toBeDefined()
    });
  });


  describe('SocialBetCtrl.recalcBalance', function() {
    it('should be a function', function() {
      expect(typeof scope.recalcBalance).toEqual('function');
    });

    it('should calculate balance', function() {
      scope.user.balance = scope.user.currentBalance = 100;
      var mockGame = {};
      scope.initBet(mockGame);
      expect(scope.selectedFriends).toEqual([]);
      expect(scope.bet.betOnTeam1).toBe(0);
      expect(scope.bet.betOnTeam2).toBe(0);

       scope.selectedFriends = [{}, {}];
       scope.$digest();
       expect(scope.user.currentBalance).toBe(100);

       scope.bet.betOnTeam1 = 2;
       scope.bet.betOnTeam2 = 1;
       scope.$digest();
       expect(scope.user.currentBalance).toBe(94);

       scope.selectedFriends = [];
       scope.$digest();
       expect(scope.user.currentBalance).toBe(100);
    });
  });


  describe('SocialBetCtrl.formatFriendData', function() {
    it('Should be function', function() {
      expect(scope.formatFriendData).toBeFunction();
    });

    it('should format arrays into matrix', function() {
      var sourceArr = [0, 1, 2, 3, 4, 5, 6, 7];
      var answer = scope.formatFriendData(sourceArr, 3);
      expect(answer.length).toBe(3);
      expect(answer[0]).toEqual([0, 3, 6]);
      expect(answer[1]).toEqual([1, 4, 7]);
      expect(answer[2]).toEqual([2, 5]);
    });

    it('should apply filters before formatting', function() {
      var sourceArr = [{name: 'aa'}, {name: 'Abc'},
                       {name: 'aacb'}, {name: 'aBb'}];
      var answer = scope.formatFriendData(sourceArr, 2, 'ab');
      expect(answer.length).toBe(2);
      expect(answer[0]).toEqual([{name:'Abc'}]);
      expect(answer[1]).toEqual([{name:'aBb'}]);
    });
  });
});

