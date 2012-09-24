/**
 * Provide routing for top level pages.
 */

// Render home page.
module.exports.home = function(req, res) {
  req.facebook.app(function(app) {
    req.facebook.me(function(user) {
      res.render('home.ejs', {
        layout:    false,
        req:       req,
        app:       app,
        user:      user
      });
    });
  });
}

