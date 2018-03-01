

//var Crosshair : GUITexture;
var CrosshairArray : GUITexture[];

var BloodTexture : GUITexture;

private var readynowdeath : boolean  = true;

//private var firstPersonControllerCameraMouse : UnityStandardAssets.Characters.FirstPerson.MouseLook;
//private var mainCameraMouse : UnityStandardAssets.Characters.FirstPerson.MouseLook;
private var characterController : CharacterController;

//Sounds
var deathSound : AudioClip;
var deathVolume : float = 0.3f;
var timewarpOnSound : AudioClip;
var timewarpOffSound : AudioClip;
var reloadSound : AudioClip;

//Weapons
var BubbleGun : GameObject;
var BubbleGunPosition : Vector3;
var AK47Gun : GameObject;
var AK47GunPosition : Vector3;
private var BubbleGunclone : GameObject;
private var AK47Gunclone : GameObject;
static var bAK47Armed : boolean = false;
private var AK47Timer : float = 0;
var AK47Time : float = 10;
var AK47FadeTime : float = 2;
private var AK47child : Transform;
var inaccuracy : float = 2;

//slow Motion
static var bTimeSlowOn : boolean = false;
var slowMotionRate : float = 0.2;
var slowMotionTime : float = 10;
private var slowMotionTimer : float = 0;
private var timerFired : boolean = false;

//Force Field
var forceFieldPrefab : GameObject;
static var bForceFieldArmed : boolean;
static var forceFieldClone : GameObject;

//OnlySmallBallsPickup
static var bOnlySmallBalls : boolean;

static var bHomingArmed : boolean;
private var homingTimer : float = 0;
var homingTime : float = 15;

var FPSRigidbodyFallerPrefab : GameObject;

private var fpsCam : Transform;
private var myPickupManager : PickupManager;
private var HeadBobbingScript : HeadBobbing;
private var BubbleGunScript : SBubbleGun;
private var AK47Script : SAK47;
private var myLevelManager : LevelManager;
private var PreservedData : SPreservedData;

private var ballSelected : boolean = false;
private var selectedEnemy : Enemy;
private var ballGrabbed : boolean = false;
private var ballFixed : boolean = false;
var selectForce : float = 1000;
var selectDistInFront : float = 20;
var selectWobbleDist : float = 0.1;
var throwVelocity : float = 5;
private var lastFPSOrientationVector : Vector3;

function Awake () {
	fpsCam = GameObject.Find("FirstPersonCharacter").transform;
	myPickupManager = GetComponent(PickupManager);
	myLevelManager = GetComponent(LevelManager);
	HeadBobbingScript = fpsCam.GetComponent(HeadBobbing);		
	//firstPersonControllerCameraMouse = GetComponent(UnityStandardAssets.Characters.FirstPerson.MouseLook);
	//mainCameraMouse = fpsCam.GetComponent(UnityStandardAssets.Characters.FirstPerson.MouseLook);
	characterController = GetComponent(CharacterController);
	selectedEnemy = null;
}

function Start() {	
	PreservedData = GameObject.Find("PreservedDataStay").GetComponent("SPreservedData");						
	if(!PreservedData.GetStartGUIOn()){		
		PrepareFPS();
	}					
	BloodTexture.enabled = false;					
	bForceFieldArmed = false;
	bOnlySmallBalls = false;
	bAK47Armed = false;	
	lastFPSOrientationVector = fpsCam.eulerAngles;
}

function PostGUIStart(){
	PrepareFPS();
	PreservedData.SetStartGUIOn(false);
}

function PrepareFPS(){
	GiveBubbleGun();
//	bAK47Armed = true;
//	GiveAK47();
	MouseAndKeyboardInput(true);
	EnableCrosshair(true);
	Cursor.lockState = CursorLockMode.Locked;
	Cursor.visible = false;	
	fpsCam.GetComponent.<AudioSource>().Play();
}

function Update () {
	
	//selecting a ball
	var FPSOrientationVector : Vector3 = fpsCam.eulerAngles;
	var hit : RaycastHit;
	if(fpsCam != null){		
		//determining if the ball is selectable
		var fwd = fpsCam.TransformDirection (Vector3.forward);
		if(!ballGrabbed){			
			if (Physics.Raycast (fpsCam.position, fwd, hit, 100)) {			
			    EnemyScript = hit.transform.GetComponent("Enemy") as Enemy;
			    if((EnemyScript != null) && (!ballSelected)){
			    	selectedEnemy = EnemyScript;		    	
	    			selectedEnemy.SelectBall(true);
	    			ballSelected = true;
	    		}
	    		else if((EnemyScript == null) && ballSelected){
	    			if(selectedEnemy != null)
	    				selectedEnemy.SelectBall(false);
	    			ballSelected = false;
	    			selectedEnemy = null;    		
	    		}
			}
		}
		
		//taking control of the ball
		if(Input.GetKey("q") && (selectedEnemy != null)){
			ballGrabbed = true;
			var inFrontOfPlayer : Vector3 =  fpsCam.position + selectDistInFront*fwd;
			var EnemyToPoint : Vector3 = inFrontOfPlayer - selectedEnemy.transform.position;
			var distToPointSqr : float = EnemyToPoint.sqrMagnitude;
			if((distToPointSqr < selectWobbleDist) || ballFixed){
				//need to determine velocity here instead
				selectedEnemy.transform.position = inFrontOfPlayer;
				ballFixed = true;
				var enemyScript : Enemy = selectedEnemy.GetComponent("Enemy") as Enemy;
				enemyScript.SetAsGrenadeBall();
			}
			else{ //Force towards select point		
				var enemyForce : Vector3 = EnemyToPoint*selectForce;
	    		if(bTimeSlowOn)
	    			enemyForce *= (1-slowMotionRate*slowMotionRate);        		
	    		selectedEnemy.GetComponent.<Rigidbody>().AddForce(enemyForce);
    		}						
		}
		else if ((selectedEnemy != null) && ballGrabbed){ //throwing the ball
			selectedEnemy.GetComponent.<Rigidbody>().velocity = throwVelocity*fwd;
			ballGrabbed = false;
			ballFixed = false;
			selectedEnemy = null;
		}			
	}
	
	lastFPSOrientationVector = FPSOrientationVector;	

	//machine gun
	if(bAK47Armed){
		if(AK47Timer < AK47Time){
			AK47Timer += Time.deltaTime; 
		}
		else if(AK47Timer > AK47Time && AK47Timer < AK47Time + AK47FadeTime){			
			AK47Gunclone.GetComponent.<Renderer>().material.color.a = 1 - (AK47Timer-AK47Time)/AK47FadeTime;			
			AK47Timer += Time.deltaTime;
		}
		else{
			bAK47Armed = false;		
			AK47Timer = 0;
			GiveBubbleGun();	
		}
	}
	
	//time slow
	if(bTimeSlowOn){
		slowMotionTimer += Time.deltaTime;
		if(slowMotionTimer >= slowMotionTime){
			bTimeSlowOn = false;
			var Enemies : GameObject[];
			Enemies = GameObject.FindGameObjectsWithTag("Enemy");
			for (var anEnemy : GameObject in Enemies) { 		
				anEnemy.GetComponent.<Rigidbody>().velocity /= slowMotionRate; 
				if(anEnemy.name.Contains("Cube"))
					anEnemy.GetComponent.<Rigidbody>().angularVelocity /= slowMotionRate;
				else
					anEnemy.SendMessage("SetTimeSlow", false);
			}
			Physics.gravity /= (slowMotionRate*slowMotionRate);
			slowMotionTimer = 0;
			AudioSource.PlayClipAtPoint(timewarpOffSound, transform.position);
		}
	}
	
	//Homing
	if(bHomingArmed){
		homingTimer += Time.deltaTime;
		if(homingTimer >= homingTime){
			bHomingArmed = false;
			if(BubbleGunclone != null){
				BubbleGunScript.bHoming = false;
				BubbleGunScript.ChangeGunTexture();
			}
		}
	}	
}

function OnControllerColliderHit(myCollision : ControllerColliderHit){
	if(myCollision.gameObject.name.StartsWith("Ball")){
		PlayerHitByBall(myCollision.gameObject);
	}
	else if(myCollision.gameObject.name == "timeSlowPickup"){	
		myPickupManager.TimeSlowPickup();
		Destroy(myCollision.gameObject);
	}
	else if(myCollision.gameObject.name == "AK47Pickup"){
		myPickupManager.AK47Pickup();
		Destroy(myCollision.gameObject);
	}
	else if(myCollision.gameObject.name == "OnlySmallBallsPickup"){
		myPickupManager.OnlySmallBallsPickup();
		Destroy(myCollision.gameObject);
	}
	else if(myCollision.gameObject.name == "ForceFieldPickup"){
		myPickupManager.ForceFieldPickup();
		Destroy(myCollision.gameObject);
	}
	else if(myCollision.gameObject.name == "HomingPickup"){
		myPickupManager.HomingPickup();
		Destroy(myCollision.gameObject);
	}	
}

function PlayerHitByBall(ball : GameObject){
	if(!bForceFieldArmed){
		if(readynowdeath){									
			Death(PreservedData.GetLevel(), ball.GetComponent.<Rigidbody>().velocity);
			ball.GetComponent.<Rigidbody>().velocity *= -1;
		}	
	}
	else {
		forceFieldClone.SendMessage("GotHit");
		yield WaitForSeconds(1);
		bForceFieldArmed = false;
	}
}

function Death(i : int, hitDirection : Vector3){
    var levelString : String = "Level" + i;

	MouseAndKeyboardInput(false);
	levelEnd = true;
	AudioSource.PlayClipAtPoint(deathSound, transform.position, deathVolume);
	EnableCrosshair(false);
//	Crosshair.enabled = false;
	BloodTexture.enabled = true;
	
	//Falling after death
	var FPSRigidbodyFaller : GameObject = Instantiate(FPSRigidbodyFallerPrefab, transform.position, Quaternion.identity);
	FPSRigidbodyFaller.transform.position.y = 3.295;
	if(!FPSRigidbodyFaller.Find("Bip001 Head").transform)
		Debug.Log("Couldn't find head");
	transform.parent = GameObject.Find("Bip001 Head").transform;
	characterController.detectCollisions = false;
	FPSRigidbodyFaller.Find("Bip001 Pelvis").GetComponent.<Rigidbody>().AddForce(30*hitDirection);	
	
	//falling gun
	if(!bAK47Armed){
		BubbleGunclone.transform.parent = null;
		BubbleGunclone.AddComponent(Rigidbody);
		BubbleGunclone.GetComponent.<Rigidbody>().AddForce(0, 100, 0);
	}
	else{
		AK47Gunclone.transform.parent = null;
		AK47Gunclone.AddComponent(Rigidbody);	
		AK47Gunclone.GetComponent.<Rigidbody>().AddForce(0, 10, 0);
	}
	
	readynowdeath = false;
	yield WaitForSeconds(4);
	readynowdeath = true;												

	//Fix falling after death				
	transform.parent = null;
	Destroy(FPSRigidbodyFaller);	
	characterController.detectCollisions = true;	
	
	//Fix falling gun
	if(!bAK47Armed){
		Destroy(BubbleGunclone);
		BubbleGunclone = null;
	}
	else{
		Destroy(AK47Gunclone);
		AK47Gunclone = null;	
	}							
																																	
	Application.LoadLevel(levelString);
}

function GiveBubbleGun(){
	Destroy(AK47Gunclone);
	AK47Gunclone = null;
	BubbleGunclone = Instantiate(BubbleGun, Vector3.zero, Quaternion.identity);	
	BubbleGunclone.transform.position = fpsCam.TransformPoint(BubbleGunPosition);
	BubbleGunclone.transform.eulerAngles = fpsCam.eulerAngles;
	BubbleGunclone.transform.parent = fpsCam;		
	
//	if(!bStartingBubbleGunAnimation)
//		BubbleGunclone.animation.PlayQueued("BubbleGunStart", QueueMode.PlayNow);
	
	BubbleGunScript = BubbleGunclone.GetComponent(SBubbleGun);
	BubbleGunScript.paused = false;
		
//	bStartingBubbleGunAnimation = false;
}

function GiveAK47(){	
	Destroy(BubbleGunclone);
	BubbleGunclone = null;
	AK47Gunclone = Instantiate(AK47Gun, Vector3.zero, Quaternion.identity);	
	AK47Gunclone.transform.position = fpsCam.TransformPoint(AK47GunPosition);
	AK47Gunclone.transform.eulerAngles = fpsCam.eulerAngles;	
	AK47Gunclone.GetComponent.<Animation>().PlayQueued("MachineGunStart", QueueMode.PlayNow);	
	AK47Gunclone.transform.parent = fpsCam;	
	AK47GunScript = AK47Gunclone.GetComponent(SAK47);
	AK47GunScript.paused = false;	
	AudioSource.PlayClipAtPoint(reloadSound, transform.position);
}

function HomingBubbleGun(){
	Debug.Log("HomingBubbleGun()");
	bHomingArmed = true;
	if(bAK47Armed){
		bAK47Armed = false;
		AK47Timer = 0;
		GiveBubbleGun();			
	}
	BubbleGunScript = BubbleGunclone.GetComponent(SBubbleGun);
	BubbleGunScript.bHoming = true;
	BubbleGunScript.ChangeGunTexture();
}

function MouseAndKeyboardInput(value : boolean){
	//firstPersonControllerCameraMouse.enabled = value;
	//mainCameraMouse.enabled = value;
	HeadBobbingScript.enabled = value;	
	if(!bAK47Armed)
		SBubbleGun.paused = !value;
	else
		SAK47.paused = !value;
}

function EnableCrosshair(value : boolean){
	for(var CH : GUITexture in CrosshairArray){
		CH.enabled = value;
	}
}

function GetCrosshairArray() : GUITexture[]{
  return CrosshairArray;
}

function GetInaccuracy() : float{
  return inaccuracy;
}

function SetInaccuracy(myValue : float){
  inaccuracy = myValue;
}

function ForceFieldUnArmed(){
	bForceFieldArmed = false;
}


