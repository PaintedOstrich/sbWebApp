'use strict';

/* Services */

angular.module('facebookService', ['ng']).factory('fb', function($q, $timeout) {
  if (!FB) {
    throw new Error('FB is not available!');
  }

  // The wrapped FB sdk service to be returned.
  var qFB = {};

  qFB.getLoginStatus = function(scope) {
    var deferred = $q.defer();
    // Force everythig to be async. Because FB calls callback syncrhonously
    // sometimes and this may break scope.$apply(or really does it?)
    $timeout(function() {
      FB.getLoginStatus(function(response) {
        scope.$apply(function() {
          deferred.resolve(response);
        });
      });
    }, 1);
    return deferred.promise;
  }


  qFB.login = function(scope, perms) {
    var permissions = perms || {};
    var deferred = $q.defer();

    $timeout(function() {
      FB.login(function(response) {
        scope.$apply(function() {
          deferred.resolve(response);
        });
      }, permissions);
    }, 1);
    return deferred.promise;
  }

  return qFB;
});
