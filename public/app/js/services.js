'use strict';

/* Services */

angular.module('services', ['ng', 'ngResource'])
    .service('fb', FBSdk)
    .service('loadMask', LoadMask)
    .service('videoAd', VideoAd)

/**
  * Control showing and hiding video advertisments.
  * We are using iframe player from Youtube, the documentation is:
  *   https://developers.google.com/youtube/iframe_api_reference
  *
  */
function VideoAd() {
  this.apiScriptId = 'youtubeApi';

  function onYouTubeIframeAPIReady() {
         this.player = new YT.Player('player', {
           height: '390',
           width: '640',
           videoId: 'jKUw3asDVNY',
           playerVars: {
             controls: 0,
             showinfo: 0,
             // Does not show Youtube logo
             modestbranding: 1,
             // disable the player keyboard controls
             disablekb: 1
           },
           events: {
             'onReady': angular.bind(this, this.onPlayerReady),
             'onStateChange': angular.bind(this, this.onPlayerStateChange)
           }
         });
       }

  /** Show an advertisement based on the options passed in.
      If the delegate has appropriate methods defined, invoke
      these methods to let the deleagte know about certain key
      status.

      example:
        opt: {
          delegate: theDelegateObj
        }
    */
  this.showAd = function(opt) {
    // 2. This code loads the IFrame Player API code asynchronously.
    var tag = document.getElementById(this.apiScriptId);
    if (!tag) {
      tag = document.createElement('script');
      tag.src = "//www.youtube.com/iframe_api";
      tag.id = "youtubeApi";
      var firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
      window.onYouTubeIframeAPIReady = angular.bind(this, onYouTubeIframeAPIReady);
    } else {
      window.onYouTubeIframeAPIReady();
    }
    if (opt && opt.delegate) {
      this.currentDelegate = opt.delegate;
    }
  }

  this.onPlayerReady = function(event) {
    event.target.playVideo();
  }

  // 5. The API calls this function when the player's state changes.
  //    The function indicates that when playing a video (state=1),
  //    the player should play for six seconds and then stop.
  var done = false;
  this.onPlayerStateChange = function(event) {
    if (event.data == YT.PlayerState.ENDED) {
      event.target.clearVideo();
      event.target.destroy();
      var delegate = this.currentDelegate;
      if (delegate) {
        if (typeof delegate.adEnded == 'function') {
          delegate.adEnded();
        }
        this.currentDelegate = undefined;
      }
    }
  }
}

/**
 * A load mask singleton class that is used to show and hide a loading mask
 * Note: This service has implicit dependency on jQuery, Spin.js and jQuery.spin.js.
 * TODO (Di) We probably can have different sizes.
 */
function LoadMask($timeout) {
  // The mask jquery element.
  var maskEl;
  var spinnerConfig = {
    color: 'white',
    top: '40%'
  };

  this.domStrSpinner =     '<div class="loadMask">' +
                              '<div class="backDrop"></div>' +
                              '<div class="spinnerBg"></div>' +
                              '<div class="innerMask">' +
                                '<div class="text">Loading...</div>' +
                              '</div>' +
                            '</div>';

  this.domStr = '<div class="loadMask">' +
                   '<div class="backDrop"></div>' +
                 '</div>';

  // Creating a spinner component with default configurations.
  this.createMaskEl = function(dom) {
   var el = $(dom);
   var innerMask = el.children('.innerMask');

    $(document.body).append(el);
    $timeout(function() {
      el.addClass('fade');
      innerMask.spin(spinnerConfig);
    }, 1);
    return el;
  }

  /**
      opt: {
        text: 'text to be shown under spinner'
        hideSpinner: true // whether or not to hide spinner.
      }
    */
  this.show = function(opt) {
    if (opt) {
      var domStr = opt.hideSpinner ? this.domStr : this.domStrSpinner
      maskEl = this.createMaskEl(domStr);
      if (opt.text) {
        maskEl.find('.text').html(opt.text);
      }
    }
  }

  this.hide = function() {
    maskEl.removeClass('fade');
    // Wait for CSS3 transition to finish (not too long so older brwoser user
    // will not be affected much).
    $timeout(function() {
      maskEl.remove();
      maskEl = undefined;
    }, 200);
  }
}


/**
 * Facebook SDK service (the Angular way!)
 */
function FBSdk($q, $timeout) {
  if (!FB) {
    throw new Error('FB is not available!');
  }

  this.getAccessToken = function() {
    return FB.getAccessToken();
  }

  this.getLoginStatus = function(scope) {
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


  this.login = function(scope, perms) {
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


  this.api = function(scope, a, b, c, d, e) {
    var deferred = $q.defer();
    var callback = function(response) {
      scope.$apply(function() {
        deferred.resolve(response);
      });
    }
    $timeout(function() {
      if (b == undefined) {
        FB.api(a, callback);
      } else if (c == undefined) {
        FB.api(a, b, callback);
      } else if (d == undefined) {
        FB.api(a, b, c, callback);
      } else if (e == undefined){
        FB.api(a, b, c, d, callback);
      } else {
        throw new Error('fb proxy cannot handle so many params!');
      }
    }, 1);
    return deferred.promise;
  }
}
