/*
Author: Daniel Campbell 2011/12
Attach To: "PadJump" Trigger that is parented to jump pads
*/

private var myFPS : GameObject; //FPS

var jumpSpeed = 15;
var jumpPadSound : AudioClip;

private var gravity = 10.00;
private var isJumping: boolean = false;
private var bJump : boolean = false;
private var moveDirection : Vector3 = Vector3.zero; 
private var fpsCharController : CharacterController;
private var bStartGUIOn : boolean;

function Start(){
	myFPS = GameObject.Find("MyFPS");
	fpsCharController = myFPS.GetComponent(CharacterController);
	bStartGUIOn = true;
}

function StartGUIOn(bOn : boolean){
	bStartGUIOn = bOn;
}

function OnTriggerEnter(myCollision : Collider){
	if (myCollision != myFPS.GetComponent.<Collider>()) //The colliding object isn't our object
	{
		return; //don't do anything if it's not our target, the first person controller
	}
    bJump = true;
    moveDirection.y = jumpSpeed;
    AudioSource.PlayClipAtPoint(jumpPadSound, myFPS.transform.position);
}

function Update(){
	if(!bStartGUIOn){
	    if (bJump)
		    isJumping = true;
	    if (isJumping){
		    bJump = false;
		    fpsCharController.Move(moveDirection * Time.deltaTime);
	    }
	    if (fpsCharController.isGrounded)
		    isJumping = false;    
		    
	    moveDirection.y -= gravity * Time.deltaTime;
    }
}
