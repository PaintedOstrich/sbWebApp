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
  // 
  // // Private function to process loaded user data from facebook
  // this.processDataFromFb = function(user) {
  //   // $scope.imgUrl = "http://graph.facebook.com/"
  //   //     + $scope.user.id + "/picture?type=large";
  // }
  // 
  // // The User server url.
  // var url = 'app/testData/User';
  // this.loadUser = function($scope) {
  //   var deferred = $q.defer();
  // 
  //   // var serviceScope = this;
  //   // fb.api($scope, '/me').then(function(res) {
  //   //   if (res.error) {
  //   //     console.error('Failed to load user!');
  //   //   } else {
  //   //     angular.bind(serviceScope, processDataFromFb, res);
  //   //   }
  //   // });
  // 
  //   return deferred.promise;
  // }
  // 
  // this.getAPIUrl = function() {
  //   return url;
  // }
}

