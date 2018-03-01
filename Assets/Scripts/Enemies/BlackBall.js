#pragma strict
/*
Author: Daniel Campbell 2011/12
Attach To: "Ball" Rigidbody
*/

private var myTransform : Transform;
private var myRigidbody : Rigidbody;
private var myScale : float;

var ballSize1Sound : AudioClip;
var ballSize2Sound : AudioClip;
var ballSize4Sound : AudioClip;
var ballSize8Sound : AudioClip;

var randomInitVelocity : boolean = false;
var randVelMax : float = 5;
var initVelocity : Vector3;

//controlling ball velocities
private var ball1UpVelocity : float = 5;
private var ball2UpVelocity : float = 8;
private var ball4UpVelocity : float = 11;
private var ball8UpVelocity : float = 14;

private var bTimeSlowOn : boolean = false;
var horizForce : float = 0.1;
var sqrHorizThreshold : float = 36;

//Shadows
var BallShadow : GameObject;
private var BallShadowClone : GameObject[];
private var pointLight : GameObject[];
private var shadowOffset : float;
private var myShadowTransform : Transform[];
var shadowClearDistSqr : float = 400;

private var ball : GameObject;
private var ballCube : GameObject;

private var fpsLevelManager : LevelManager;
private var myFPS : FPS;

function Awake(){
	fpsLevelManager = GameObject.Find("MyFPS").GetComponent(LevelManager);
	myFPS = GameObject.Find("MyFPS").GetComponent(FPS);
	myTransform = transform;
	myRigidbody = GetComponent.<Rigidbody>();	
}

function Start () {
	myScale = myTransform.localScale.x;
			
	//ball sounds
	if(myScale == 1)
		GetComponent.<AudioSource>().clip = ballSize1Sound;
	else if(myScale == 2)
		GetComponent.<AudioSource>().clip = ballSize2Sound;
	else if(myScale == 4)
		GetComponent.<AudioSource>().clip = ballSize4Sound;
	else if(myScale == 8)
		GetComponent.<AudioSource>().clip = ballSize8Sound;
								
	if(!randomInitVelocity)
		myRigidbody.velocity = initVelocity;
	else
		myRigidbody.velocity = Random.insideUnitSphere * randVelMax;		
	
	//shadows
	pointLight = GameObject.FindGameObjectsWithTag("MyLight");
		
	BallShadowClone = new GameObject[pointLight.Length];
	myShadowTransform = new Transform[pointLight.Length];	
	
	for(var i : int = 0; i < pointLight.Length; i++){
		BallShadowClone[i] = Instantiate(BallShadow, myTransform.position, Quaternion.identity);
		BallShadowClone[i].transform.parent = myTransform;	
		myShadowTransform[i] = myTransform.GetChild(i).transform;
	}	
		
	var projs = myTransform.GetComponentsInChildren(Projector);		
	for(var proj : Projector in projs)
		proj.orthographicSize = myScale;
		
	shadowOffset = myScale/2;
	GetComponent.<Rigidbody>().mass = myScale*myScale*myScale; //assumes minradius = 1
	
	ball = fpsLevelManager.ball;	
}

function TimeSlowOn(){
	bTimeSlowOn = true;
}
function TimeSlowOff(){
	bTimeSlowOn = false;
}

function FixedUpdate(){

	//maintain horizontal velocity
	if(!bTimeSlowOn){
		var horizVel : Vector3 = myRigidbody.velocity;
		horizVel.y = 0;
		if(horizVel.sqrMagnitude < sqrHorizThreshold)
			myRigidbody.AddForce(horizVel.normalized*horizForce*Time.deltaTime);
	}
	
	//shadows
	var lightToBall : Vector3[];
	lightToBall = new Vector3[pointLight.Length];
	
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
		
}

function OnCollisionEnter (myCollision : Collision) {

	if(myCollision.gameObject.name == "MyFPS")
		myFPS.PlayerHitByBall(gameObject);
	else {
		if(!bTimeSlowOn){
			if(myCollision.gameObject.name == "Floor"){		
				if(myTransform.localScale.x == 1){
					myRigidbody.velocity.y = ball1UpVelocity;			
				}
				else if(myTransform.localScale.x == 2){
					myRigidbody.velocity.y = ball2UpVelocity;
				}
				else if(myTransform.localScale.x == 4){
					myRigidbody.velocity.y = ball4UpVelocity;
				}
				else if(myTransform.localScale.x == 8){
					myRigidbody.velocity.y = ball8UpVelocity;
				}				
			}	
	    }
		//if the ball hits anything except another ball, play SFX depending on size
		if(!myCollision.gameObject.name.StartsWith("Ball") && !myCollision.gameObject.name.StartsWith("Bullet")){			
			GetComponent.<AudioSource>().Play();
		}	    
	}		
}
