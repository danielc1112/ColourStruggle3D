/*
Author: Daniel Campbell 2011/12
Attach To: "BubbleGun" Transform
*/

static var paused : boolean = false;

//Shooting
var Bprojectile : Rigidbody;
var Yprojectile : Rigidbody;
var Rprojectile : Rigidbody;
var Pprojectile : Rigidbody;
var Oprojectile : Rigidbody;
var Gprojectile : Rigidbody;

var bulletSpeed : float = 50.0;
var bubbleShotSound : AudioClip;
var reloadSound : AudioClip;
var reloadSoundVolume : float = 0.4;
var maxAllowedBullets : int = 10;

//GUI
var redBallTexture : Texture;
var blueBallTexture : Texture;
var yellowBallTexture : Texture;

//Reloading
private var blueBullets : int = 0;
private var redBullets : int = 0;
private var yellowBullets : int = 0;

private var BArmed1 : boolean = false;
private var BArmed2 : boolean = false;
private var YArmed1 : boolean = false;
private var YArmed2 : boolean = false;
private var RArmed1 : boolean = false;
private var RArmed2 : boolean = false;

private var fpsCollider : Collider;

//gun direction lagging
var bGunLagging : boolean = true;
private var origGunPos : Vector3;
var gunSpeed : float = 2;
var moveAmount : float = 1;

//bullet homing
static var bHoming : boolean = false;
var initialHomingMultiplier : float = 0.35;

private var myFPS : FPS;

var normalMaterial : Material;
var homingMaterial : Material;

function Start(){
	fpsCollider = GameObject.Find("MyFPS").GetComponent.<Collider>();
	origGunPos = transform.localPosition;
	myFPS = GameObject.Find("MyFPS").GetComponent("FPS");
	GetComponent.<Renderer>().material = normalMaterial;
}

function OnGUI(){
	var leftBullets : int;
	var rightBullets : int;
	var leftBulletTexture : Texture;
	var rightBulletTexture : Texture;
	
	if(YArmed1){ //yellow
		leftBullets = yellowBullets;
		leftBulletTexture = yellowBallTexture;
	}
	else if(RArmed1){ //red
		leftBullets = redBullets;
		leftBulletTexture = redBallTexture;
	}
	else if(BArmed1){ //blue
		leftBullets = blueBullets;
		leftBulletTexture = blueBallTexture;
	}
	
	if(YArmed2){//yellow
		rightBullets = yellowBullets;
		rightBulletTexture = yellowBallTexture;
	}
	else if(RArmed2){ //red
		rightBullets = redBullets;
		rightBulletTexture = redBallTexture;
	}
	else if(BArmed2){ //blue
		rightBullets = blueBullets;
		rightBulletTexture = blueBallTexture;
	}
	
	for(var i:int =0; i<leftBullets; i++){
		GUI.DrawTexture(Rect(5 + 45*i,Screen.height - 50,40,40), leftBulletTexture);
	}
	for(var j:int =0; j<rightBullets; j++){
		GUI.DrawTexture(Rect(Screen.width - 50 - 45*j,Screen.height - 50,40,40), rightBulletTexture);
	}

}

function Update () {
	var bulletDirection : Vector3;
	var randCircle : Vector2;
	//gun lagging
	if(bGunLagging)
		GunLaggingUpdate();	
	
	//firing
	if (Input.GetButtonDown("Fire1") && !paused){
		randCircle = Random.insideUnitCircle;
		bulletDirection = Vector3(myFPS.GetInaccuracy()*randCircle.x, myFPS.GetInaccuracy()*randCircle.y, 0)
		 + Vector3.forward*bulletSpeed;
		Fire1Update(bulletDirection);
	}
	else if (Input.GetButtonDown("Fire2") && !paused){
		randCircle = Random.insideUnitCircle;
		bulletDirection = Vector3(myFPS.GetInaccuracy()*randCircle.x, myFPS.GetInaccuracy()*randCircle.y, 0)
		 + Vector3.forward*bulletSpeed;
		Fire2Update(bulletDirection);	
	}
	else if (Input.GetButtonDown("Fire3") && !paused){
		randCircle = Random.insideUnitCircle;
		bulletDirection = Vector3(myFPS.GetInaccuracy()*randCircle.x, myFPS.GetInaccuracy()*randCircle.y, 0)
		 + Vector3.forward*bulletSpeed;
		Fire3Update(bulletDirection);
	}	
}

private function Homing(bulletClone : Rigidbody, bulletColor : MyColor){
	if(!bHoming){
		bulletClone.gameObject.Find("FireWithBall").SetActive(false);
	}
	else{
		bulletClone.gameObject.GetComponent("HomingBullet").enabled = true;
		bulletClone.gameObject.SendMessage("SetBulletColorEnum", bulletColor);
		bulletClone.velocity *= initialHomingMultiplier;
	}
}

private function GunLaggingUpdate(){	
	var MoveOnX : float = Input.GetAxis("Mouse X") * Time.deltaTime * moveAmount;
	var MoveOnY : float = Input.GetAxis("Mouse Y") * Time.deltaTime * moveAmount;
	var newGunPos : Vector3 = Vector3(origGunPos.x + MoveOnX, origGunPos.y + MoveOnY, origGunPos.z);
	transform.localPosition = Vector3.Lerp(transform.localPosition, newGunPos, gunSpeed * Time.deltaTime);
}

private function Fire1Update(bulletDirection : Vector3){
	var clone1 : Rigidbody;
	if(BArmed1 && blueBullets != 0){
		clone1 = Instantiate(Bprojectile, transform.position, transform.rotation);
		Physics.IgnoreCollision(clone1.GetComponent.<Collider>(), fpsCollider);			
		clone1.position = transform.TransformPoint(0, 0.2, 0);
		clone1.velocity = transform.TransformDirection (bulletDirection);
		AudioSource.PlayClipAtPoint(bubbleShotSound, transform.position);			
		blueBullets--;
		GetComponent.<Animation>().PlayQueued("BubbleGunAnim", QueueMode.PlayNow);
		CheckBlueBullets();		
		Homing(clone1, MyColor.Blue);		
	}
	else if(RArmed1 && redBullets != 0){
		clone1 = Instantiate(Rprojectile, transform.position, transform.rotation);
		Physics.IgnoreCollision(clone1.GetComponent.<Collider>(), fpsCollider);
		clone1.position = transform.TransformPoint(0, 0.2, 0);
		clone1.velocity = transform.TransformDirection (bulletDirection);
		AudioSource.PlayClipAtPoint(bubbleShotSound, transform.position);			
		redBullets--;
		GetComponent.<Animation>().PlayQueued("BubbleGunAnim", QueueMode.PlayNow);
		CheckRedBullets();
		Homing(clone1, MyColor.Red);
	}
	else if(YArmed1 && yellowBullets != 0){
		clone1 = Instantiate(Yprojectile, transform.position, transform.rotation);
		Physics.IgnoreCollision(clone1.GetComponent.<Collider>(), fpsCollider);
		clone1.position = transform.TransformPoint(0, 0.2, 0);
		clone1.velocity = transform.TransformDirection (bulletDirection);
		AudioSource.PlayClipAtPoint(bubbleShotSound, transform.position);			
		yellowBullets--;
		GetComponent.<Animation>().PlayQueued("BubbleGunAnim", QueueMode.PlayNow);
		CheckYellowBullets();
		Homing(clone1, MyColor.Yellow);		
	}
}

private function Fire2Update(bulletDirection : Vector3){
	var clone2 : Rigidbody;
	if(BArmed2 && blueBullets != 0){
		clone2 = Instantiate(Bprojectile, transform.position, transform.rotation);
		Physics.IgnoreCollision(clone2.GetComponent.<Collider>(), fpsCollider);
		clone2.position = transform.TransformPoint(0, 0.2, 0);
		clone2.velocity = transform.TransformDirection (bulletDirection);
		AudioSource.PlayClipAtPoint(bubbleShotSound, transform.position);			
		blueBullets--;
		GetComponent.<Animation>().PlayQueued("BubbleGunAnim", QueueMode.PlayNow);
		CheckBlueBullets();
		Homing(clone2, MyColor.Blue);
	}
	else if(RArmed2 && redBullets != 0){
		clone2 = Instantiate(Rprojectile, transform.position, transform.rotation);
		Physics.IgnoreCollision(clone2.GetComponent.<Collider>(), fpsCollider);
		clone2.position = transform.TransformPoint(0, 0.2, 0);
		clone2.velocity = transform.TransformDirection (bulletDirection);
		AudioSource.PlayClipAtPoint(bubbleShotSound, transform.position);			
		redBullets--;
		GetComponent.<Animation>().PlayQueued("BubbleGunAnim", QueueMode.PlayNow);
		CheckRedBullets();
		Homing(clone2, MyColor.Red);
	}
	else if(YArmed2 && yellowBullets != 0){
		clone2 = Instantiate(Yprojectile, transform.position, transform.rotation);
		Physics.IgnoreCollision(clone2.GetComponent.<Collider>(), fpsCollider);
		clone2.position = transform.TransformPoint(0, 0.2, 0);
		clone2.velocity = transform.TransformDirection (bulletDirection);
		AudioSource.PlayClipAtPoint(bubbleShotSound, transform.position);			
		yellowBullets--;
		GetComponent.<Animation>().PlayQueued("BubbleGunAnim", QueueMode.PlayNow);
		CheckYellowBullets();
		Homing(clone2, MyColor.BallYellow);
	}	
}

private function Fire3Update(bulletDirection : Vector3){
	var clone3 : Rigidbody;
	if(((YArmed1 && BArmed2) || (BArmed1 && YArmed2)) && blueBullets != 0 && yellowBullets != 0){
		clone3 = Instantiate(Gprojectile, transform.position, transform.rotation);
		Physics.IgnoreCollision(clone3.GetComponent.<Collider>(), fpsCollider);
		clone3.position = transform.TransformPoint(0, 0.2, 0);
		clone3.velocity = transform.TransformDirection (bulletDirection);
		AudioSource.PlayClipAtPoint(bubbleShotSound, transform.position);			
		blueBullets--;
		yellowBullets--;
		GetComponent.<Animation>().PlayQueued("BubbleGunAnim", QueueMode.PlayNow);
		CheckBlueBullets();
		CheckYellowBullets();
		Homing(clone3, MyColor.Green);
	}
	else if(((RArmed1 && BArmed2) || (BArmed1 && RArmed2)) && blueBullets != 0 && redBullets != 0){
		clone3 = Instantiate(Pprojectile, transform.position, transform.rotation);
		Physics.IgnoreCollision(clone3.GetComponent.<Collider>(), fpsCollider);
		clone3.position = transform.TransformPoint(0, 0.2, 0);
		clone3.velocity = transform.TransformDirection (bulletDirection);
		AudioSource.PlayClipAtPoint(bubbleShotSound, transform.position);			
		redBullets--;
		blueBullets--;
		GetComponent.<Animation>().PlayQueued("BubbleGunAnim", QueueMode.PlayNow);
		CheckRedBullets();
		CheckBlueBullets();
		Homing(clone3, MyColor.Purple);
	}
	else if(((YArmed1 && RArmed2) || (RArmed1 && YArmed2)) && redBullets != 0 && yellowBullets != 0){
		clone3 = Instantiate(Oprojectile, transform.position, transform.rotation);
		Physics.IgnoreCollision(clone3.GetComponent.<Collider>(), fpsCollider);
		clone3.position = transform.TransformPoint(0, 0.2, 0);
		clone3.velocity = transform.TransformDirection (bulletDirection);
		AudioSource.PlayClipAtPoint(bubbleShotSound, transform.position);			
		yellowBullets--;
		redBullets--;
		GetComponent.<Animation>().PlayQueued("BubbleGunAnim", QueueMode.PlayNow);
		CheckYellowBullets();
		CheckRedBullets();
		Homing(clone3, MyColor.Orange);
	}	
}

//RELOADING: if the coloured bullet being reloaded doesn't already exist make it primary(1), if another colour is primary
//then make it secondary(2)

function ReloadBlue(){
	if(blueBullets < maxAllowedBullets){ //if blue has full bullets already do nothing
		AudioSource.PlayClipAtPoint(reloadSound, transform.position, reloadSoundVolume);
		blueBullets = maxAllowedBullets;
		
		if(!BArmed1 && !BArmed2){
			BArmed1 = true;
			//if red or yellow are left, push them right and disarm the right
			if(RArmed1){
				//push right
				RArmed1 = false;
				RArmed2 = true;
				//disarm right
				YArmed2  = false;
				yellowBullets = 0;
			}
			else if(YArmed1){
				//push right
				YArmed1 = false;
				YArmed2 = true;
				//disarm right
				RArmed2  = false;
				redBullets = 0;				
			}
		}		
	}
}

function ReloadRed(){
	if(redBullets < maxAllowedBullets){
		AudioSource.PlayClipAtPoint(reloadSound, transform.position, reloadSoundVolume);
		redBullets = maxAllowedBullets;

		if(!RArmed1 && !RArmed2){
			RArmed1 = true;
			//if red or yellow are left, push them right and disarm the right
			if(BArmed1){
				BArmed1 = false;
				BArmed2 = true;
				YArmed2  = false;
				yellowBullets = 0;
			}
			else if(YArmed1){
				YArmed1 = false;
				YArmed2 = true;
				BArmed2  = false;
				blueBullets = 0;				
			}
		}	
	}
}

function ReloadYellow(){
	if(yellowBullets < maxAllowedBullets){
		AudioSource.PlayClipAtPoint(reloadSound, transform.position, reloadSoundVolume);
		yellowBullets = maxAllowedBullets;

		if(!YArmed1 && !YArmed2){
			YArmed1 = true;
			//if red or yellow are left, push them right and disarm the right
			if(BArmed1){
				BArmed1 = false;
				BArmed2 = true;
				RArmed2  = false;
				redBullets = 0;	
			}
			else if(RArmed1){
				RArmed1 = false;
				RArmed2 = true;
				BArmed2  = false;
				blueBullets = 0;				
			}
		}		
	}
}

private function CheckBlueBullets(){
	if(blueBullets == 0){
		BArmed1 = false;
		BArmed2 = false;
	}
}
private function CheckRedBullets(){
	if(redBullets == 0){
		RArmed1 = false;
		RArmed2 = false;
	}
}
private function CheckYellowBullets(){
	if(yellowBullets == 0){
		YArmed1 = false;
		YArmed2 = false;
	}	
}

function ChangeGunTexture(){
	if (!bHoming)
		GetComponent.<Renderer>().material = normalMaterial;
	else
		GetComponent.<Renderer>().material = homingMaterial;		
}