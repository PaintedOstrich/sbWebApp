'use strict';

/* API services for connecting to our own backend servers */

angular.module('serverApi', ['ng', 'ngResource', 'services'])
    .service('currentUser', User);

/**
 * The user singleton to be shared among all controllers.
 */
function User($resource, $q, $timeout) {
  var user;
  this.isLoaded = function() {
    return !!user;
  }

  // A private function to create setters and getters for User singleton.
  // So controllers using this singleton can access necessary attributes of the private
  // user variable.
  var createSettersAndGetters = function(scope) {
    var props = ['name', 'id', 'firstName', 'lastName', 'balance'];
    var i;
    for (i=0; i < props.length; i++) {
      var property = props[i];

      if (property) {
        (function(prop) {
          var tmp = prop.charAt(0).toUpperCase() + prop.slice(1);
          scope['get' + tmp] = function() {return user[prop]};
          scope['set' + tmp] = function(val) { user[prop] = val };
        }(property));
      }
    }
  }


//---------------- Fake Data -----------------------

  var activeBets = [
    {
      "initFBId": "1212",
      "callFBId": "6668",
      "betAmount": "123",
      "type": "spread",
      "gameId": "2",
      "initTeamBet": "1",
      "spreadTeam1": "100.3",
      "spreadTeam2": "90",
      "moneyDrawLine": "2",
      "called": "false"
    }
  ]

//  ------------------------------------------------


  // The User server url.
  var url = 'app/testData/User';
  var User = $resource(url, {}, {});
  this.loadUser = function() {
    var deferred = $q.defer();
    var scope = this;
    user = User.get({}, function() {

      //---------- Using fake data
      scope.getActiveBets = function() {
        return activeBets
      }
      // ----------------------
      createSettersAndGetters(scope);
      // create getter for profile url.
      scope.getProfileUrl = function() {
        return "http://graph.facebook.com/"
          + user.id + "/picture?type=large";
      }
      deferred.resolve();
    }, function() {
      console.error('Failed to load user');
    });
    return deferred.promise;
  }

  this.getAPIUrl = function() {
    return url;
  }

  // Old logic to load me from fb. Should we load everything from user server now????
  // fb.api($scope, '/me').then(function(res) {
  //   if (res.error) {
  //     console.error('Failed to load user!');
  //   } else {
  //     $scope.user = res;
  //     $scope.imgUrl = "http://graph.facebook.com/"
  //         + $scope.user.id + "/picture?type=large";
  //   }
  //   console.log($scope.user.id )
  //   loadMask.hide();
  // });
}

