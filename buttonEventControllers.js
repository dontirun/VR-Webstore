//Author Arthur Dooner, CS 4241 Final Project
//Event Controller implementations for most buttons and UI elements

var MyControllers = MyControllers || {};


MyControllers.storedCategories = [];
MyControllers.currentIndex = 0;
MyControllers.currentCategories = [];
MyControllers.categoryStack = [];

MyControllers.promptInADirection = function (direction, loc0, loc1, loc2) {
    MyControllers.currentIndex += direction;
    if (MyControllers.currentIndex < 0){
        MyControllers.currentIndex = 0;
    }
    else if (MyControllers.currentIndex > MyControllers.storedCategories.length - 3){
        MyControllers.currentIndex = MyControllers.storedCategories.length - 3;
    }
    MyControllers.currentCategories = [];
    maxDistanceAlong = (MyControllers.storedCategories.length < MyControllers.currentIndex + 3) ? MyControllers.storedCategories.length : (MyControllers.currentIndex + 3); 
    for (x = MyControllers.currentIndex; x < maxDistanceAlong; x++) {
        MyControllers.currentCategories.push(MyControllers.storedCategories[x]);
    }
    loc0.setAttribute("bmfont-text", "text:  " + MyControllers.currentCategories[0] + "; align: left");
    loc1.setAttribute("bmfont-text", "text:  " + MyControllers.currentCategories[1] + "; align: left");
    loc2.setAttribute("bmfont-text", "text:  " + MyControllers.currentCategories[2] + "; align: left");
}

//Controls the individual categories, so that you can descend categories
MyControllers.getAResult = function(choiceNum){ 
    //We need to get the CORRESPONDING thing that we clicked that we intelligently stored elsewhere in memory
    MyControllers.categoryStack.push(MyControllers.currentCategories[choiceNum - 1]);
    console.log(MyControllers.categoryStack.toString());
    var oReq = new XMLHttpRequest();
    function tempReqListener() {
        MyControllers.storedCategories = this.responseText.split(',');
        console.log(MyControllers.storedCategories.toString());
        MyControllers.currentIndex = 0; //Reset the index
        MyControllers.promptInADirection(0, document.querySelector('#item1Text'), document.querySelector('#item2Text'), document.querySelector('#item3Text'));
    }
    oReq.addEventListener("load", tempReqListener);
    oReq.open("POST", "/readSelectedCategory", true);
    oReq.send('readSelectedCategory=' + MyControllers.categoryStack.toString());
}

MyControllers.setup = function() {
    //UI Arrow handlers
    //Also, a declaration of initial state
    var oReq = new XMLHttpRequest();
    function tempReqListener(){
        MyControllers.storedCategories = this.responseText.split(','); //Split on commas for different levels of the array
        MyControllers.promptInADirection(0, document.querySelector('#item1Text'), document.querySelector('#item2Text'), document.querySelector('#item3Text'));
    }
    oReq.addEventListener("load", tempReqListener);
    oReq.open("GET", "/initLoad");
    oReq.send();

    document.querySelector('#forwardArrow').addEventListener('click', function() {
        console.log("Made it here!");
        MyControllers.promptInADirection(3, document.querySelector('#item1Text'), document.querySelector('#item2Text'), document.querySelector('#item3Text'));
    });
    document.querySelector('#backArrow').addEventListener('click', function() {
        console.log("Made it here!");
        MyControllers.promptInADirection(-3, document.querySelector('#item1Text'), document.querySelector('#item2Text'), document.querySelector('#item3Text'));
    });
    document.querySelector('#item1').addEventListener('click', function() {
        MyControllers.getAResult(1);
    });
    document.querySelector('#item2').addEventListener('click', function() {
        MyControllers.getAResult(2);
    });
    document.querySelector('#item3').addEventListener('click', function() {
        MyControllers.getAResult(3);
    });
    document.querySelector('#forwardArrow').addEventListener('thumbup', function() {
        MyControllers.promptInADirection(3, document.querySelector('#item1Text'), document.querySelector('#item2Text'), document.querySelector('#item3Text'));
    });
    document.querySelector('#backArrow').addEventListener('thumbup', function() {
        MyControllers.promptInADirection(-3, document.querySelector('#item1Text'), document.querySelector('#item2Text'), document.querySelector('#item3Text'));
    });
}

/*
MyControllers.promptInADirection = function (direction, loc0, loc1, loc2){
    var oReq = new XMLHttpRequest();
    function reqListener() {
        var oReq2 = new XMLHttpRequest(); 
        function reqListener2() { //This runs third
            storedCategories = this.responseText.split(','); //Split on commas for this array
            //console.log(storedCategories);
            
        }
        oReq2.addEventListener("load", reqListener2); //This runs second
        oReq2.open("GET", "/threeCategories");
        oReq2.send();
    }
    oReq.addEventListener("load", reqListener); //This runs first
    oReq.open("POST", "/readCategories", true);
    oReq.send('readCategories=' + direction);
}
*/
