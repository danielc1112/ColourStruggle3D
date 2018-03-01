//this script was found at
//http://answers.unity3d.com/questions/164638/how-to-make-the-fps-character-controller-run-and-c.html#
//I have commented out crouching

/*
Attach To: "First Person Controller" FPSInputController
*/

var walkSpeed: float = 7; // regular speed
//var crchSpeed: float = 3; // crouching speed

var runSpeed: float = 20; // run speed
private var bRunningSoundPlaying : boolean = false;
var volPerSecLoss : float = 2;

var aimTime: float = 0.25;

private var ch : CharacterController;
private var tr: Transform;
//private var dist: float; // distance to ground

private var myCamera : GameObject;

private var myFPS : FPS;

private var fpsCrosshairArray : GUITexture[];
var xCrosshairSize : float = 100;
var yCrosshairSize : float = 100;
private var x1CHPosG : float;
private var y1CHPosG : float;
private var x2CHPosG : float;
private var y2CHPosG : float;
private var unAim: boolean = false;
private var aimTimer : float = 0;
private var originalFieldOfView : float;
var minFieldOfView : float = 40;

private var mySBubbleGun : SBubbleGun;
private var originalInaccuracy : float;

var breathIn : AudioClip;
var breathOut : AudioClip;
private var breathing : boolean = false;

function Start(){
    tr = transform;
    ch = GetComponent(CharacterController);
//    dist = ch.height/2; // calculate distance to ground
	myCamera = GameObject.Find("FirstPersonCharacter");
	myFPS = GameObject.Find("MyFPS").GetComponent(FPS);
	fpsCrosshairArray = myFPS.GetCrosshairArray();
	x1CHPosG = xCrosshairSize;
	y1CHPosG = yCrosshairSize;
	x2CHPosG = xCrosshairSize;
	y2CHPosG = yCrosshairSize;		
	SetCrosshair();
	originalInaccuracy = myFPS.GetInaccuracy();
	originalFieldOfView = Camera.main.fieldOfView;
}

function SetCrosshair(){
	fpsCrosshairArray[0].pixelInset.x = -15 + x1CHPosG; 
	fpsCrosshairArray[1].pixelInset.y = -15 - y1CHPosG; 
	fpsCrosshairArray[2].pixelInset.y = -15 + y2CHPosG; 
	fpsCrosshairArray[3].pixelInset.x = -15 - x2CHPosG;
}

function Update(){
//    var vScale = 1.0;
	var speed = walkSpeed;
	
	if (Input.GetKey("left shift") || Input.GetKey("right shift")){
	    speed = runSpeed;
	}
/*
    if (Input.GetKey("c")){ // press C to crouch
        vScale = 0.5;
        speed = crchSpeed; // slow down when crouching
    }
*/
/*	
    ch.movement.maxForwardSpeed = speed; // set max speed
    
    //Running Sound
    if(ch.movement.velocity.sqrMagnitude > 225){
    	if(!bRunningSoundPlaying){
	    	GetComponent.<AudioSource>().volume = 1;
	    	GetComponent.<AudioSource>().Play();
	    	bRunningSoundPlaying = true;
    	}
    }
    else if(bRunningSoundPlaying && ch.movement.velocity.sqrMagnitude < 225){
    	GetComponent.<AudioSource>().volume -= Time.deltaTime * volPerSecLoss;
    	if(GetComponent.<AudioSource>().volume < 0.1){
    		GetComponent.<AudioSource>().Stop();
    		bRunningSoundPlaying = false;    	
    	}
    }
    */
    
    
/*
    var ultScale = tr.localScale.y; // crouch/stand up smoothly 
    tr.localScale.y = Mathf.Lerp(tr.localScale.y, vScale, 5*Time.deltaTime);
    tr.position.y += dist * (tr.localScale.y-ultScale); // fix vertical position
*/

	//Aiming
	if (Input.GetKey("e")){ // press E to aim
		if (x1CHPosG != 0){
			if(!breathing){
				AudioSource.PlayClipAtPoint(breathIn, transform.position);
				breathing = true;
			}
			
			if(myCamera.GetComponent.<Camera>().fieldOfView > minFieldOfView){ 
				myCamera.GetComponent.<Camera>().fieldOfView -= (originalFieldOfView - minFieldOfView)*Time.deltaTime/aimTime;
				
				x1CHPosG = xCrosshairSize*(1-Time.deltaTime/aimTime);
				y1CHPosG = yCrosshairSize*(1-Time.deltaTime/aimTime);
				x2CHPosG = xCrosshairSize*(1-Time.deltaTime/aimTime);
				y2CHPosG = yCrosshairSize*(1-Time.deltaTime/aimTime);			
				SetCrosshair();
			}
			else {
				x1CHPosG = 0;
				y1CHPosG = 0;
				x2CHPosG = 0;
				y2CHPosG = 0;			
				SetCrosshair();
				myFPS.SetInaccuracy(0);
				breathing = false;
			}
			unAim = false;
		}
	}
	
	if(Input.GetKeyUp("e")){
		unAim = true;
		if(!breathing){
			AudioSource.PlayClipAtPoint(breathOut, transform.position);
			breathing = true;
		}
	}
	
	if(unAim){
		if (x1CHPosG != xCrosshairSize){	
			if(myCamera.GetComponent.<Camera>().fieldOfView < originalFieldOfView){ 
				myCamera.GetComponent.<Camera>().fieldOfView += (originalFieldOfView - minFieldOfView)*Time.deltaTime/aimTime;
				
				x1CHPosG = xCrosshairSize*Time.deltaTime/aimTime;
				y1CHPosG = yCrosshairSize*Time.deltaTime/aimTime;
				x2CHPosG = xCrosshairSize*Time.deltaTime/aimTime;
				y2CHPosG = yCrosshairSize*Time.deltaTime/aimTime;			
				SetCrosshair();		
			}
			else{
				x1CHPosG = xCrosshairSize;
				y1CHPosG = yCrosshairSize;
				x2CHPosG = xCrosshairSize;
				y2CHPosG = yCrosshairSize;			
				SetCrosshair();
				myFPS.SetInaccuracy(originalInaccuracy);
				breathing = false;
			}
		}
	}
	
}


