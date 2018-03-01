
private var myFPS : GameObject; //FPS
var target : Collider; //FPS
var slidingAcceleration : float = 3;
var slippingSound : AudioClip;
private var ch : CharacterController;
private var origMaxGroundAcceleration : float;

function Start(){
	myFPS = GameObject.Find("MyFPS");
	
	//ch = target.GetComponent(CharacterController);
	//origMaxGroundAcceleration = ch.movement.maxGroundAcceleration;
}

function OnTriggerEnter(myCollision : Collider){
	if (myCollision != myFPS.GetComponent.<Collider>()) //The colliding object isn't our object
	{
		return; //don't do anything if it's not our target, the first person controller
	}
	/*
	ch.movement.maxGroundAcceleration = slidingAcceleration;
	AudioSource.PlayClipAtPoint(slippingSound, target.transform.position);*/
}

function OnTriggerExit(myCollision : Collider){
	/*if (myCollision != target) //The colliding object isn't our object
	{
		return; //don't do anything if it's not our target, the first person controller
	}
	
	ch.movement.maxGroundAcceleration = origMaxGroundAcceleration;*/
}