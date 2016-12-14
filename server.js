var http = require('http')
  , fs   = require('fs')
  , url  = require('url')
  , qs   = require('querystring')
  , path = require('path')
  , port = 80

// Add more movies! (For a technical challenge, use a file, or even an API!)
var filteredMovies = [];
var moviesFile = [];

var server = http.createServer (function (req, res) {
  moviesFile = 
    fs.readFileSync ('listOfModels.txt', 'utf8')
      .toString()
      .trim()
      .split("\n"); //Split on new lines
  
  //var newData = '';
  // req.on('data', function(c) {
  //   newData = newData + c;
  // });
  // req.on('end', function() {
  //   if (newData != '') {
  //     var q = qs.parse(newData);
  //     if (q.newMovie) {
  //       moviesFile.push(q.newMovie);
  //       fs.writeFileSync('movies.txt', moviesFile.join('\n'));
  //     }
  //     if (q.searchMovie) {
  //       handleSearch(res, q.searchMovie);
  //     }
  //   }
  //   newData = '';
  // });
  var uri = url.parse(req.url)

  switch( uri.pathname ) {
    // Note the new case handling search
    case '/search':
      //handleSearch(res, uri)
      handlePost(req, res);
      break;
    // Note we no longer have   an index.html file, but we handle the cases since that's what the browser will request
    case '/putNewMovie':
      handlePost(req, res);
      break;
    case '/reMovie':
      handlePost(req, res);
      break;
    case '/':
      sendFile(res, 'index.html');
      break;
    case '/index.html':
      sendFile(res, 'index.html');
      break;
    case '/movies':
      res.end(moviesFile.toString());
      break;
    case '/filteredMovies':
      res.end(filteredMovies.toString());
      break;
    case '/style.css':
      sendFile(res, 'style.css', 'text/css')
      break
    case '/js/scripts.js':
      sendFile(res, 'scripts.js', 'text/javascript')
      break
    default:
      sendFile(res, uri.pathname);
      break;
  }

})

server.listen(process.env.PORT || port)
console.log('listening on 8080')

// subroutines
function handlePost(req, res) {
  var body = ''

  req.on('data', function(d) {
    body += d;
  })
  req.on('end', function(d) {
    var post = qs.parse( body )

    if( post.newMovie ) {
      moviesFile.push( post.newMovie )
      moviesFile.sort();
      fs.writeFileSync('movies.txt', moviesFile.join('\n'));
      res.end();
    }
    if(post.search) {
      filteredMovies = moviesFile.filter(hasTheThing(post.search));
      res.end();
    }

    if (post.reMovie) {
      moviesFile =  moviesFile.filter(isNotTheThing(post.reMovie));
      fs.writeFileSync('movies.txt', moviesFile.join('\n'));
      res.end();
    }
    console.log( moviesFile ) 
  })
  
}

function hasTheThing(theThing) {
  return function(value) {
    return (value.toLowerCase()).includes(theThing.toLowerCase()); //Make it case insensitive
  }
}
function isNotTheThing(theThing) {
  return function(value) {
    return value.toLowerCase() !== theThing.toLowerCase(); //Make it case insensitive
  }
}

// Note: consider this your "index.html" for this assignment
function sendIndex(res, isFiltered) {
  var contentType = 'text/html'
    , html = ''

  html = html + '<html>'

  html = html + '<head>'
  // You could add a CSS and/or js call here...
  html = html + '</head>'

  html = html + '<body>'
  html = html + '<h1>Movie Search!</h1>'

  // Here's where we build the form YOU HAVE STUFF TO CHANGE HERE
  html = html + '<form action="search" method="post">';
  html = html + '<input id="searchMovie" type="text" name="search" />';
  html = html + '<button type="button">Search</button>';
  html = html + '</form>';
  //Make the form for adding a new movie
  html = html + '<form action="add" method="post">';
  html = html + '<label for="newMovie">Add New Movie</label>';
  html = html + '<input id="newMovie" name="newMovie" type="text">';
  html = html + '<button type="submit">Add Movie</button>';
  html = html + '</form>';
  html = html + '<ul>'
  if (isFiltered === 1) {
    html = html + filteredMovies.map(function(d) { return '<li>'+d+'</li>' }).join(' ')
  }
  else {
      html = html + moviesFile.map(function(d) { return '<li>'+d+'</li>' }).join(' ')
  }
  html = html + '</ul>'

  html = html + '</body>'
  html = html + '</html>'
  
  res.writeHead(200, {'Content-type': contentType})
  res.end(html, 'utf-8')
}

function sendFile(res, filename, contentType) {
  contentType = contentType || 'text/html'

  fs.readFile(filename, function(error, content) {
    res.writeHead(200, {'Content-type': contentType})
    res.end(content, 'utf-8')
  })

}
