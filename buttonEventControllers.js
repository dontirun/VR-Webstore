var MyControllers = MyControllers || {};

MyControllers.setup = function() {
    //UI Arrow handlers
    //Also, a declaration of initial state
    MyControllers.promptForward(document.querySelector('#item1Text'), document.querySelector('#item2Text'), document.querySelector('#item3Text'));
    document.querySelector('#forwardArrow').addEventListener('click', function() {
        MyControllers.promptForward(document.querySelector('#item1Text'), document.querySelector('#item2Text'), document.querySelector('#item3Text'));
    });
}

MyControllers.promptForward = function (loc0, loc1, loc2){
    console.log("Made it here to the prompt thing!");
    MyControllers.promptInADirection("right", loc0, loc1, loc2)
}

MyControllers.storedCategories = [];

MyControllers.promptInADirection = function (direction, loc0, loc1, loc2){
    var oReq = new XMLHttpRequest();
    function reqListener() {
        var oReq2 = new XMLHttpRequest(); 
        function reqListener2() { //This runs third
            storedCategories = this.responseText.split(','); //Split on commas for this array
            //console.log(storedCategories);
            loc0.setAttribute("bmfont-text", "text: " + storedCategories[0] + "; align: left");
            loc1.setAttribute("bmfont-text", "text: " + storedCategories[1] + "; align: left");
            loc2.setAttribute("bmfont-text", "text: " + storedCategories[2] + "; align: left");
        }
        oReq2.addEventListener("load", reqListener2); //This runs second
        oReq2.open("GET", "/threeCategories");
        oReq2.send();
    }
    oReq.addEventListener("load", reqListener); //This runs first
    oReq.open("POST", "/readCategories", true);
    oReq.send('readCategories=' + direction);
}