'use strict';

/* Services */

angular.module('services', ['ng', 'ngResource'])
    .service('fb', FBSdk)
    .service('videoAd', VideoAd)
    .service('parentUrlParser', ParentUrlParser);

/**
  * The parser service will parse the parent frame's url and
  * give us relevant GET params.
  */
function ParentUrlParser() {
  this._data = {};

  this.init = function() {
    if ($ && typeof $ == 'function') {
      var dom = $('#initialData');
      var data = dom.attr('data');
      if (dom.length > 0 && data) {
        this.parseUrl(data);
        //Remember to remove it so it does not pop uo again.
        dom.attr('data', '');
      }
    }
  }

  this.parseUrl = function(urlStr) {
    if (urlStr.slice(0, 2) == "/?") {
      urlStr = urlStr.slice(2);
      var chunks = urlStr.split("&");
      var self = this;
      chunks.forEach(function(str) {
        var pairs = str.split('=');
        if (pairs.length == 2) {
          self._data[pairs[0]] = pairs[1];
        }
      });
    }
  }

  this.get = function(name) {
    return this._data[name];
  }

  this.set = function(name, value) {
    this._data[name] = value;
  }
}


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

  //    The API calls this function when the player's state changes.
  //    The function indicates that when playing a video (state=1),
  //    the player should play for six seconds and then stop.
  var done = false;
  this.onPlayerStateChange = function(event) {
    if (event.data == YT.PlayerState.ENDED) {
      event.target.stopVideo();
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
 * SwMask service
 * This service can create a semi-transparent mask over a component
 * or full screen to prevent further user interactions
 */
angular.module('services').service('SwMask', function SwMask() {
  var defaultOpts = {
    // I have set the id of the body of the document to be 'body'
    root: '#body',
    duration: 300
  }

  var template = '<div class="swMask" style="display:none;"></div>';
  /**
   * Show the mask.
   * @param  {obj} scope the scope of the controller invoking this service
   *                     we use this to show and remove the correct mask.
   * @param  {obj} opts additional options to be used
   */
  this.createMask = function(opts) {
    var options = {};
    angular.extend(options, defaultOpts, opts);
    var rootEl = $(options.root);
    var maskEl = $(template);
    rootEl.append(maskEl);
    maskEl.fadeIn(options.duration);
    return (function(el, defaultOptions) {
        return {
          hide: function(opts) {
            var options = {};
            angular.extend(options, defaultOptions, opts);
            if (el) {
              el.fadeOut(options.duration, function() {
                el.remove();
              })
            }
          }
        }
     }(maskEl, defaultOpts));
  }
});


/**
 * Create a spinner and show it at the center of the page.
 * Note: This service has implicit dependency on jQuery, Spin.js and jQuery.spin.js.
 */
angular.module('services').service('SwSpinner', function SwSpinner(SwMask) {
  var defaultOpts = {
    root: '#body',
    color: 'white',
    top: '40%',
    left: '50%',
    duration: 300
  };

  var domStrSpinner =   '<div class="spinnerOuter" style="display:none;">' +
                          '<div class="spinnerBg"></div>' +
                          '<div class="innerMask">' +
                              '<div class="text">Loading...</div>' +
                          '</div>' +
                        '</div>';

    // Creating a spinner component with default configurations.
  function createSpinnerEl(opts) {
    var domStr = domStrSpinner;
    if (opts && opts.text) {
      domStr = domStrSpinner.replace('Loading...', opts.text);
    }
    var el = $(domStr);
    var innerMask = el.find('.innerMask');
    innerMask.spin(opts);
    return el;
  }

  this.createSpinner = function(opts) {
    var options = {};
    angular.extend(options, defaultOpts, opts);
    var spinnerEl = createSpinnerEl(options);
    var maskObj = SwMask.createMask(options);

    var rootEl = $(options.root);
    rootEl.append(spinnerEl);
    spinnerEl.fadeIn(options.duration);

    return (function(el, mask, defaultOptions) {
      var successDomStr = '<div class="innerMask">' +
                        '<div class="successTick"></div>' +
                        '<div class="text">Done</div>' +
                      '</div>';
      var failedDomStr = '<div class="innerMask">' +
                      '<div class="failedIcon"></div>' +
                      '<div class="text">Failed, please try again</div>' +
                    '</div>';

      // Helper function to extarct duplicated codes for loadSuccess and loadFailed
      function beforeHide (self, domStr, timeoutDuration) {
          if (el) {
            el.children('.innerMask').remove();
            el.append(domStr);
            setTimeout(angular.bind(self, self.hide), timeoutDuration);
          }
      }

      return {
        hide: function(opts) {
          var options = {};
          angular.extend(options, defaultOptions, opts);
          if (mask) {
            mask.hide(options);
          }
          if (el) {
            el.fadeOut(options.duration, function() {
              el.remove();
            });
          }
        },

        loadSuccess: function(opts) {
          var domStr = successDomStr;
          if (opts && opts.text) {
            domStr = successDomStr.replace('Done', opts.text);
          }
          beforeHide(this, domStr, 300);
        },

        loadFailed: function(opts) {
          var domStr = failedDomStr;
          if (opts && opts.text) {
            domStr = failedDomStr.replace('Failed, please try again', opts.text);
          }
          beforeHide(this, domStr, 1500);
        }
      }
    }(spinnerEl, maskObj, defaultOpts));
  }
});


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


  this.ui = function(scope, opts) {
    var deferred = $q.defer();
    /**   Sample res:
      *     {
              request: "447891311941685"
              to: ["737835647"]
            }
      *   If res is undefined, user has clicked cancel.
      */
    FB.ui(opts, function(res) {
      scope.$apply(function() {
        deferred.resolve(res);
      });
    });
    return deferred.promise;
  }
}
