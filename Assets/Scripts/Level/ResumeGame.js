/*
Author: Daniel Campbell 2011/12
Attach To: "ResumeText" GUIText
*/

function OnMouseEnter () {
	gameObject.GetComponent.<GUIText>().fontStyle = FontStyle.BoldAndItalic;
}

function OnMouseExit(){
	gameObject.GetComponent.<GUIText>().fontStyle = FontStyle.Normal;
}

function OnMouseUp(){
    gameObject.Find("MyFPS").SendMessage("Resume", true);
}