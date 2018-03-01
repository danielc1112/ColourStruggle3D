/*
Author: Daniel Campbell 2011/12
Attach To: "Exit Text" GUIText
*/
private var PreservedData : SPreservedData;

function Start(){
	PreservedData = GameObject.Find("PreservedDataStay").GetComponent(SPreservedData);
}

function OnMouseEnter () {
	gameObject.GetComponent.<GUIText>().fontStyle = FontStyle.BoldAndItalic;
}

function OnMouseExit(){
	gameObject.GetComponent.<GUIText>().fontStyle = FontStyle.Normal;
}

function OnMouseUp(){
	PreservedData.SetStartGUIOn(true);
	PreservedData.SetLevel(1); 	
    Application.LoadLevel("Level1");
}

