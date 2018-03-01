/*
Author: Daniel Campbell 2011/12
Attach To: "PreservedData" EmptyGameObject
To store all persistent data on level load
*/
#pragma strict
private var bStartGUIOn : boolean = false;
private var level : int = 1;

function Awake(){
	var toDie : GameObject[] = GameObject.FindGameObjectsWithTag("PreservedData");
	if(toDie.Length != 1){ //after first time	
		for(var toD in toDie)
			if(toD.name != "PreservedDataStay"){
				Destroy(toD);
			}
	}
	else{ //firstTime
		DontDestroyOnLoad(gameObject);
		bStartGUIOn = true;	
		gameObject.name = "PreservedDataStay";	
	}
}

function SetStartGUIOn(bValue : boolean) {
	bStartGUIOn = bValue;
}

function GetStartGUIOn() : boolean {
	return bStartGUIOn;
}

function SetLevel(val : int) {
	level = val;
}

function GetLevel() : int {
	return level;
}