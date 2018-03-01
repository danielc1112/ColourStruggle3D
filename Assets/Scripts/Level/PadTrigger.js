/*
Author: Daniel Campbell 2011/12
Attach To: "Pad(Colour)" Trigger that is parented to all coloured pads
*/

var target : Collider; //FPS
private var BubbleGunClone : GameObject;

function Start(){
	target = GameObject.Find("MyFPS").GetComponent.<Collider>();
}

function OnTriggerEnter(myCollision : Collider){
	if (myCollision != target) //The colliding object isn't our object
	{
		return; //don't do anything if it's not our target, the first person controller
	}

	BubbleGunClone = GameObject.Find("BubbleGun(Clone)");
	if(BubbleGunClone != null){ 
		if(gameObject.name == "BluePadTrigger"){
			BubbleGunClone.SendMessage("ReloadBlue", SendMessageOptions.DontRequireReceiver);
		}
		else if(gameObject.name == "RedPadTrigger"){
			BubbleGunClone.SendMessage("ReloadRed", SendMessageOptions.DontRequireReceiver);
		}		
		else if(gameObject.name == "YellowPadTrigger"){
			BubbleGunClone.SendMessage("ReloadYellow", SendMessageOptions.DontRequireReceiver);
		}	
	}

}