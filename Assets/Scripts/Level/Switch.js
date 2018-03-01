#pragma strict


var switchColor : MyColor;
var door : Transform;
var doorVelocity : float = 5;
var handle : Transform;
var body : Transform;
var outer : Transform;
private var myMaterials : MaterialManager;
private var switchTimer : float = 0;
private var handleTime : float;
var handleAngularVelocity : float = 45;
private var origRotation : float;
private var bSwitching : boolean = false;
private var bDoorMoving : boolean = false;
private var bHitbybullet : boolean = false;
private var hasBeenSwitched : boolean = false;
private var origDoorPosition : float;
private var DoorHeight : float;

function Awake(){
	myMaterials = GameObject.Find("MyFPS").GetComponent(MaterialManager);
}

function Start () {
	door.GetComponent.<Renderer>().material = myMaterials.Materials[switchColor];
	handle.GetComponent.<Renderer>().material = myMaterials.Materials[switchColor];
	body.GetComponent.<Renderer>().material = myMaterials.Materials[switchColor];
	outer.GetComponent.<Renderer>().material = myMaterials.Materials[switchColor];
	
	origRotation = handle.rotation.eulerAngles.x;
	origDoorPosition = door.transform.position.y;
	DoorHeight = door.transform.localScale.y;
	handleTime = 2*(origRotation - 270) / handleAngularVelocity;
}

function GetColor() : MyColor{
	return switchColor;
}

function GotHitBySameColorBullet(){
	bHitbybullet = true;
}

function OnTriggerEnter(trigger : Collider){
	if(trigger.gameObject.name.StartsWith("Bullet")){
		bHitbybullet = true;
	}
}

function FixedUpdate () {
	//if hit by a bullet, get the door and switch moving
	if(bHitbybullet){
		bHitbybullet = false;		
		bDoorMoving = true;
		bSwitching = true;
	}

	if(bDoorMoving){ 
		if(door.transform.position.y < (origDoorPosition + DoorHeight))
			door.transform.position.y += doorVelocity*Time.fixedDeltaTime;
		else{
			door.transform.position.y = origDoorPosition + DoorHeight;
			bDoorMoving = false;
		}
	}
	if(bSwitching){
		switchTimer += Time.fixedDeltaTime;
		if(switchTimer < handleTime){
			handle.transform.Rotate(-handleAngularVelocity * Vector3.right * Time.fixedDeltaTime);
		}else{
			bSwitching = false;
			switchTimer = 0;
		}			
	}
}