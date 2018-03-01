#pragma strict

/*
Author: Daniel Campbell 2011/12
Attach To: Ball,BallCube, AntiBalls
*/

private var myTransform : Transform;
private var myRigidbody : Rigidbody;
private var myScale : float;

var ballPoppingSound : AudioClip;

var randomInitVelocity : boolean = false;
var randVelMax : float = 5;
var initVelocity : Vector3;

var BallColor : MyColor;
private var childBall : boolean = false;

//Transparent balls
var transparentBall : boolean = false;
static var bTransparentOn : boolean = false;

private var bTimeSlowOn : boolean = false;

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
private var myMaterials : MaterialManager;
private var AntiScript : Anti;
private var CubeScript : Cube;
private var bGrenadeBall : boolean = false;
var grenadeRadius : float = 15;

function Awake () {
	fpsLevelManager = GameObject.Find("MyFPS").GetComponent(LevelManager);
	fpsLevelManager.incrementAllBalls();
	
	myMaterials = GameObject.Find("MyFPS").GetComponent(MaterialManager);
	
	myTransform = transform;
	myRigidbody = GetComponent.<Rigidbody>();	
	
	myFPS = GameObject.Find("MyFPS").GetComponent(FPS);
	fpsPickupManager = GameObject.Find("MyFPS").GetComponent(PickupManager);	
			
	//prefabs/variables from level Manager
	minRadius = fpsLevelManager.minRadius;	
//	ballCube = fpsLevelManager.ballCube;	
	outgoingVelocity = fpsLevelManager.outgoingVelocity;
	bonusText = fpsLevelManager.bonusText;
				
}

function Start(){		

	myScale = myTransform.localScale.x;
								
	if(!childBall){
		if(!randomInitVelocity)
			myRigidbody.velocity = initVelocity;
		else
			myRigidbody.velocity = Random.insideUnitSphere * randVelMax;
			
		AssignMyColor(BallColor);		
	}
	
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

	
	AntiScript = GetComponent("Anti") as Anti;
	CubeScript = GetComponent("Cube") as Cube;
	if(AntiScript != null) //anti ball
		if(CubeScript != null) //a cube
			ball = fpsLevelManager.ballCubeAnti;
		else
			ball = fpsLevelManager.ballAnti;		
	else
		if(CubeScript != null)
			ball = fpsLevelManager.ballCube;
		else
			ball = fpsLevelManager.ball;					
}

function SelectBall(selected : boolean){
	if(selected)
		GetComponent.<Renderer>().material = myMaterials.SelectedMaterials[BallColor];
	else	
		GetComponent.<Renderer>().material = myMaterials.Materials[BallColor];
}

function GetColor() : MyColor{
	return BallColor;
}

function GetIsAntiBall(){
	return (AntiScript != null);
}

function SetAsGrenadeBall(){
	bGrenadeBall = true;
}

function SetAsChildBall(bValue : boolean){
	childBall = true;
	gameObject.tag = "Enemy";
	transparentBall = bValue;
}

function AssignMyColor(name : MyColor){
	gameObject.GetComponent.<Renderer>().material = myMaterials.Materials[name];
	BallColor = name;
}

function GetTimeSlow() : boolean{
	return bTimeSlowOn;
}

function SetTimeSlow(myValue : boolean){
	bTimeSlowOn = myValue;
}

function FixedUpdate(){	
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

	if(bGrenadeBall){
		if(myCollision.gameObject.name == "MyFPS")
			myFPS.PlayerHitByBall(gameObject);
		DestroySelfExplode();
	}	
	else {
		//if the ball hits anything except another ball, play SFX depending on size
		if(!myCollision.gameObject.name.StartsWith("Ball") && !myCollision.gameObject.name.StartsWith("Bullet")){
			//i.e. no bonus now if you hit it, unless it's collided with a ball or wall
			if(myCollision.gameObject.name != "Wall")
				childBall = false;
					
			if(transparentBall){
				if(!bTransparentOn){
					//enum MyColor.BallColor is implicitly cast to an integer here
					GetComponent.<Renderer>().material = myMaterials.TransparentMaterials[BallColor];
					//ignorelayercollision(8, 9) - Levelmanager.js Awake()
					gameObject.layer = 9; //Transparent
				}
				else {
					GetComponent.<Renderer>().material = myMaterials.Materials[BallColor];
					gameObject.layer = 0; //no layer
				}
				bTransparentOn = !bTransparentOn;
			}
		}
	}
	
}

function DestroySelf(bulletVel : Vector3){	
	var myExplosion : ParticleEmitter;
	var childBall1 : GameObject;
	var childBall2 : GameObject;
	if(myScale != minRadius){           
		childBall1 = Instantiate(ball, myTransform.position, Quaternion.identity);
		childBall2 = Instantiate(ball, myTransform.position, Quaternion.identity);       		        		
                  
    	if(BallColor == MyColor.Green){	
			childBall1.SendMessage("AssignMyColor", MyColor.Blue);
			childBall2.SendMessage("AssignMyColor", MyColor.Yellow);
		}
    	else if(BallColor == MyColor.Purple){	
			childBall1.SendMessage("AssignMyColor", MyColor.Red);
			childBall2.SendMessage("AssignMyColor", MyColor.Blue);
		}
    	else if(BallColor == MyColor.Orange){	
			childBall1.SendMessage("AssignMyColor", MyColor.Yellow);
			childBall2.SendMessage("AssignMyColor", MyColor.Red);
		}
		else{
			childBall1.SendMessage("AssignMyColor", BallColor);
			childBall2.SendMessage("AssignMyColor", BallColor);
		}
		
		childBall1.SendMessage("SetAsChildBall", transparentBall);
		childBall2.SendMessage("SetAsChildBall", transparentBall);
		
		var direction1 : Vector3 = Vector3.Cross(bulletVel.normalized, Vector3.up);
		
		childBall1.transform.localScale = 0.5*myTransform.localScale; 
		childBall1.transform.position = myTransform.TransformPoint(myScale*direction1);
		childBall1.GetComponent.<Rigidbody>().velocity = outgoingVelocity*direction1;
	    		  					     
		childBall2.transform.localScale = 0.5*myTransform.localScale;		  
		childBall2.transform.position = myTransform.TransformPoint(-myScale*direction1);		  
		childBall2.GetComponent.<Rigidbody>().velocity = -childBall1.GetComponent.<Rigidbody>().velocity;		
		
		childBall1.GetComponent.<Rigidbody>().velocity.y = 1.5*outgoingVelocity;
		childBall2.GetComponent.<Rigidbody>().velocity.y = 1.5*outgoingVelocity;
		
        //bonus text
        if(childBall){
        	Instantiate(bonusText, myTransform.position, Quaternion.identity);
        	fpsLevelManager.BonusTime();
        }				
		
		//time slowing of child balls
		if(myFPS.bTimeSlowOn){
			childBall1.GetComponent.<Rigidbody>().velocity *= myFPS.slowMotionRate;
			childBall2.GetComponent.<Rigidbody>().velocity *= myFPS.slowMotionRate;
			childBall1.SendMessage("SetTimeSlow", true);
			childBall2.SendMessage("SetTimeSlow", true);
		}
					
		//set name of children for AntiBall's
		if(AntiScript != null){																					
			childBall1.name = gameObject.name + "1";
			childBall2.name = gameObject.name + "2";
			
			var Child1AntiScript : Anti = childBall1.GetComponent("Anti") as Anti;
			var Child1LightningScript : LightningBolt = Child1AntiScript.GetLightningChild().GetComponent("LightningBolt") as LightningBolt;
			Child1LightningScript.enabled = true;
			
			var Child2AntiScript : Anti = childBall2.GetComponent("Anti") as Anti;
			var Child2LightningScript : LightningBolt = Child2AntiScript.GetLightningChild().GetComponent("LightningBolt") as LightningBolt;
			Child2LightningScript.enabled = true;																
		}	
		else {//instead should spawn pickup only on first time	
			fpsPickupManager.SpawnRandomPickUp(myTransform.position);	
			
		}
	}					
	
	//explosion of parent
	if(myScale == 1)
		myExplosion = Instantiate(myMaterials.Size1Explosion[BallColor], myTransform.position, Quaternion.identity);
	else if(myScale == 2)
		myExplosion = Instantiate(myMaterials.Size2Explosion[BallColor], myTransform.position, Quaternion.identity);
	else if(myScale == 4)
		myExplosion = Instantiate(myMaterials.Size4Explosion[BallColor], myTransform.position, Quaternion.identity);
	else if(myScale == 8)
		myExplosion = Instantiate(myMaterials.Size8Explosion[BallColor], myTransform.position, Quaternion.identity);		
	
	
	fpsLevelManager.decrementAllBalls();	
	AudioSource.PlayClipAtPoint(ballPoppingSound, myTransform.position);
	
	if(AntiScript != null){
		//why do this for the parent if you are about to destroy the parent??
		var AntiScript : Anti = GetComponent("Anti") as Anti;
		var LightningScript : LightningBolt = AntiScript.GetLightningChild().GetComponent("LightningBolt") as LightningBolt;		
		LightningScript.enabled = false;
		var myLightningParticleEmitter : ParticleEmitter = AntiScript.GetLightningChild().GetComponent(ParticleEmitter);
    	var particles = myLightningParticleEmitter.particles;
    	for (var i = 0; i < particles.Length; i++) {
    		particles[i].color = Color.black;
    	}
    	myLightningParticleEmitter.particles = particles;
		LightningScript.target = AntiScript.GetEmptyLightningClone().transform;		
	}		
	Destroy(gameObject);
}

function DestroySelfExplode(){
	var myExplosion : ParticleEmitter;
	fpsPickupManager.SpawnRandomPickUp(myTransform.position);
		//explosion of parent	
	if(myScale == 1)
		myExplosion = Instantiate(myMaterials.Size1Explosion[BallColor], myTransform.position, Quaternion.identity);
	else if(myScale == 2)
		myExplosion = Instantiate(myMaterials.Size2Explosion[BallColor], myTransform.position, Quaternion.identity);
	else if(myScale == 4)
		myExplosion = Instantiate(myMaterials.Size4Explosion[BallColor], myTransform.position, Quaternion.identity);
	else if(myScale == 8)
		myExplosion = Instantiate(myMaterials.Size8Explosion[BallColor], myTransform.position, Quaternion.identity);		
	
	fpsLevelManager.decrementAllBalls();	
	AudioSource.PlayClipAtPoint(ballPoppingSound, myTransform.position);
	Destroy(gameObject);
	
	//Destroy balls around a sphere of radius r
	var Enemies : GameObject[];
	Enemies = GameObject.FindGameObjectsWithTag("Enemy");
	for (var anEnemy : GameObject in Enemies) { 		
		var toEnemy : Vector3 = anEnemy.transform.position - myTransform.position;
		if(toEnemy != Vector3.zero){
			if (toEnemy.sqrMagnitude < grenadeRadius*grenadeRadius) {
	        	var anEnemyScript : Enemy = anEnemy.GetComponent("Enemy") as Enemy;
	        	anEnemyScript.DestroySelf(toEnemy);
	        }
        }
    }
	
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
	childBall1.GetComponent.<Rigidbody>().velocity = outgoingVelocity*myTransform.TransformDirection(direction1);
  			     
	childBall2.transform.localScale = 0.5*myTransform.localScale; 		  
	childBall2.transform.position =  myTransform.TransformPoint(direction2);		  
	childBall2.GetComponent.<Rigidbody>().velocity = outgoingVelocity*myTransform.TransformDirection(direction2);
		     
	childBall3.transform.localScale = 0.5*myTransform.localScale; 		  
	childBall3.transform.position =  myTransform.TransformPoint (direction3);		  
	childBall3.GetComponent.<Rigidbody>().velocity = outgoingVelocity*myTransform.TransformDirection(direction3);
	
	childBall1.SendMessage("SetAsChildBall", transparentBall);
	childBall2.SendMessage("SetAsChildBall", transparentBall);
	childBall3.SendMessage("SetAsChildBall", transparentBall);		

	childBall1.GetComponent.<Rigidbody>().velocity.y = 1.5*outgoingVelocity;
	childBall2.GetComponent.<Rigidbody>().velocity.y = 1.5*outgoingVelocity;	
	childBall3.GetComponent.<Rigidbody>().velocity.y = 1.5*outgoingVelocity;
	
	//bonus
    if(childBall){
    	Instantiate(bonusText, myTransform.position, Quaternion.identity);
    	fpsLevelManager.BonusTime();
    }

	childBall1.SendMessage("AssignMyColor", MyColor.Yellow);
	childBall2.SendMessage("AssignMyColor", MyColor.Red);
	childBall3.SendMessage("AssignMyColor", MyColor.Blue);
	
	if(myFPS.bTimeSlowOn){
		childBall1.GetComponent.<Rigidbody>().velocity *= myFPS.slowMotionRate;
		childBall2.GetComponent.<Rigidbody>().velocity *= myFPS.slowMotionRate;
		childBall3.GetComponent.<Rigidbody>().velocity *= myFPS.slowMotionRate;
		childBall1.SendMessage("SetTimeSlow", true);
		childBall2.SendMessage("SetTimeSlow", true);
		childBall3.SendMessage("SetTimeSlow", true);
	}
		
	if(myScale == 1)
		myExplosion = Instantiate(myMaterials.Size1Explosion[BallColor], myTransform.position, Quaternion.identity);
	else if(myScale == 2)
		myExplosion = Instantiate(myMaterials.Size2Explosion[BallColor], myTransform.position, Quaternion.identity);
	else if(myScale == 4)
		myExplosion = Instantiate(myMaterials.Size4Explosion[BallColor], myTransform.position, Quaternion.identity);
	else if(myScale == 8)
		myExplosion = Instantiate(myMaterials.Size8Explosion[BallColor], myTransform.position, Quaternion.identity);		

	//set name of children. This doesn't make sense
	if(AntiScript != null){
		childBall1.name = gameObject.name + "1";
		childBall2.name = gameObject.name + "2";
		childBall3.name = gameObject.name + "3";		
	}	
			
	fpsPickupManager.SpawnRandomPickUp(myTransform.position);	
	AudioSource.PlayClipAtPoint(ballPoppingSound, myTransform.position);
	fpsLevelManager.decrementAllBalls();
	Destroy(gameObject);	
}

function DestroySelfNotSmallBalls(){	
	var myExplosion : ParticleEmitter;
	
	if(myScale != minRadius){
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
		var newPositionQuarterAngle : Vector3 = newPosition + newPositionRightAngle;
		newPositionQuarterAngle.Normalize();		
		var childBall : GameObject[];
		childBall = new GameObject[myScale];
		var i : int;
		//loop through children
		for(i = 0; i < myScale; i++){
			var clone : GameObject = Instantiate(ball, myTransform.position, Quaternion.identity);
			childBall[i] = clone;
						
			if(myFPS.bTimeSlowOn){
				childBall[i].GetComponent.<Rigidbody>().velocity *= myFPS.slowMotionRate;
				childBall[i].SendMessage("SetTimeSlow", true);
			}
			
			childBall[i].SendMessage("SetAsChildBall", transparentBall);
			childBall[i].transform.localScale = (1/myScale)*myTransform.localScale;			
			
			if(AntiScript != null){
				childBall[i].name = gameObject.name + i;			
			}																			
		}

		//childball position and velocities
		if(myScale >= 2){	
			childBall[0].transform.position = myTransform.TransformPoint(newPosition);
			childBall[0].GetComponent.<Rigidbody>().velocity = outgoingVelocity*newPosition;
			childBall[1].transform.position = myTransform.TransformPoint(-newPosition);
			childBall[1].GetComponent.<Rigidbody>().velocity = -outgoingVelocity*newPosition;					
		}
		if(myScale >= 4){	
			childBall[2].transform.position = myTransform.TransformPoint(newPositionRightAngle);
			childBall[2].GetComponent.<Rigidbody>().velocity = outgoingVelocity*newPositionRightAngle;
			childBall[3].transform.position = myTransform.TransformPoint(-newPositionRightAngle);
			childBall[3].GetComponent.<Rigidbody>().velocity = -outgoingVelocity*newPositionRightAngle;											
		}
		if(myScale >= 8){	
			childBall[6].transform.position = myTransform.TransformPoint(newPositionQuarterAngle);
			childBall[6].GetComponent.<Rigidbody>().velocity = outgoingVelocity*newPositionQuarterAngle;
			childBall[7].transform.position = myTransform.TransformPoint(-newPositionQuarterAngle);
			childBall[7].GetComponent.<Rigidbody>().velocity = -outgoingVelocity*newPositionQuarterAngle;									
		}					
		
		for(i = 0; i < myScale; i++){
			childBall[i].GetComponent.<Rigidbody>().velocity.y = 1.5*outgoingVelocity;
		}
		
		//Assign children colors								
    	if(BallColor == MyColor.Green){
    		for(i = 0; i < myScale; i = i + 2)	
				childBall[i].SendMessage("AssignMyColor", MyColor.Blue);
			for(i = 1; i < myScale; i = i + 2)	
				childBall[i].SendMessage("AssignMyColor", MyColor.Yellow);
		}
    	else if(BallColor == MyColor.Purple){
    		for(i = 0; i < myScale; i = i + 2)	
				childBall[i].SendMessage("AssignMyColor", MyColor.Red);
			for(i = 1; i < myScale; i = i + 2)	
				childBall[i].SendMessage("AssignMyColor", MyColor.Blue);
		}
    	else if(BallColor == MyColor.Orange){
    		for(i = 0; i < myScale; i = i + 2)	
				childBall[i].SendMessage("AssignMyColor", MyColor.Yellow);
			for(i = 1; i < myScale; i = i + 2)	
				childBall[i].SendMessage("AssignMyColor", MyColor.Red);
		}
		else{
			for(i = 0; i < myScale; i++)
				childBall[i].SendMessage("AssignMyColor", BallColor);
		} 	
						
		//Explosion of parent										
		if(myScale == 2)	
			myExplosion = Instantiate(myMaterials.Size2Explosion[BallColor], myTransform.position, Quaternion.identity);					
		if(myScale == 4)	
			myExplosion = Instantiate(myMaterials.Size4Explosion[BallColor], myTransform.position, Quaternion.identity);										
		if(myScale == 8)	
			myExplosion = Instantiate(myMaterials.Size8Explosion[BallColor], myTransform.position, Quaternion.identity);
					          
		fpsPickupManager.SpawnRandomPickUp(myTransform.position);								
		AudioSource.PlayClipAtPoint(ballPoppingSound, myTransform.position);
		Destroy(gameObject);
		fpsLevelManager.decrementAllBalls();                         		        								
	}					
}