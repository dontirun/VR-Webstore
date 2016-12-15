//Author Arthur Dooner, CS 4241 Final Project
//Event Controller implementations for most buttons and UI elements

var MyControllers = MyControllers || {};

MyControllers.atPanels = false;
MyControllers.storedPanels = ['', '', '', ''];
MyControllers.storedCategories = [];
MyControllers.currentIndex = 0;
MyControllers.currentCategories = [];
MyControllers.categoryStack = ["Categories"];

MyControllers.promptInADirection = function (direction, loc0, loc1, loc2) {
    MyControllers.currentIndex += direction;
    if (MyControllers.currentIndex < 0){
        MyControllers.currentIndex = 0;
    }
    else if (MyControllers.currentIndex > MyControllers.storedCategories.length - 3){
        MyControllers.currentIndex = MyControllers.storedCategories.length - 3;
    }
    MyControllers.currentCategories = [];
    maxDistanceAlong = (MyControllers.storedCategories.length < (MyControllers.currentIndex + 3)) ? MyControllers.storedCategories.length : (MyControllers.currentIndex + 3);
    //console.log("Current index is" + currentIndex);
    for (x = MyControllers.currentIndex; x < maxDistanceAlong; x++) {
        MyControllers.currentCategories.push(MyControllers.storedCategories[x]);
    }
    loc0.setAttribute("bmfont-text", "text:  " + (MyControllers.currentCategories[0] !== undefined ? MyControllers.currentCategories[0] : " ")  + "; align: left; color: white");
    loc1.setAttribute("bmfont-text", "text:  " + (MyControllers.currentCategories[1] !== undefined ? MyControllers.currentCategories[1] : " ")  + "; align: left; color: white");
    loc2.setAttribute("bmfont-text", "text:  " + (MyControllers.currentCategories[2] !== undefined ? MyControllers.currentCategories[2] : " ")  + "; align: left; color: white");
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
            console.log(tmpList);
            MyControllers.storedPanels = tmpList;

            // Call panel update function
            refreshPanels();

            // Get object information from the server for the given panels
        }
        else{
            console.log(this.responseText);
            console.log(MyControllers.storedCategories.toString())
            if (this.responseText == MyControllers.storedCategories.toString()){ //If the same, there's nothing lower
                MyControllers.categoryStack.pop();
                //console.log(MyControllers.categoryStack.toString());
            }
            else {
                MyControllers.storedCategories = this.responseText.split(',');
                //console.log(MyControllers.storedCategories.toString());
                MyControllers.currentIndex = 0; //Reset the index
                MyControllers.promptInADirection(0, document.querySelector('#item1Text'), document.querySelector('#item2Text'), document.querySelector('#item3Text'));
            }
           
        }
        document.querySelector("#categoryPlaneText").setAttribute("bmfont-text", "text:  " + MyControllers.categoryStack[MyControllers.categoryStack.length - 1] + "; align: left; color: white");
    }
    oReq.addEventListener("load", tempReqListener);
    oReq.open("POST", "/readSelectedCategory", true);
    oReq.send('readSelectedCategory=' + MyControllers.categoryStack.toString());
}

MyControllers.goUp = function(choiceNum){ 
    //We need to get the CORRESPONDING thing that we clicked that we intelligently stored elsewhere in memory
    if(MyControllers.atPanels) {
        MyControllers.atPanels = false;
        MyControllers.storedPanels = ['', '', '', ''];
        refreshPanels();
    }
    if (MyControllers.categoryStack.length !== 1){
        MyControllers.categoryStack.pop();
    }
    document.querySelector("#categoryPlaneText").setAttribute("bmfont-text", "text:  " + MyControllers.categoryStack[MyControllers.categoryStack.length - 1] + "; align: left; color: white");
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

// Function to set panel text
function refreshPanels(){
    // Set panel text
    document.querySelector('#blPanelSub').setAttribute("bmfont-text","width:200; align:'left'; text:"+MyControllers.storedPanels[0]);
    document.querySelector('#tlPanelSub').setAttribute("bmfont-text","width:200; align:'left'; text:"+MyControllers.storedPanels[1]);
    document.querySelector('#trPanelSub').setAttribute("bmfont-text","width:200; align:'left'; text:"+MyControllers.storedPanels[2]);
    document.querySelector('#brPanelSub').setAttribute("bmfont-text","width:200; align:'left'; text:"+MyControllers.storedPanels[3]);

    // Set object to hidden object
    aScene.removeChild(currentObject);
    var galleryMesh = document.createElement("a-plane");
    galleryMesh.setAttribute("id", "hidden");
    galleryMesh.setAttribute("visible", "false");
    aScene.appendChild(galleryMesh);
    currentObject = document.getElementById("hidden");
}
