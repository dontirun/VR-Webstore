var http = require('http')
  , fs   = require('fs')
  , url  = require('url')
  , qs   = require('querystring')
  , path = require('path')
  , port = 80

var categoriesPresent;
var storedPath = [];
var currentPointInList = 0;
var currentJSON;
var currentThreeCategories = [];

// Read in from JSON
categoriesFile = 
  fs.readFileSync ('categories.json', 'utf8')
    .toString()
    .trim()
categoriesPresent = JSON.parse(categoriesFile);
currentJSON = currentJSON || buildCurrentJSONPath(1, ["Categories"]);
currentThreeCategories = currentThreeCategories || [Object.keys(currentJSON)[0], Object.keys(currentJSON)[1], Object.keys(currentJSON)[2]];

var server = http.createServer (function (req, res) {
  var uri = url.parse(req.url)
  switch( uri.pathname ) {
    case '/readCategories':
      handlePost(req, res);
      break;
    case '/readSelectedCategory':
      handlePost(req, res);
      break;
    case '/getobject':
      handleJSONRequest(req, res);
      break;
    case '/':
      sendFile(res, 'index.html');
      break;
    case '/README':
      sendFile2(res, 'README.md');
      break;
    case '/readme':
      sendFile2(res, 'README.md');
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
function handleJSONRequest(req, res) {
  var body = '';

  req.on('data', function(d) {
    body += d;
  });
  req.on('end', function(d) {
    var post = qs.parse( body );
    if (post.getobject) {
      console.log(post.getobject);
      var resultObject = categoriesPresent["Items"].filter(function(obj){
        return obj["name"] === post.getobject;
      });
      console.log(resultObject[0]);
      res.end(JSON.stringify(resultObject[0]));
    }
  });
}

function buildCurrentJSONPath(depth, array){
  var subJSON;
  subJSON = categoriesPresent;
  console.log(depth);
  for (x = 0; x <= depth; x++) { //Iterate down to a maximum depth 
      // function isArrayEmpty(anArray){
      //   return anArray.filter(function(el) {
      //     return Object.keys.
      //   })
      // } 
      if (subJSON[array[x]] !== undefined) {
        subJSON = subJSON[array[x]];
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
    if (post.readSelectedCategory){
      var categoryStack = post.readSelectedCategory.split(',');
      console.log(categoryStack.toString());
      console.log(categoryStack.length);
      var tempJSON = buildCurrentJSONPath(categoryStack.length, categoryStack)
      console.log(tempJSON);

      // Check if panel values are being send, or a subtree
      if(Object.prototype.toString.call(tempJSON) === '[object Array]'){
        // Panel Values
        var panelVals = ['PANEL'];
        if (tempJSON.length === 0) {
          categoryStack.pop();
          tempJSON = buildCurrentJSONPath(categoryStack.length, categoryStack);
           res.end(Object.keys(tempJSON).toString());
        }
        for(var i in tempJSON){
          panelVals.push(tempJSON[i]);
        }

        res.end(panelVals.toString());
      }
      else{
        // JSON
        console.log("Here's the temp JSON" + tempJSON);
        res.end(Object.keys(tempJSON).toString());
      }
    }
  })

}

function sendFile(res, filename, contentType) {
  contentType = contentType || 'text/html'

  fs.readFile(filename, function(error, content) {
    res.writeHead(200, {'Content-type': contentType})
    res.end(content, 'utf-8')
  })

}

function sendFile2(res, filename, contentType) {
  contentType = contentType || 'text/html'
  
  var stream = fs.createReadStream(filename)

  stream.on('data', function(data) {
    res.write(data);
  })

  stream.on('end', function(data) {
    res.end();
    return;
  })
}
