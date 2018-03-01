/*
Author: Daniel Campbell 2011/12
Attach To: "First Person Controller" FPSInputController
*/
enum MyColor {Red, Purple, Blue, Green, Yellow, Orange}

var LCText : GUIText;
var ExitText : GUIText;
var ResumeText : GUIText;

private var readynow : boolean = true;
private var paused : boolean = false;

//Sounds
var finishHimSound : AudioClip;
var levelCompleteSound : AudioClip;
var ballPoppingSound : AudioClip;
var bulletSplatSound : AudioClip;
var richochetSound : AudioClip;

private var allBallsLength : int;
var minRadius : int = 1;

//Level timer
static var levelEnd : boolean = false;
var levelDuration : float = 60;
private var levelTimer : float;
private var levelTimerInt : int;
private var style = new GUIStyle();

//stuff for bullet collisions
var bonusText : GameObject;

var outgoingVelocity : float = 5;
var ball : GameObject;
var ballAnti : GameObject;
var ballCube : GameObject;
var ballCubeAnti : GameObject;
var ballSnake : GameObject;
var cubeSnake : GameObject;

private var PreservedData : SPreservedData;
private var myFPS : FPS;
private var bSurvival : boolean = false;

function Awake () {
	paused = false;
	Screen.fullScreen = true;	
	Physics.IgnoreLayerCollision(8, 9); // 8 = "Bullet", 9 = "Transparent"
	ExitText.enabled = false;
	ResumeText.enabled = false;
	PreservedData = GameObject.Find("PreservedDataStay").GetComponent("SPreservedData");
	myFPS = GetComponent(FPS);
}

function BonusTime(){
	levelTimer += 5;
}

function Start() {
	
	//Level Timer
	if(!bSurvival)
		levelTimer = levelDuration;
	else
		levelTimer = 0;	
	levelTimerInt = levelTimer;
	style.fontSize = 80;
	style.normal.textColor = Color.white;
	levelEnd = false;		
			
	Time.timeScale = 1;			
}

function incrementAllBalls(){	
	allBallsLength++;		
}

function decrementAllBalls(){
	allBallsLength--;
	if(allBallsLength == 1){
		var lastBall : GameObject = GameObject.FindGameObjectWithTag("Enemy");
		if(lastBall.transform.localScale.x == minRadius){
			AudioSource.PlayClipAtPoint(finishHimSound, transform.position);
		}
	}
	else if(allBallsLength == 0){	
		LCText.enabled = true;
		myFPS.Crosshair.enabled = false;		
		if(readynow) {		
			NewLevel(PreservedData.GetLevel() + 1);
		}	
	}
}

function SetSurvival(val : boolean){
	bSurvival = val;
}

function OnGUI () {
	if(!levelEnd && !PreservedData.GetStartGUIOn()){
		var timeMinute : int = levelTimerInt/60;
		var timeSecond : int = levelTimerInt % 60;
		var timeSecondString : String;
		if(timeSecond < 10){
			timeSecondString = "0" + timeSecond;
			GUI.Label(Rect(Screen.width/2 - 80, 10, 160, 100), timeMinute + ":" + timeSecondString, style);	
		}
		else
			GUI.Label(Rect(Screen.width/2 - 80, 10, 160, 100), timeMinute + ":" + timeSecond, style);	
		
	}
}

function Update () {
	
	if (!levelEnd && !PreservedData.GetStartGUIOn()) {
		if(!bSurvival){
			if (levelTimer > 0) {
				levelTimer -= Time.deltaTime;
				levelTimerInt = levelTimer + 1;
				if (levelTimer <= 0) {
					levelTimer = 0;
					levelTimerInt = 0;
					myFPS.Death(PreservedData.GetLevel(), Vector3.zero);
				}
				else if (levelTimer > 0 && levelTimer < 10) {
					style.normal.textColor = Color.red;
				}
			}
		}
		else{
			levelTimer += Time.deltaTime;
			levelTimerInt = levelTimer - 1;
		}
	}

	if(Input.GetButtonUp("Escape") && !PreservedData.GetStartGUIOn()){
		Resume(paused);
	}
}

function Resume(value : boolean){
	if (value){
		Cursor.lockState = CursorLockMode.Locked;		
	}
	else{
		Cursor.lockState = CursorLockMode.None;	
	}
	Cursor.visible = !value;
	//Screen.lockCursor = value;
	if(value)
		Time.timeScale = 1;
	else
		Time.timeScale = 0;
	paused = !value;
	ResumeText.enabled = !value;
	ExitText.enabled = !value;
	myFPS.EnableCrosshair(value);	
	myFPS.MouseAndKeyboardInput(value);
}

private function NewLevel(i : int){ 
    var levelString : String = "Level" + i;
    Debug.Log(levelString); 
         
	myFPS.MouseAndKeyboardInput(false);
	AudioSource.PlayClipAtPoint(levelCompleteSound, transform.position);
	readynow = false;	
	yield WaitForSeconds(2);
	readynow = true;	
	
	if(i == 10){
	  PreservedData.SetStartGUIOn(true);
	  PreservedData.SetLevel(1);
	  levelString = "Level1";
	}
	else{
	  PreservedData.SetLevel(i);
	}
	  
	Application.LoadLevel(levelString);			
}