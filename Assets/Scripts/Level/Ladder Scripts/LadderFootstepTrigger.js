/*
Author: Daniel Campbell 2011/12
Attach To: "Pad(Colour)" Trigger that is parented to all coloured pads
*/

var fps : GameObject; //FPS
var LadderFootStepSound : AudioClip[]; //size = 3
private var fpsUseLadderScript : UseLadder;

function Start(){
	fps = GameObject.Find("MyFPS");
	fpsUseLadderScript = fps.GetComponent(UseLadder);
}

function OnTriggerEnter(myCollision : Collider) {
	if (myCollision != fps.GetComponent(Collider)) //The colliding object isn't our object
	{
		return; //don't do anything if it's not our target, the first person controller
	}
	if(!fpsUseLadderScript.getVerticalMoveDirection()) //if going down the ladder use onTriggerEnter	
		AudioSource.PlayClipAtPoint(LadderFootStepSound[Random.Range(0,2)], transform.position);
		
}

function OnTriggerExit(myCollision : Collider) {
	if (myCollision != fps.GetComponent(Collider)) //The colliding object isn't our object
	{
		return; //don't do anything if it's not our target, the first person controller
	}
	if(fpsUseLadderScript.getVerticalMoveDirection())	//if going up the ladder use onTriggerExit
		AudioSource.PlayClipAtPoint(LadderFootStepSound[Random.Range(0,2)], transform.position);

}