var http = require('http')
  , fs   = require('fs')
  , url  = require('url')
  , qs   = require('querystring')
  , path = require('path')
  , port = 80

// Add more movies! (For a technical challenge, use a file, or even an API!)
var filteredMovies = [];
var moviesFile = [];
var categoriesPresent;
var storedPath = [];
var currentPointInList = 0;
var currentJSON;
var currentThreeCategories = [];
var server = http.createServer (function (req, res) {
  moviesFile = 
    fs.readFileSync ('categories.json', 'utf8')
      .toString()
      .trim()
  categoriesPresent = JSON.parse(moviesFile);
  //console.log(categoriesPresent);
  currentJSON = currentJSON || buildCurrentJSONPath(0, []);
  currentThreeCategories = currentThreeCategories || [Object.keys(currentJSON)[0], Object.keys(currentJSON)[1], Object.keys(currentJSON)[2]];
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
  console.log(uri.pathname);
  switch( uri.pathname ) {
    // Note the new case handling search
    case '/search':
      //handleSearch(res, uri)
      handlePost(req, res);
      break;
    // Note we no longer have   an index.html file, but we handle the cases since that's what the browser will request
    case '/readCategories':
      handlePost(req, res);
      break;
    case '/readSelectedCategory':
      handlePost(req, res);
      break;
    case '/':
      sendFile(res, 'index.html');
      break;
    case '/index.html':
      sendFile(res, 'index.html');
      break;
    case '/initLoad':
      res.end(Object.keys(currentJSON).toString());
      break;
    case '/getCategories':
      res.end(currentThreeCategories.toString());
      break;
    case '/filteredMovies':
      res.end(filteredMovies.toString());
      break;
    case '/style.css':
      sendFile(res, 'style.css', 'text/css')
      break
    case '/js/scripts.js':
      sendFile(res, 'scripts.js', 'text/javascript')
      break;
    case '/buttonEventControllers.js':
      sendFile(res, 'buttonEventControllers.js', 'text/javascript')
      break;
    default:
      sendFile(res, uri.pathname.substring(1), 'image/png');
      break;
  }

})

server.listen(process.env.PORT || port)
console.log('listening on 80')


// subroutines
function buildCurrentJSONPath(depth, array){
  var subJSON;
  subJSON = categoriesPresent;
  for (x = 0; x <= depth; x++) { //Iterate down to a maximum depth 
    if (x === 0){ //Depth is the beginning
      subJSON = subJSON['Categories'];
    }
    else {
      subJSON = subJSON[array[x - 1]];
    }
  }
  return subJSON;
}
function handlePost(req, res) {
  var body = ''

  req.on('data', function(d) {
    body += d;
  })
  req.on('end', function(d) {
    var post = qs.parse( body );
    //We need to consider the path to where we need to be

    //If we're reading the categories in
    if (post.readCategories) {
      if (post.readCategories === "left") { //If we want to go left in a list
        if (currentPointInList > 2 ) { //If we're higher than just two in the list
          currentPointInList -= 3;
        }

      }
      else if (post.readCategories === "right") { //If we want to go right in a list
        if (currentPointInList < (Object.keys(currentJSON).length - 2)) { //Get the length of the json object we're at, and consider we want up to 2 shorter than that
          currentPointInList += 3;
        }
      }
      currentThreeCategories = [];
      maxDistanceAlong = (Object.keys(currentJSON).length < currentPointInList + 3) ? Object.keys(currentJSON).length : (currentPointInList + 3); 
      for (x = currentPointInList; x < maxDistanceAlong; x++) {
        currentThreeCategories.push(Object.keys(currentJSON)[x]);
      }
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
