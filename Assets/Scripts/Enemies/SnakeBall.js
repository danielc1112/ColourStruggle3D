/*
Author: Daniel Campbell 2011/12
Attach To: "BallSnake" Rigidbody
*/

private var myTransform : Transform;
private var myRigidbody : Rigidbody;

var ballSize1Sound : AudioClip;
var ballSize2Sound : AudioClip;
var ballSize4Sound : AudioClip;
var ballSize8Sound : AudioClip;
var ballPoppingSound : AudioClip;

var initVelocity : Vector3;

var BallColor : MyColor;
private var childBall : boolean = false;

//Materials
var Materials : Material[];
var Size1Explosion : ParticleEmitter[];
var Size2Explosion : ParticleEmitter[];
var Size4Explosion : ParticleEmitter[];
var Size8Explosion : ParticleEmitter[];

//Transparent balls
var TransparentMaterials : Material[];
var transparentBall : boolean = false;
static var bTransparentOn : boolean = false;

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

//Collisions/childballs from LevelManager
private var minRadius : float = 1;
private var outgoingVelocity : float = 5;
private var ball : GameObject;
private var ballCube : GameObject;
private var bonusText : GameObject;

private var fpsLevelManager : LevelManager;
private var myFPS : FPS;
private var fpsPickupManager : PickupManager;

var snakeParent : GameObject;

function GetBallColor() : MyColor{
	return BallColor;
}

function SetAsChildBall(bValue : boolean){
	childBall = true;
	gameObject.tag = "Enemy";
	transparentBall = bValue;
}

function Awake () {
	fpsLevelManager = GameObject.Find("MyFPS").GetComponent(LevelManager);
	fpsLevelManager.incrementAllBalls();
	
	myTransform = transform;
	myRigidbody = GetComponent.<Rigidbody>();	
	
	myFPS = GameObject.Find("MyFPS").GetComponent(FPS);
	fpsPickupManager = GameObject.Find("MyFPS").GetComponent(PickupManager);
	
	//prefabs/variables from level Manager
	minRadius = fpsLevelManager.minRadius;
	ball = fpsLevelManager.snakeBall;
	ballCube = fpsLevelManager.snakeCube;
	outgoingVelocity = fpsLevelManager.outgoingVelocity;
	bonusText = fpsLevelManager.bonusText;
	
	//ball sounds
	if(myTransform.localScale.x == 1)
		GetComponent.<AudioSource>().clip = ballSize1Sound;
	else if(myTransform.localScale.x == 2)
		GetComponent.<AudioSource>().clip = ballSize2Sound;
	else if(myTransform.localScale.x == 4)
		GetComponent.<AudioSource>().clip = ballSize4Sound;
	else if(myTransform.localScale.x == 8)
		GetComponent.<AudioSource>().clip = ballSize8Sound;
			
}

function Start(){	
	if(!childBall)			
		AssignMyColor(BallColor);
	
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
		proj.orthographicSize = myTransform.localScale.x;
		
	shadowOffset = myTransform.localScale.x/2;	
}

function AssignMyColor(name : MyColor){
	gameObject.GetComponent.<Renderer>().material = Materials[name];
	BallColor = name;
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
		if(snakeParent == null){ //if you are the parent
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
		}	
	
		if(!myCollision.gameObject.name.StartsWith("Ball") && !myCollision.gameObject.name.StartsWith("Bullet")){
		//i.e. no bonus now if you hit it, unless it's collided with a ball or wall
			if(myCollision.gameObject.name != "Wall")
				childBall = false;
			
			GetComponent.<AudioSource>().Play();
					
			if(transparentBall){
				if(!bTransparentOn){
					//enum MyColor.BallColor is implicitly cast to an integer here
					GetComponent.<Renderer>().material = TransparentMaterials[BallColor];
					//ignorelayercollision(8, 9) - Levelmanager.js Awake()
					gameObject.layer = 9; //Transparent
				}
				else {
					GetComponent.<Renderer>().material = Materials[BallColor];
					gameObject.layer = 0; //no layer
				}
				bTransparentOn = !bTransparentOn;
			}
		}	
	}	
		
}
/*
function DestroySelf(bulletVel : Vector3){	
	var myExplosion : ParticleEmitter;
	var childBall1 : GameObject;
	var childBall2 : GameObject;
	
	if(myTransform.localScale.x != minRadius){      
       
		childBall1 = Instantiate(ball, myTransform.position, Quaternion.identity);
		childBall2 = Instantiate(ball, myTransform.position, Quaternion.identity);        		        		
                  
    	if(BallColor == MyColor.BallGreen){	
			childBall1.SendMessage("AssignMyColor", MyColor.BallBlue);
			childBall2.SendMessage("AssignMyColor", MyColor.BallYellow);
		}
    	else if(BallColor == MyColor.BallPurple){	
			childBall1.SendMessage("AssignMyColor", MyColor.BallRed);
			childBall2.SendMessage("AssignMyColor", MyColor.BallBlue);
		}
    	else if(BallColor == MyColor.BallOrange){	
			childBall1.SendMessage("AssignMyColor", MyColor.BallYellow);
			childBall2.SendMessage("AssignMyColor", MyColor.BallRed);
		}
		else{
			childBall1.SendMessage("AssignMyColor", BallColor);
			childBall2.SendMessage("AssignMyColor", BallColor);
		}
		
		childBall1.SendMessage("SetAsChildBall", transparentBall);
		childBall2.SendMessage("SetAsChildBall", transparentBall);
		
		var direction1 : Vector3 = Vector3.Cross(bulletVel.normalized, Vector3.up);
		
		childBall1.transform.localScale = 0.5*myTransform.localScale; 
		childBall1.transform.position = myTransform.TransformPoint(direction1);
		childBall1.rigidbody.velocity = outgoingVelocity*direction1;
	    		  					     
		childBall2.transform.localScale = 0.5*myTransform.localScale;		  
		childBall2.transform.position =  myTransform.TransformPoint(-direction1);		  
		childBall2.rigidbody.velocity = -childBall1.rigidbody.velocity;		
		
		childBall1.rigidbody.velocity.y = 1.5*outgoingVelocity;
		childBall2.rigidbody.velocity.y = 1.5*outgoingVelocity;
		
        //bonus text
        if(childBall){
        	Instantiate(bonusText, myTransform.position, Quaternion.identity);
        	fpsLevelManager.BonusTime();
        }				
		
		//time slowing of child balls
		if(myFPS.bTimeSlowOn){
			childBall1.rigidbody.velocity *= myFPS.slowMotionRate;
			childBall2.rigidbody.velocity *= myFPS.slowMotionRate;
			childBall1.SendMessage("TimeSlowOn");
			childBall2.SendMessage("TimeSlowOn");
		}			
		
		fpsPickupManager.SpawnRandomPickUp(myTransform.position);	
	}					
	
	if(myTransform.localScale.x == 1)
		myExplosion = Instantiate(Size1Explosion[BallColor], myTransform.position, Quaternion.identity);
	else if(myTransform.localScale.x == 2)
		myExplosion = Instantiate(Size2Explosion[BallColor], myTransform.position, Quaternion.identity);
	else if(myTransform.localScale.x == 4)
		myExplosion = Instantiate(Size4Explosion[BallColor], myTransform.position, Quaternion.identity);
	else if(myTransform.localScale.x == 8)
		myExplosion = Instantiate(Size8Explosion[BallColor], myTransform.position, Quaternion.identity);		
	
	fpsLevelManager.decrementAllBalls();	
	AudioSource.PlayClipAtPoint(ballPoppingSound, myTransform.position);
	Destroy(gameObject);
}

function DestroySelfTriplet(bulletVel : Vector3){	
	var myExplosion : ParticleEmitter;
	
	var childBall1 : GameObject;
	var childBall2 : GameObject;
	var childBall3 : GameObject;
	
	bulletVel.y = 0;
	bulletVel.Normalize();
	var bulletVelRightAngles : Vector3 = Vector3(-bulletVel.z, 0, bulletVel.x);
	
	//triplicates into primary colors
	var direction1 : Vector3  = -bulletVel;
	var direction2 : Vector3  = 0.5*bulletVel - 0.866*bulletVelRightAngles;
	var direction3 : Vector3  = 0.5*bulletVel + 0.866*bulletVelRightAngles;
	
	childBall1 = Instantiate(ball, myTransform.position, Quaternion.identity);
	childBall2 = Instantiate(ball, myTransform.position, Quaternion.identity);	
	childBall3 = Instantiate(ball, myTransform.position, Quaternion.identity);
		
	childBall1.transform.localScale = 0.5*myTransform.localScale; 
	childBall1.transform.position = myTransform.TransformPoint(direction1);
	childBall1.rigidbody.velocity = outgoingVelocity*myTransform.TransformDirection(direction1);
  			     
	childBall2.transform.localScale = 0.5*myTransform.localScale; 		  
	childBall2.transform.position =  myTransform.TransformPoint(direction2);		  
	childBall2.rigidbody.velocity = outgoingVelocity*myTransform.TransformDirection(direction2);
		     
	childBall3.transform.localScale = 0.5*myTransform.localScale; 		  
	childBall3.transform.position =  myTransform.TransformPoint (direction3);		  
	childBall3.rigidbody.velocity = outgoingVelocity*myTransform.TransformDirection(direction3);
	
	childBall1.SendMessage("SetAsChildBall", transparentBall);
	childBall2.SendMessage("SetAsChildBall", transparentBall);
	childBall3.SendMessage("SetAsChildBall", transparentBall);		

	childBall1.rigidbody.velocity.y = 1.5*outgoingVelocity;
	childBall2.rigidbody.velocity.y = 1.5*outgoingVelocity;	
	childBall3.rigidbody.velocity.y = 1.5*outgoingVelocity;
	
	//bonus
    if(childBall){
    	Instantiate(bonusText, myTransform.position, Quaternion.identity);
    	fpsLevelManager.BonusTime();
    }

	childBall1.SendMessage("AssignMyColor", MyColor.BallYellow);
	childBall2.SendMessage("AssignMyColor", MyColor.BallRed);
	childBall3.SendMessage("AssignMyColor", MyColor.BallBlue);
	
	if(myFPS.bTimeSlowOn){
		childBall1.rigidbody.velocity *= myFPS.slowMotionRate;
		childBall2.rigidbody.velocity *= myFPS.slowMotionRate;
		childBall3.rigidbody.velocity *= myFPS.slowMotionRate;
		childBall1.SendMessage("TimeSlowOn");
		childBall2.SendMessage("TimeSlowOn");
		childBall3.SendMessage("TimeSlowOn");
	}
		
	if(myTransform.localScale.x == 1)
		myExplosion = Instantiate(Size1Explosion[BallColor], myTransform.position, Quaternion.identity);
	else if(myTransform.localScale.x == 2)
		myExplosion = Instantiate(Size2Explosion[BallColor], myTransform.position, Quaternion.identity);
	else if(myTransform.localScale.x == 4)
		myExplosion = Instantiate(Size4Explosion[BallColor], myTransform.position, Quaternion.identity);
	else if(myTransform.localScale.x == 8)
		myExplosion = Instantiate(Size8Explosion[BallColor], myTransform.position, Quaternion.identity);		
	
	fpsPickupManager.SpawnRandomPickUp(myTransform.position);	
	AudioSource.PlayClipAtPoint(ballPoppingSound, myTransform.position);
	fpsLevelManager.decrementAllBalls();
	Destroy(gameObject);	
}

function DestroySelfNotSmallBalls(){	
	var myExplosion : ParticleEmitter;
	
	if(myTransform.localScale != Vector3(minRadius, minRadius, minRadius)){
		var childBall1 : GameObject;
		var childBall2 : GameObject;
		var childBall3 : GameObject;
		var childBall4 : GameObject;
		var childBall5 : GameObject;
		var childBall6 : GameObject;
		var childBall7 : GameObject;
		var childBall8 : GameObject;		
		var newPosition2D : Vector2 = Random.insideUnitCircle;
		var newPosition	: Vector3 = Vector3(newPosition2D.x, 0, newPosition2D.y);
		var newPositionRightAngle : Vector3 = Vector3(-newPosition.z,0,newPosition.x);		
		
		if(myTransform.localScale.x == 2){      
			childBall1 = Instantiate(ball, myTransform.position, Quaternion.identity);
			childBall2 = Instantiate(ball, myTransform.position, Quaternion.identity);

	    	if(BallColor == MyColor.BallGreen){	
				childBall1.SendMessage("AssignMyColor", MyColor.BallBlue);
				childBall2.SendMessage("AssignMyColor", MyColor.BallYellow);
			}
	    	else if(BallColor == MyColor.BallPurple){	
				childBall1.SendMessage("AssignMyColor", MyColor.BallRed);
				childBall2.SendMessage("AssignMyColor", MyColor.BallBlue);
			}
	    	else if(BallColor == MyColor.BallOrange){	
				childBall1.SendMessage("AssignMyColor", MyColor.BallYellow);
				childBall2.SendMessage("AssignMyColor", MyColor.BallRed);
			}
			else{
				childBall1.SendMessage("AssignMyColor", BallColor);
				childBall2.SendMessage("AssignMyColor", BallColor);
			}        

			if(myFPS.bTimeSlowOn){
				childBall1.rigidbody.velocity *= myFPS.slowMotionRate;
				childBall2.rigidbody.velocity *= myFPS.slowMotionRate;
				childBall1.SendMessage("TimeSlowOn");
				childBall2.SendMessage("TimeSlowOn");
			}
			
			childBall1.SendMessage("SetAsChildBall", transparentBall);
			childBall2.SendMessage("SetAsChildBall", transparentBall);
			
			childBall1.transform.localScale = 0.5*myTransform.localScale; 
			childBall1.transform.position = myTransform.TransformPoint(newPosition);
			childBall1.rigidbody.velocity = outgoingVelocity*newPosition;
		    		  					     
			childBall2.transform.localScale = 0.5*myTransform.localScale;		  
			childBall2.transform.position =  myTransform.TransformPoint(-newPosition);		  
			childBall2.rigidbody.velocity = -childBall1.rigidbody.velocity;		
			
			childBall1.rigidbody.velocity.y = 1.5*outgoingVelocity;
			childBall2.rigidbody.velocity.y = 1.5*outgoingVelocity;  
						
			if(myFPS.bTimeSlowOn){
				childBall1.rigidbody.velocity *= myFPS.slowMotionRate;
				childBall2.rigidbody.velocity *= myFPS.slowMotionRate;
				childBall1.SendMessage("TimeSlowOn");
				childBall2.SendMessage("TimeSlowOn");
			}	
			         
			myExplosion = Instantiate(Size2Explosion[BallColor], myTransform.position, Quaternion.identity);
			                                                                             
        }
        else if(myTransform.localScale.x == 4){
			childBall1 = Instantiate(ball, myTransform.position, Quaternion.identity);
			childBall2 = Instantiate(ball, myTransform.position, Quaternion.identity);
			childBall3 = Instantiate(ball, myTransform.position, Quaternion.identity);
			childBall4 = Instantiate(ball, myTransform.position, Quaternion.identity);
			
	    	if(BallColor == MyColor.BallGreen){	
				childBall1.SendMessage("AssignMyColor", MyColor.BallBlue);
				childBall2.SendMessage("AssignMyColor", MyColor.BallYellow);
				childBall3.SendMessage("AssignMyColor", MyColor.BallBlue);
				childBall4.SendMessage("AssignMyColor", MyColor.BallYellow);
			}
	    	else if(BallColor == MyColor.BallPurple){	
				childBall1.SendMessage("AssignMyColor", MyColor.BallRed);
				childBall2.SendMessage("AssignMyColor", MyColor.BallBlue);
				childBall3.SendMessage("AssignMyColor", MyColor.BallRed);
				childBall4.SendMessage("AssignMyColor", MyColor.BallBlue);
			}
	    	else if(BallColor == MyColor.BallOrange){	
				childBall1.SendMessage("AssignMyColor", MyColor.BallYellow);
				childBall2.SendMessage("AssignMyColor", MyColor.BallRed);
				childBall3.SendMessage("AssignMyColor", MyColor.BallYellow);
				childBall4.SendMessage("AssignMyColor", MyColor.BallRed);
			}
			else{
				childBall1.SendMessage("AssignMyColor", BallColor);
				childBall2.SendMessage("AssignMyColor", BallColor);
				childBall3.SendMessage("AssignMyColor", BallColor);
				childBall4.SendMessage("AssignMyColor", BallColor);
			}        
			
			childBall1.SendMessage("SetAsChildBall", transparentBall);
			childBall2.SendMessage("SetAsChildBall", transparentBall);
			childBall3.SendMessage("SetAsChildBall", transparentBall);
			childBall4.SendMessage("SetAsChildBall", transparentBall);
			
			childBall1.transform.localScale = 0.25*myTransform.localScale; 
			childBall1.transform.position = myTransform.TransformPoint(newPosition);
			childBall1.rigidbody.velocity = outgoingVelocity*newPosition;
		    		  					     
			childBall2.transform.localScale = 0.25*myTransform.localScale;		  
			childBall2.transform.position =  myTransform.TransformPoint(-newPosition);		  
			childBall2.rigidbody.velocity = -childBall1.rigidbody.velocity;		
			
			childBall1.rigidbody.velocity.y = 1.5*outgoingVelocity;
			childBall2.rigidbody.velocity.y = 1.5*outgoingVelocity;  			

			childBall3.transform.localScale = 0.25*myTransform.localScale; 
			childBall3.transform.position = myTransform.TransformPoint(newPositionRightAngle);
			childBall3.rigidbody.velocity = outgoingVelocity*newPositionRightAngle;
		    		  					     
			childBall4.transform.localScale = 0.25*myTransform.localScale;		  
			childBall4.transform.position =  myTransform.TransformPoint(-newPositionRightAngle);		  
			childBall4.rigidbody.velocity = -childBall3.rigidbody.velocity;		
			
			childBall3.rigidbody.velocity.y = 1.5*outgoingVelocity;
			childBall4.rigidbody.velocity.y = 1.5*outgoingVelocity; 
																		
			if(myFPS.bTimeSlowOn){
				childBall1.rigidbody.velocity *= myFPS.slowMotionRate;
				childBall2.rigidbody.velocity *= myFPS.slowMotionRate;
				childBall3.rigidbody.velocity *= myFPS.slowMotionRate;
				childBall4.rigidbody.velocity *= myFPS.slowMotionRate;				
				childBall1.SendMessage("TimeSlowOn");
				childBall2.SendMessage("TimeSlowOn");
				childBall3.SendMessage("TimeSlowOn");
				childBall4.SendMessage("TimeSlowOn");
			}
			
			myExplosion = Instantiate(Size4Explosion[BallColor], myTransform.position, Quaternion.identity);		                          		                          
        }
        else if(myTransform.localScale.x == 8){
			childBall1 = Instantiate(ball, myTransform.position, Quaternion.identity);
			childBall2 = Instantiate(ball, myTransform.position, Quaternion.identity);
			childBall3 = Instantiate(ball, myTransform.position, Quaternion.identity);
			childBall4 = Instantiate(ball, myTransform.position, Quaternion.identity);
			childBall5 = Instantiate(ball, myTransform.position, Quaternion.identity);
			childBall6 = Instantiate(ball, myTransform.position, Quaternion.identity);
			childBall7 = Instantiate(ball, myTransform.position, Quaternion.identity);
			childBall8 = Instantiate(ball, myTransform.position, Quaternion.identity);			
			
	    	if(BallColor == MyColor.BallGreen){	
				childBall1.SendMessage("AssignMyColor", MyColor.BallBlue);
				childBall2.SendMessage("AssignMyColor", MyColor.BallYellow);
				childBall3.SendMessage("AssignMyColor", MyColor.BallBlue);
				childBall4.SendMessage("AssignMyColor", MyColor.BallYellow);
				childBall5.SendMessage("AssignMyColor", MyColor.BallBlue);
				childBall6.SendMessage("AssignMyColor", MyColor.BallYellow);
				childBall7.SendMessage("AssignMyColor", MyColor.BallBlue);
				childBall8.SendMessage("AssignMyColor", MyColor.BallYellow);				
			}
	    	else if(BallColor == MyColor.BallPurple){	
				childBall1.SendMessage("AssignMyColor", MyColor.BallRed);
				childBall2.SendMessage("AssignMyColor", MyColor.BallBlue);
				childBall3.SendMessage("AssignMyColor", MyColor.BallRed);
				childBall4.SendMessage("AssignMyColor", MyColor.BallBlue);
				childBall5.SendMessage("AssignMyColor", MyColor.BallRed);
				childBall6.SendMessage("AssignMyColor", MyColor.BallBlue);
				childBall7.SendMessage("AssignMyColor", MyColor.BallRed);
				childBall8.SendMessage("AssignMyColor", MyColor.BallBlue);				
			}
	    	else if(BallColor == MyColor.BallOrange){	
				childBall1.SendMessage("AssignMyColor", MyColor.BallYellow);
				childBall2.SendMessage("AssignMyColor", MyColor.BallRed);
				childBall3.SendMessage("AssignMyColor", MyColor.BallYellow);
				childBall4.SendMessage("AssignMyColor", MyColor.BallRed);
				childBall5.SendMessage("AssignMyColor", MyColor.BallYellow);
				childBall6.SendMessage("AssignMyColor", MyColor.BallRed);
				childBall7.SendMessage("AssignMyColor", MyColor.BallYellow);
				childBall8.SendMessage("AssignMyColor", MyColor.BallRed);				
			}
			else{
				childBall1.SendMessage("AssignMyColor", BallColor);
				childBall2.SendMessage("AssignMyColor", BallColor);
				childBall3.SendMessage("AssignMyColor", BallColor);
				childBall4.SendMessage("AssignMyColor", BallColor);
				childBall5.SendMessage("AssignMyColor", BallColor);
				childBall6.SendMessage("AssignMyColor", BallColor);
				childBall7.SendMessage("AssignMyColor", BallColor);
				childBall8.SendMessage("AssignMyColor", BallColor);				
			}        
			
			childBall1.SendMessage("SetAsChildBall", transparentBall);
			childBall2.SendMessage("SetAsChildBall", transparentBall);
			childBall3.SendMessage("SetAsChildBall", transparentBall);
			childBall4.SendMessage("SetAsChildBall", transparentBall);
			childBall5.SendMessage("SetAsChildBall", transparentBall);
			childBall6.SendMessage("SetAsChildBall", transparentBall);
			childBall7.SendMessage("SetAsChildBall", transparentBall);
			childBall8.SendMessage("SetAsChildBall", transparentBall);			
			
			childBall1.transform.localScale = 0.125*myTransform.localScale; 
			childBall1.transform.position = myTransform.TransformPoint(newPosition);
			childBall1.rigidbody.velocity = outgoingVelocity*newPosition;
		    		  					     
			childBall2.transform.localScale = 0.125*myTransform.localScale;		  
			childBall2.transform.position =  myTransform.TransformPoint(-newPosition);		  
			childBall2.rigidbody.velocity = -childBall1.rigidbody.velocity;		
			
			childBall1.rigidbody.velocity.y = 1.5*outgoingVelocity;
			childBall2.rigidbody.velocity.y = 1.5*outgoingVelocity;  

			childBall3.transform.localScale = 0.125*myTransform.localScale; 
			childBall3.transform.position = myTransform.TransformPoint(newPositionRightAngle);
			childBall3.rigidbody.velocity = outgoingVelocity*newPositionRightAngle;
		    		  					     
			childBall4.transform.localScale = 0.125*myTransform.localScale;		  
			childBall4.transform.position =  myTransform.TransformPoint(-newPositionRightAngle);		  
			childBall4.rigidbody.velocity = -childBall3.rigidbody.velocity;		
			
			childBall3.rigidbody.velocity.y = 1.5*outgoingVelocity;
			childBall4.rigidbody.velocity.y = 1.5*outgoingVelocity; 

			var newPositionQuarterAngle : Vector3 = newPosition + newPositionRightAngle;
			newPositionQuarterAngle.Normalize();
									
			childBall5.transform.localScale = 0.125*myTransform.localScale; 
			childBall5.transform.position = myTransform.TransformPoint(newPositionQuarterAngle);
			childBall5.rigidbody.velocity = outgoingVelocity*newPositionQuarterAngle;
		    		  					     
			childBall6.transform.localScale = 0.125*myTransform.localScale;		  
			childBall6.transform.position =  myTransform.TransformPoint(-newPositionQuarterAngle);		  
			childBall6.rigidbody.velocity = -childBall5.rigidbody.velocity;		
			
			childBall5.rigidbody.velocity.y = 1.5*outgoingVelocity;
			childBall6.rigidbody.velocity.y = 1.5*outgoingVelocity;

			var newPositionQuarterRightAngle : Vector3 = Vector3(-newPositionQuarterAngle.z,0,newPositionQuarterAngle.x);
									
			childBall7.transform.localScale = 0.125*myTransform.localScale; 
			childBall7.transform.position = myTransform.TransformPoint(newPositionQuarterRightAngle);
			childBall7.rigidbody.velocity = outgoingVelocity*newPositionQuarterRightAngle;
		    		  					     
			childBall8.transform.localScale = 0.125*myTransform.localScale;		  
			childBall8.transform.position =  myTransform.TransformPoint(-newPositionQuarterRightAngle);		  
			childBall8.rigidbody.velocity = -childBall7.rigidbody.velocity;		
			
			childBall7.rigidbody.velocity.y = 1.5*outgoingVelocity;
			childBall8.rigidbody.velocity.y = 1.5*outgoingVelocity;									
																		
			if(myFPS.bTimeSlowOn){
				childBall1.rigidbody.velocity *= myFPS.slowMotionRate;
				childBall2.rigidbody.velocity *= myFPS.slowMotionRate;
				childBall3.rigidbody.velocity *= myFPS.slowMotionRate;
				childBall4.rigidbody.velocity *= myFPS.slowMotionRate;
				childBall5.rigidbody.velocity *= myFPS.slowMotionRate;
				childBall6.rigidbody.velocity *= myFPS.slowMotionRate;
				childBall7.rigidbody.velocity *= myFPS.slowMotionRate;
				childBall8.rigidbody.velocity *= myFPS.slowMotionRate;								
				childBall1.SendMessage("TimeSlowOn");
				childBall2.SendMessage("TimeSlowOn");
				childBall3.SendMessage("TimeSlowOn");
				childBall4.SendMessage("TimeSlowOn");
				childBall5.SendMessage("TimeSlowOn");
				childBall6.SendMessage("TimeSlowOn");
				childBall7.SendMessage("TimeSlowOn");
				childBall8.SendMessage("TimeSlowOn");				
			}
			
			myExplosion = Instantiate(Size8Explosion[BallColor], myTransform.position, Quaternion.identity);		                          		                          
        }          
		fpsPickupManager.SpawnRandomPickUp(myTransform.position);								
		AudioSource.PlayClipAtPoint(ballPoppingSound, myTransform.position);
		Destroy(gameObject);
		fpsLevelManager.decrementAllBalls();                         		        								
	}					
}
*/