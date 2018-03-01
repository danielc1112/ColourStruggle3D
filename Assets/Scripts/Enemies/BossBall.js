/*
Author: Daniel Campbell 2012
Attach To: "BossBall" Rigidbody
*/

private var myTransform : Transform;
private var myRigidbody : Rigidbody;
private var fpsCamTransform : Transform;

var randomInitVelocity : boolean = false;
var randVelMax : float = 5;
var initVelocity : Vector3;

//controlling ball velocities
private var ball2UpVelocity : float = 8;
private var ball4UpVelocity : float = 11;
private var ball8UpVelocity : float = 14;

private var bTimeSlowOn : boolean = false;

//chase Player
var minForceDistSqr : float = 25;
var minForce : float = 0.5;
var maxForceDistSqr : float = 10000;
var maxForce : float = 5;
private var forceDiff : float;
private var forceDistSqrDiff : float;

//Taking damage
private var bulletVel : Vector3;
var noOfHitsNeeded : int = 3;
private var noOfHits : int = 0;
private var bTakingDamage : boolean;
private var takingDamageTimer : float = 0;
var damageWobblePeriod : float = 0.5;
private var noOfWobbles : int = 0;
var noOfWobblesNeeded : int = 3;
//use a quadratic curve for scale/color when taking damage

var minBlueGreenColor : float = 0.3;
private var quadraticAColor : float;
private var quadraticBColor : float;

var maxScale : float = 1.2;
private var maxScaleTemp : float;
private var quadraticAScale : float;
private var quadraticBScale : float;
private var origScale : float;

//Shadows
var BallShadow : GameObject;
private var BallShadowClone : GameObject[];
private var pointLight : GameObject[];
private var shadowOffset : float;
private var myShadowTransform : Transform[];
var shadowClearDistSqr : float = 400;

//Explosions
var Size2Explosion : ParticleEmitter;
var Size4Explosion : ParticleEmitter;
var Size8Explosion : ParticleEmitter;
private var outgoingVelocity : float = 5;

//Ball sounds
var ballSize2Sound : AudioClip;
var ballSize4Sound : AudioClip;
var ballSize8Sound : AudioClip;
var ballPoppingSound : AudioClip;
var bossBigLaughSound : AudioClip[]; //size = 3
var bossBigLaughStart : AudioClip;
var bossBigLaughEnd : AudioClip;
var bossLaughSound : AudioClip[]; //size = 3
var bossLaughStart : AudioClip;
var bossLaughEnd : AudioClip;
var bossBabyLaughSound : AudioClip[]; //size = 3
var bossBabyLaughStart : AudioClip;
var bossBabyLaughEnd : AudioClip;
private var richochetSound : AudioClip;

private var fpsLevelManager : LevelManager;
private var myFPS : FPS;

private var childBall : boolean = false;

function GetIsTakingDamage(): boolean{
	return bTakingDamage;
}
function SetIsTakingDamage(bValue : boolean){
	bTakingDamage = bValue;
}

function Awake() {
	
	fpsLevelManager = GameObject.Find("MyFPS").GetComponent(LevelManager);
	richochetSound = fpsLevelManager.richochetSound;
	fpsLevelManager.incrementAllBalls();

	gameObject.tag = "Enemy";	
}
	
function Start(){
	bTakingDamage = false;
	takingDamageTimer = 0;
	noOfWobbles = 0;
	noOfHits = 0;
	
	myTransform = transform;
	myRigidbody = GetComponent.<Rigidbody>();
		
	if(!childBall){
		if(!randomInitVelocity)
			myRigidbody.velocity = initVelocity;
		else
			myRigidbody.velocity = Random.insideUnitSphere * randVelMax;
	}
	else
		outgoingVelocity = fpsLevelManager.outgoingVelocity;
	
	//chasing player
	fpsCamTransform = GameObject.Find("FirstPersonCharacter").transform;		
	forceDiff = maxForce - minForce;
	forceDistSqrDiff = maxForceDistSqr - minForceDistSqr;
	
	//damage:color
	quadraticAColor = -4*(minBlueGreenColor-1);
	quadraticBColor = -quadraticAColor;
	
	//damage:scale
	origScale = myTransform.localScale.x;
	maxScaleTemp = maxScale * origScale;
	quadraticAScale = -4*(maxScaleTemp - origScale);
	quadraticBScale = -quadraticAScale;	
	
	//shadows
	pointLight = GameObject.FindGameObjectsWithTag("MyLight");
		
	BallShadowClone = new GameObject[pointLight.Length];
	myShadowTransform = new Transform[pointLight.Length];	
		
	//make new shadow, if there isn't one inherited from parent ball, otherwise use inherited shadow
	//this also determines if it's a child ball or not, so assign initvelocity if it isn't
	
	for(var i : int = 0; i < pointLight.Length; i++){
		BallShadowClone[i] = Instantiate(BallShadow, myTransform.position, Quaternion.identity);
		BallShadowClone[i].transform.parent = myTransform;	
		myShadowTransform[i] = myTransform.GetChild(i).transform;
	}	
	
	var projs = myTransform.GetComponentsInChildren(Projector);
	
	if(myTransform.localScale.x == 2){
		for(var proj : Projector in projs)
			proj.orthographicSize = 2;
		GetComponent.<AudioSource>().clip = ballSize2Sound;	
	}
	else if(myTransform.localScale.x == 4){
		for(var proj : Projector in projs)
			proj.orthographicSize = 4;
		GetComponent.<AudioSource>().clip = ballSize4Sound;			
	}
	else if(myTransform.localScale.x == 8){
		for(var proj : Projector in projs)
			proj.orthographicSize = 8;
		GetComponent.<AudioSource>().clip = ballSize8Sound;			
	}	
	
	shadowOffset = myTransform.localScale.x/2;

	yield WaitForSeconds(2);
	
	if(myTransform.localScale.x == 2)
		AudioSource.PlayClipAtPoint(bossBabyLaughStart, myTransform.position);
	else if(myTransform.localScale.x == 4)
		AudioSource.PlayClipAtPoint(bossLaughStart, myTransform.position);
	else if(myTransform.localScale.x == 8)
		AudioSource.PlayClipAtPoint(bossBigLaughStart, myTransform.position);		
}

function GetTimeSlow() : boolean{
	return bTimeSlowOn;
}

function SetTimeSlow(myValue : boolean){
	bTimeSlowOn = myValue;
}

function FixedUpdate () {

	//shadows
	var lightToBall : Vector3[] = new Vector3[pointLight.Length];
	
	for(var i : int; i < pointLight.Length; i++){
		lightToBall[i] = myTransform.position - pointLight[i].transform.position;
		
		if(lightToBall[i].sqrMagnitude < shadowClearDistSqr){
			myShadowTransform[i].gameObject.SetActive(true);		
		
			lightToBall[i].Normalize();
			myShadowTransform[i].position = myTransform.position + shadowOffset*lightToBall[i];
			myShadowTransform[i].rotation = Quaternion.LookRotation(lightToBall[i]);
		}
		else
			myShadowTransform[i].gameObject.SetActive(false);
	}

	//Always look at player
	myTransform.rotation = Quaternion.LookRotation(myTransform.position - fpsCamTransform.position);

	//Chase player with force
	var bossToFpsCam : Vector3 = fpsCamTransform.position - myTransform.position;
	bossToFpsCam.y = 0;
	var bossToFpsCamDistSqr : float = bossToFpsCam.sqrMagnitude;
	bossToFpsCam.Normalize();
	
	if(bossToFpsCamDistSqr < minForceDistSqr)
		myRigidbody.AddForce(bossToFpsCam*minForce*Time.deltaTime);
	else if(bossToFpsCamDistSqr > minForceDistSqr && bossToFpsCamDistSqr < maxForceDistSqr){
		var medForce : float = minForce + forceDiff*(bossToFpsCamDistSqr - minForceDistSqr)/forceDistSqrDiff;	
		myRigidbody.AddForce(bossToFpsCam*medForce*Time.deltaTime);
	}
	else if(bossToFpsCamDistSqr > maxForceDistSqr)
		myRigidbody.AddForce(bossToFpsCam*maxForce*Time.deltaTime);
	
	//Taking damage
	if(bTakingDamage){		
		if(takingDamageTimer < damageWobblePeriod){
			timerRatio = takingDamageTimer/damageWobblePeriod;
			var newScale : float = origScale + timerRatio*(timerRatio*quadraticAScale + quadraticBScale);
			myTransform.localScale = Vector3(newScale, newScale, newScale);

			GetComponent.<Renderer>().material.color.b = timerRatio*(timerRatio*quadraticAColor + quadraticBColor) + 1;
			GetComponent.<Renderer>().material.color.g = GetComponent.<Renderer>().material.color.b;

			takingDamageTimer += Time.deltaTime;			
		}
		else{			
			noOfWobbles++;
			takingDamageTimer = 0;
			if(noOfWobbles > noOfWobblesNeeded - 1){
				bTakingDamage = false;
				myTransform.localScale = Vector3(origScale, origScale, origScale);
				GetComponent.<Renderer>().material.color.b = 1;
				GetComponent.<Renderer>().material.color.g = 1;
				noOfWobbles = 0;

				if(noOfHits > noOfHitsNeeded - 1)
					DestroySelf(bulletVel);
			}	
		}
	}
	
}

function OnCollisionEnter (myCollision : Collision) {
	if(myCollision.gameObject.name == "MyFPS")
		myFPS.PlayerHitByBall(gameObject);
	else {
		if(!bTimeSlowOn){
			if(myCollision.gameObject.name == "Floor"){		
				if(transform.localScale.x == 2){
					GetComponent.<Rigidbody>().velocity.y = ball2UpVelocity;
				}
				else if(transform.localScale.x == 4){
					GetComponent.<Rigidbody>().velocity.y = ball4UpVelocity;
				}
				else if(transform.localScale.x == 8){
					GetComponent.<Rigidbody>().velocity.y = ball8UpVelocity;
				}				
			}	
	    }
	    
	    if(myCollision.gameObject.name.StartsWith("Bullet") && 
	    !myCollision.gameObject.name.StartsWith("BulletAK47")){
	    	if(!bTakingDamage){
				BossHitByBullet();
				bulletVel = myCollision.gameObject.GetComponent.<Rigidbody>().velocity;
				Destroy(myCollision.gameObject); //destroy bullet	    	
			}
			else{
				AudioSource.PlayClipAtPoint(richochetSound, transform.position);
			}			
	    }
	    
	    //if the ball hits anything except another ball, play SFX depending on size
		if(!myCollision.gameObject.name.StartsWith("Ball") && !myCollision.gameObject.name.StartsWith("Bullet")){
			GetComponent.<AudioSource>().Play();
		}
	}
}

function BossHitByBullet(){
	noOfHits++;
	bTakingDamage = true;  
	if(noOfHits < noOfHitsNeeded){
		if(transform.localScale.x == 2)
			AudioSource.PlayClipAtPoint(bossBabyLaughSound[Random.Range(0, 2)], transform.position);
		else if(transform.localScale.x == 4)
			AudioSource.PlayClipAtPoint(bossLaughSound[Random.Range(0, 2)], transform.position);
		else if(transform.localScale.x == 8)
			AudioSource.PlayClipAtPoint(bossBigLaughSound[Random.Range(0, 2)], transform.position);			
	}
	else {
		if(transform.localScale.x == 2)
			AudioSource.PlayClipAtPoint(bossBabyLaughEnd, transform.position);
		else if(transform.localScale.x == 4)
			AudioSource.PlayClipAtPoint(bossLaughEnd, transform.position);
		else if(transform.localScale.x == 8)
			AudioSource.PlayClipAtPoint(bossBigLaughEnd, transform.position);			
	}
}

function SetAsChildBall(){
	childBall = true;
	gameObject.tag = "Enemy";
	bTakingDamage = false;
}

private function DestroySelf(bulletVel : Vector3){	
	var myExplosion : ParticleEmitter;
	
	var childBall1 : GameObject;
	var childBall2 : GameObject;
	var childBall3 : GameObject;	
	
	if(myTransform.localScale.x != 2){
		//triplicates into primary colors
		var direction1 : Vector3  = -Vector3.up;
		var direction2 : Vector3  = 0.5*Vector3.up - 0.866*Vector3.right;
		var direction3 : Vector3  = 0.5*Vector3.up + 0.866*Vector3.right;
		
		childBall1 = Instantiate(gameObject, myTransform.position, Quaternion.identity);
		childBall2 = Instantiate(gameObject, myTransform.position, Quaternion.identity);	
		childBall3 = Instantiate(gameObject, myTransform.position, Quaternion.identity);
			
		childBall1.transform.localScale = 0.5*myTransform.localScale; 
		childBall1.transform.position = myTransform.TransformPoint(direction1);
		childBall1.GetComponent.<Rigidbody>().velocity = outgoingVelocity*myTransform.TransformDirection(direction1);
	  			     
		childBall2.transform.localScale = 0.5*myTransform.localScale; 		  
		childBall2.transform.position =  myTransform.TransformPoint(direction2);		  
		childBall2.GetComponent.<Rigidbody>().velocity = outgoingVelocity*myTransform.TransformDirection(direction2);
			     
		childBall3.transform.localScale = 0.5*myTransform.localScale; 		  
		childBall3.transform.position =  myTransform.TransformPoint(direction3);		  
		childBall3.GetComponent.<Rigidbody>().velocity = outgoingVelocity*myTransform.TransformDirection(direction3);	
	
		childBall1.GetComponent.<Rigidbody>().velocity.y = 1.5*outgoingVelocity;
		childBall2.GetComponent.<Rigidbody>().velocity.y = 1.5*outgoingVelocity;	
		childBall3.GetComponent.<Rigidbody>().velocity.y = 1.5*outgoingVelocity;

		childBall1.SendMessage("SetAsChildBall");
		childBall2.SendMessage("SetAsChildBall");
		childBall3.SendMessage("SetAsChildBall");
						
		if(myFPS.bTimeSlowOn){
			childBall1.GetComponent.<Rigidbody>().velocity *= myFPS.slowMotionRate;
			childBall2.GetComponent.<Rigidbody>().velocity *= myFPS.slowMotionRate;
			childBall3.GetComponent.<Rigidbody>().velocity *= myFPS.slowMotionRate;
			childBall1.SendMessage("TimeSlowOn");
			childBall2.SendMessage("TimeSlowOn");
			childBall3.SendMessage("TimeSlowOn");
		}
	
//	fpsPickupManager.SpawnRandomPickUp(myTransform.position);	
	
	}	
				
	if(myTransform.localScale.x == 2)
		myExplosion = Instantiate(Size2Explosion, myTransform.position, Quaternion.identity);
	else if(myTransform.localScale.x == 4)
		myExplosion = Instantiate(Size4Explosion, myTransform.position, Quaternion.identity);
	else if(myTransform.localScale.x == 8)
		myExplosion = Instantiate(Size8Explosion, myTransform.position, Quaternion.identity);	
	
//	AudioSource.PlayClipAtPoint(ballPoppingSound, myTransform.position);	
	fpsLevelManager.decrementAllBalls();
	Destroy(gameObject);		
}
