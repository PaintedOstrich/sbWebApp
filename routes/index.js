/**
 * Provide routing for top level pages.
 */
 
// Used to serve up a 404 not found page.
module.exports.notFound = function(req, res){
  res.status(404).format({
    html: function(){
      res.render('404.ejs');
    },
    json: function(){
      res.send({ message: 'Resource not found' });
    },
    text: function(){
      res.send('Resource not found\n');
    } 
  });
};