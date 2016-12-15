//Author Arthur Dooner, CS 4241 Final Project
//Event Controller implementations for most buttons and UI elements

var MyControllers = MyControllers || {};

MyControllers.atPanels = false;
MyControllers.storedPanels = [];
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
    loc0.setAttribute("bmfont-text", "text:  " + MyControllers.currentCategories[0] + "; align: left; color: white");
    loc1.setAttribute("bmfont-text", "text:  " + MyControllers.currentCategories[1] + "; align: left; color: white");
    loc2.setAttribute("bmfont-text", "text:  " + MyControllers.currentCategories[2] + "; align: left; color: white");
}

//Controls the individual categories, so that you can descend categories
MyControllers.getAResult = function(choiceNum){ 
    //We need to get the CORRESPONDING thing that we clicked that we intelligently stored elsewhere in memory
    if(MyControllers.atPanels) { MyControllers.categoryStack.pop(); }

    MyControllers.categoryStack.push(MyControllers.currentCategories[choiceNum - 1]);
    console.log(MyControllers.categoryStack.toString());
    var oReq = new XMLHttpRequest();
    function tempReqListener() {
        if(this.responseText.indexOf('PANEL') !== -1){
            MyControllers.atPanels = true;
        }
        else{
            MyControllers.atPanels = false;
        }

        if(MyControllers.atPanels){
            var tmpList = this.responseText.split(',');
            tmpList.splice(0,1); // Remove PANEL identifier

            // Call panel update function

            // Get object information from the server for the given panels
        }
        else{
            MyControllers.storedCategories = this.responseText.split(',');
            console.log(MyControllers.storedCategories.toString());
            MyControllers.currentIndex = 0; //Reset the index
            MyControllers.promptInADirection(0, document.querySelector('#item1Text'), document.querySelector('#item2Text'), document.querySelector('#item3Text'));
        }
    }
    oReq.addEventListener("load", tempReqListener);
    oReq.open("POST", "/readSelectedCategory", true);
    oReq.send('readSelectedCategory=' + MyControllers.categoryStack.toString());
}

MyControllers.goUp = function(choiceNum){ 
    //We need to get the CORRESPONDING thing that we clicked that we intelligently stored elsewhere in memory
    if(MyControllers.atPanels) { MyControllers.atPanels = false; }

    MyControllers.categoryStack.pop();
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

    document.querySelector('#forwardArrowHelper').addEventListener('click', function() {
        console.log("Made it here!");
        MyControllers.promptInADirection(3, document.querySelector('#item1Text'), document.querySelector('#item2Text'), document.querySelector('#item3Text'));
    });
    document.querySelector('#backArrowHelper').addEventListener('click', function() {
        console.log("Made it here!");
        MyControllers.promptInADirection(-3, document.querySelector('#item1Text'), document.querySelector('#item2Text'), document.querySelector('#item3Text'));
    });
    document.querySelector('#upArrowHelper').addEventListener('click', function() {
        console.log("Made it here!");
        MyControllers.goUp();
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
    document.querySelector('#forwardArrowHelper').addEventListener('thumbup', function() {
        MyControllers.promptInADirection(3, document.querySelector('#item1Text'), document.querySelector('#item2Text'), document.querySelector('#item3Text'));
    });
    document.querySelector('#backArrowHelper').addEventListener('thumbup', function() {
        MyControllers.promptInADirection(-3, document.querySelector('#item1Text'), document.querySelector('#item2Text'), document.querySelector('#item3Text'));
    });
    document.querySelector('#upArrowHelper').addEventListener('thumbup', function() {
        console.log("Made it here!");
        MyControllers.goUp();
    });
}
