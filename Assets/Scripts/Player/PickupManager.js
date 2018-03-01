/*
Author: Daniel Campbell 2011/12
Attach To: "First Person Controller" FPSInputController
*/

var chanceOfPickUpPercent : float = 50;

private var fpsLevelManager : LevelManager;
private var myFPS : FPS;
private var PreservedData : SPreservedData;
private var fpsCam : Transform;
private var fpsCamShakeScript : CameraShake;

//elements: 1 = TIMESLOW, 2 = AK47, 3 = SMALLBALLS, 4 = FORCEFIELD};
var pickUpsArray : GameObject[];

function Start(){
	myFPS = GetComponent(FPS);
	PreservedData = GameObject.Find("PreservedDataStay").GetComponent("SPreservedData");		
}

function SpawnRandomPickUp(spawnPosition : Vector3) {
	var pickup : GameObject;
	var random : int;
	//ensured here: only one pickup of each kind can exist at any time
	//other pickups of the same kind should explode when it's picked up
	if(pickUpsArray.Length != 0){	
		if (Random.Range(1, 100) < chanceOfPickUpPercent){
			random = Random.Range(1, pickUpsArray.Length + 1);			
			pickup = Instantiate(pickUpsArray[random-1], spawnPosition + Vector3(0,0.5,0), Quaternion.identity);
			pickup.GetComponent.<Rigidbody>().velocity = Vector3(0, 3, 0);
		}
	}
}

//Pickup functions
function TimeSlowPickup(){
	myFPS.bTimeSlowOn = true;		
	DestroyAllPickupsWithTag("TimeSlowPickup");				
	var Balls : GameObject[] = GameObject.FindGameObjectsWithTag("Enemy");						
	for (var aBall : GameObject in Balls) { 						
		aBall.GetComponent.<Rigidbody>().velocity *= myFPS.slowMotionRate; 
		if(aBall.name.EndsWith("Cube"))
			aBall.GetComponent.<Rigidbody>().angularVelocity *= myFPS.slowMotionRate;
		else
			aBall.SendMessage("SetTimeSlow", true);		
	}	
	Physics.gravity *= (myFPS.slowMotionRate*myFPS.slowMotionRate);	
	AudioSource.PlayClipAtPoint(myFPS.timewarpOnSound, transform.position);
}

function AK47Pickup(){
	myFPS.bAK47Armed = true;		
	DestroyAllPickupsWithTag("AK47Pickup");				
	myFPS.GiveAK47();	
}

function OnlySmallBallsPickup(){
	fpsCamShakeScript = GameObject.Find("FirstPersonCharacter").GetComponent("CameraShake");
	fpsCamShakeScript.Shake();
	yield WaitForSeconds(fpsCamShakeScript.ShakeTime);	
	myFPS.bOnlySmallBalls = true;
	DestroyAllPickupsWithTag("OnlySmallBallsPickup");
	var Enemies : GameObject[] = GameObject.FindGameObjectsWithTag("Enemy");
	for (var aBall : GameObject in Enemies) { 						
		aBall.SendMessage("DestroySelfNotSmallBalls", SendMessageOptions.DontRequireReceiver);
	}
			
}

function ForceFieldPickup(){
	fpsCam = GameObject.Find("FirstPersonCharacter").transform;
	myFPS.bForceFieldArmed = true;
	DestroyAllPickupsWithTag("ForceFieldPickup");	
	myFPS.forceFieldClone = Instantiate(myFPS.forceFieldPrefab, fpsCam.position, fpsCam.rotation);
	myFPS.forceFieldClone.transform.parent = fpsCam;
	myFPS.forceFieldClone.transform.Rotate(-90, 0, 0);
	myFPS.forceFieldClone.transform.position = fpsCam.TransformPoint(0, 0, 0.4);
}

function HomingPickup(){
	DestroyAllPickupsWithTag("HomingPickup");
	myFPS.HomingBubbleGun();	
}

private function DestroyAllPickupsWithTag(tag : String){
	//destroy other pickups of the same kind
	var Pickups : GameObject[] = GameObject.FindGameObjectsWithTag(tag);
	for(var aPickup in Pickups){
		aPickup.SendMessage("DestroySelf");
	}
}
