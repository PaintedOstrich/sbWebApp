'use strict';

/* API services for connecting to our own backend servers */

angular.module('serverApi', ['ng', 'ngResource', 'services'])
    .service('currentUser', User)
    .service('betAPI', BetAPI);


/**
 * A service to talk to bet API server.
 */
function BetAPI($resource, $q, $http) {
  // The API server url.
  this.url = 'https://sportsbetsservice.herokuapp.com/api/';

  var Game = $resource(this.url + 'games/:gameType', {gameType: '@gameType'}, {});
  this.loadGames = function(gameType) {
    var deferred = $q.defer();
    var games = Game.query({gameType: gameType}, function() {
      deferred.resolve(games);
    }, function() {
      console.error('Failed to load games');
    });
    return deferred.promise;
  }

  this.placeBet = function(bet) {
    var deferred = $q.defer();
    $http.post(this.url + 'bet/batch', bet).
      success(function(res) {deferred.resolve(res)}).
      error(function(err) {deferred.reject(err)});
    return deferred.promise;
  }
}

/**
 * The user singleton to be shared among all controllers.
 */
function User($q, $timeout, fb, $http) {
  this.fbInfoLoaded = false;
  this.betInfoLoaded = false;
  var self = this;

  this.isLoaded = function() {
    return this.fbInfoLoaded && this.betInfoLoaded;
  }

  // Private function to process loaded user data from facebook
  this.processDataFromFb = function($scope, res) {
    var deferred = $q.defer();
    self.fbInfoLoaded = false;
    if (res.error) {
      console.error('Failed to load user!');
      deferred.reject();
    } else {
      for(var prop in res) {
        if (this[prop]) {
          console.error('Overriding ' + prop + ' in currentUsr singlton');
        } else {
          this[prop] = angular.copy(res[prop]);
        }
      }
      this.imgUrl = "http://graph.facebook.com/"
          + this.id + "/picture?type=large";
      self.fbInfoLoaded = true;
      deferred.resolve();
    }
    return deferred.promise;
  }

  // The User server url.
  var apiUrl = 'app/testData/User?';
  var serverFields = ['bets', 'balance'];
  // Query our user api for user data specific to our app.
  this.queryBackend = function($scope) {
    var deferred = $q.defer();
    var serviceScope = this;
    self.betInfoLoaded = false;
    fb.getLoginStatus($scope).then(function(res) {
      $http.get(apiUrl + res.authResponse.signedRequest).success(function(data) {
        if (!data.err) {
          console.log(data);
          serverFields.forEach(function(fieldName) {
            if (data[fieldName]) {
              serviceScope[fieldName] = data[fieldName];
            }
          });
          self.betInfoLoaded = true;
          deferred.resolve();
        } else {
          deferred.reject();
        }
      });
    });
    return deferred.promise;
  }

  // This method should only be used if user is not loaded at all.
  // Otherwise just call queryBackend to refresh app related user info.
  // We should not need to load info from facebook more than once.
  this.loadUser = function($scope) {
    var serviceScope = this;
    return fb.api($scope, '/me')
        .then(angular.bind(serviceScope, serviceScope.processDataFromFb, $scope))
        .then(angular.bind(serviceScope, serviceScope.queryBackend, $scope));
  }

  this.getAPIUrl = function() {
    return apiUrl;
  }
}

