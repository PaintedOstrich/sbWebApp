var routes = require('../../routes/index.js');

describe('Top level page routes', function() {
  it('should be defined', function() {
    expect(routes).toBeDefined();
  });


  describe('home route', function() {
    it('should be defined', function() {
      expect(routes.home).toBeDefined();
    })
  });
});
