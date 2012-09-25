'use strict';

/* Services */

// angular.module('phonecatServices', ['ngResource']).
//     factory('Phone', function($resource){
//   return $resource('app/phones/:phoneId.json', {}, {
//     query: {method:'GET', params:{phoneId:'phones'}, isArray:true}
//   });
// });

angular.module('facebookService', ['ng']).factory('fb', function($q) {
  if (!FB) {
    throw new Error('FB is not available!');
  }

  // The wrapped FB sdk service to be returned.
  var qFB = {};

  qFB.getLoginStatus = function(scope) {
    var deferred = $q.defer();
    // Force everythig to be async. Because FB calls callback syncrhonously
    // sometimes and this may break scope.$apply(or really does it?)
    setTimeout(function() {
      FB.getLoginStatus(function(response) {
        if (response.status === 'connected') {
          var uid = response.authResponse.userID;
          var accessToken = response.authResponse.accessToken;
          scope.$apply(function() {
            deferred.resolve(uid, accessToken);
          });
        } else if (response.status === 'not_authorized') {
          // the user is logged in to Facebook,
          // but has not authenticated your app
          scope.$apply(function() {
            deferred.reject('Not Authorized!');
          });
        } else {
          scope.$apply(function() {
            deferred.reject('Not Logged In');
          })
        }
       });
    }, 1);

    return deferred.promise;
  }

  return qFB;
});
