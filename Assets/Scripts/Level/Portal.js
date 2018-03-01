/*
Author: Daniel Campbell 2011/12
Attach To: "Portal" Trigger
*/

var target : Collider; //FPS
var otherPortal : GameObject;
private var fpsCharController : CharacterController;
private var playerOnPad : boolean = false;
var portalRadius : float = 5;
private var radius2 : float;

var portalMaterials : Material[];
var color : MyColor;
var Sparkles : Transform;
var Sparkles2 : Transform;
var Cylinder : Transform;
var Tube : Transform;

function SetPlayerOnPad(){
	playerOnPad = true;
}

function Start(){
	target = GameObject.Find("MyFPS").GetComponent.<Collider>();
	fpsCharController = target.gameObject.GetComponent(CharacterController);
	radius2 = portalRadius*portalRadius;
	
	Cylinder.GetComponent.<Renderer>().material = portalMaterials[color];
	Tube.GetComponent.<Renderer>().material = portalMaterials[color];	
	ChangeColors(portalMaterials[color].color);
}

function Update(){
	if(playerOnPad){
		if((target.transform.position - transform.position).sqrMagnitude > radius2)
			playerOnPad = false;
	}
}

function OnTriggerEnter(myCollision : Collider){
	if (myCollision != target) //The colliding object isn't our object
	{
		return; //don't do anything if it's not our target, the first person controller
	}
	
	if(!playerOnPad){
		target.gameObject.transform.position = otherPortal.transform.position + Vector3(0,2,0);
		var otherPortalScript : Portal = otherPortal.GetComponent("Portal") as Portal;
		otherPortalScript.SetPlayerOnPad();
	} 

}

private function ChangeColors(color : Color){

	var Sparkles1PA = Sparkles.GetComponent(ParticleAnimator);
	var Sparkles2PA = Sparkles2.GetComponent(ParticleAnimator);

    var modifiedColors : Color[] = Sparkles1PA.colorAnimation;
    modifiedColors[0] = Color.white;
    modifiedColors[1] = 0.5*Color.white + 0.5*color;
    modifiedColors[2] = 0.2*Color.white + 0.8*color;
    modifiedColors[3] = color;
    Sparkles1PA.colorAnimation = modifiedColors;
    
    var modifiedColors2 : Color[] = Sparkles2PA.colorAnimation;
    modifiedColors2[0] = Color.white;
    modifiedColors2[1] = 0.5*Color.white + 0.5*color;
    modifiedColors2[2] = 0.2*Color.white + 0.8*color;
    modifiedColors2[3] = color;
    Sparkles2PA.colorAnimation = modifiedColors2;    
    
}