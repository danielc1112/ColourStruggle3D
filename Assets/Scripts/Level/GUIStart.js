/*
Author: Daniel Campbell 2011/12
Attach To: "Empty Transform" Empty Transform in GUILevel
*/

//var mainCamera : Camera;
var startGUICamera : Camera;
private var mainCamera : GameObject;
var ClickSound : AudioClip;

var StartScreen : GameObject;
var InstructionsScreen : GameObject;
var CreditsScreen : GameObject;
private var bMainScreen : boolean = true;

private var myStyle : GUIStyle = new GUIStyle();
var normalPlay : Texture2D;
var hoverPlay : Texture2D;
var normalInstructions : Texture2D;
var hoverInstructions : Texture2D;
var normalCredits : Texture2D;
var hoverCredits : Texture2D;
var normalExit : Texture2D;
var hoverExit : Texture2D;
var normalBack : Texture2D;
var hoverBack : Texture2D;
var normalSurvival : Texture2D;
var hoverSurvival : Texture2D;

private var playTexture : Texture2D;
private var instructionsTexture : Texture2D;
private var creditsTexture : Texture2D;
private var exitTexture : Texture2D;
private var backTexture : Texture2D;
private var survivalTexture : Texture2D;

private var myFPS : FPS;
private var Balls : GameObject[];

private var PreservedData : SPreservedData;
private var myLevelManager : LevelManager;

function Start(){	
	myLevelManager = GameObject.Find("MyFPS").GetComponent(LevelManager);
	PreservedData = GameObject.Find("PreservedDataStay").GetComponent("SPreservedData");
	mainCamera = GameObject.Find("FirstPersonCharacter");
	if(PreservedData.GetStartGUIOn()){		
		myFPS = GameObject.Find("MyFPS").GetComponent(FPS);		
		mainCamera.SetActive(false);
		startGUICamera.gameObject.SetActive(true);
		
		myFPS.MouseAndKeyboardInput(false);
			
		InstructionsScreen.GetComponent(GUITexture).enabled = false;
		CreditsScreen.GetComponent(GUITexture).enabled = false;
		StartScreen.GetComponent(GUITexture).enabled = true;
	
		playTexture = normalPlay;
		instructionsTexture = normalInstructions;
		creditsTexture = normalCredits;
		exitTexture = normalExit;
		backTexture = normalBack;
		survivalTexture = normalSurvival;
		
		myStyle.fixedHeight = 0;
		myStyle.fixedWidth = 0;
		myStyle.stretchHeight = true;
		myStyle.stretchWidth = true;
			
		Balls = GameObject.FindGameObjectsWithTag("Enemy");
		EnableAllBalls(false);
	}
	else{
		mainCamera.SetActive(true);
		startGUICamera.gameObject.SetActive(false);
	}	
}

private function EnableAllBalls(bActive : boolean){	
	for (var aBall : GameObject in Balls) {
		aBall.SetActive(bActive);
	}
}

function OnGUI() {
	if(PreservedData.GetStartGUIOn()){
		if(bMainScreen){
			//clicking
			var jumpPadTriggers : GameObject[];
			if(GUI.Button(Rect(850,550,90,50), playTexture, myStyle)){
				AudioSource.PlayClipAtPoint(ClickSound, transform.position);
				StartScreen.GetComponent(GUITexture).enabled = false;			
				startGUICamera.gameObject.SetActive(false);
				mainCamera.SetActive(true);			
				EnableAllBalls(true);
				jumpPadTriggers = GameObject.FindGameObjectsWithTag("JumpPadTrigger");
				for(var aJumpPad in jumpPadTriggers){				
					aJumpPad.SendMessage("StartGUIOn", false);
				}
				myFPS.PostGUIStart();
				
			}
			else if(GUI.Button(Rect(850,625,250,45), survivalTexture, myStyle)){
				AudioSource.PlayClipAtPoint(ClickSound, transform.position);
				Application.LoadLevel("LevelS");
/*				StartScreen.GetComponent(GUITexture).enabled = false;			
				startGUICamera.gameObject.active = false;
				mainCamera.active = true;			
				EnableAllBalls(true);
				jumpPadTriggers = GameObject.FindGameObjectsWithTag("JumpPadTrigger");
				for(var aJumpPad in jumpPadTriggers){				
					aJumpPad.SendMessage("StartGUIOn", false);
				}
				myFPS.PostGUIStart();
*/
			}
			else if(GUI.Button(Rect(850,700,200,50), instructionsTexture, myStyle)){
				bMainScreen = false;
				StartScreen.GetComponent(GUITexture).enabled = false;
				InstructionsScreen.GetComponent(GUITexture).enabled = true;
				AudioSource.PlayClipAtPoint(ClickSound, transform.position);
			}
			else if(GUI.Button(Rect(850,775,100,50), creditsTexture, myStyle)){
				bMainScreen = false;
				StartScreen.GetComponent(GUITexture).enabled = false;
				CreditsScreen.GetComponent(GUITexture).enabled = true;
				AudioSource.PlayClipAtPoint(ClickSound, transform.position);
			}
			else if(GUI.Button(Rect(850,850,80,50), exitTexture, myStyle)){
				AudioSource.PlayClipAtPoint(ClickSound, transform.position);
				Application.Quit();			
			}
			
			//hovering
			if(Rect(850,550,90,50).Contains(Event.current.mousePosition))
				playTexture = hoverPlay;
			else
				playTexture = normalPlay;
			if(Rect(850,625,250,45).Contains(Event.current.mousePosition))
				survivalTexture = hoverSurvival;
			else
				survivalTexture = normalSurvival;				
			if(Rect(850,700,200,50).Contains(Event.current.mousePosition))
				instructionsTexture = hoverInstructions;
			else
				instructionsTexture = normalInstructions;
			if(Rect(850,775,100,50).Contains(Event.current.mousePosition))
				creditsTexture = hoverCredits;
			else
				creditsTexture = normalCredits;
			if(Rect(850,850,80,50).Contains(Event.current.mousePosition))
				exitTexture = hoverExit;
			else
				exitTexture = normalExit;
		}
		else {
			//clicking
			if(GUI.Button(Rect(1300,800,80,50), backTexture, myStyle)){
				bMainScreen = true;
				InstructionsScreen.GetComponent(GUITexture).enabled = false;
				CreditsScreen.GetComponent(GUITexture).enabled = false;
				StartScreen.GetComponent(GUITexture).enabled = true;
				AudioSource.PlayClipAtPoint(ClickSound, transform.position);
			}
			
			//hovering	
			if(Rect(1300,800,80,50).Contains(Event.current.mousePosition))
				backTexture = hoverBack;
			else
				backTexture = normalBack;
		}
	}
}