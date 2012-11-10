'use strict';

/* API services for connecting to our own backend servers */

angular.module('serverApi', ['ng', 'ngResource', 'services'])
    .service('currentUser', User);

/**
 * The user singleton to be shared among all controllers.
 */
function User($q, $timeout, fb, $http) {
  this.isLoaded = function() {
    return !!this.id;
  }

  // Private function to process loaded user data from facebook
  this.processDataFromFb = function($scope, res) {
    var deferred = $q.defer();
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
      deferred.resolve();
    }
    return deferred.promise;
  }

  // The User server url.
  var apiUrl = 'app/testData/User';
  var serverFields = ['activeBets', 'betInvites'];
  // Query our user api for user data specific to our app.
  this.queryBackend = function($scope) {
    var deferred = $q.defer();
    var serviceScope = this;
    $http.get(apiUrl).success(function(data) {
      if (data.success) {
        serverFields.forEach(function(fieldName) {
          if (data[fieldName]) {
            serviceScope[fieldName] = data[fieldName];
          }
        });
        deferred.resolve();
      } else {
        deferred.reject();
      }
    });
    return deferred.promise;
  }


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
