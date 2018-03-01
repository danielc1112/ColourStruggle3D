/*
Author: Daniel Campbell 2011/12
Attach To: "AK47" Transform
*/

static var paused : boolean = false;

private var fpsLevelManager : LevelManager;
private var myFPS : FPS;

var AK47projectile : Rigidbody;
var bulletTime : float = 0.1;
private var bulletTimer : float = 0.0f;
var bulletSpeed : float = 60.0;
var AK47ShotSound : AudioClip;
var AK47ShotVolume : float = 0.5;
var myMuzzleFlash : ParticleEmitter;
private var richochetSound : AudioClip;

private var fpsCollider : Collider;

//gun direction lagging
var bGunLagging : boolean = true;
private var origGunPos : Vector3;
var gunSpeed : float = 10;
var moveAmount : float = 10;

var bulletSplat : GameObject;
var bulletDust : GameObject;

function Start(){
	fpsCollider = GameObject.Find("MyFPS").GetComponent.<Collider>();
	origGunPos = transform.localPosition;
	fpsLevelManager = GameObject.Find("MyFPS").GetComponent(LevelManager);
	myFPS = GameObject.Find("MyFPS").GetComponent(FPS);
	richochetSound = fpsLevelManager.richochetSound;
}

function Update () {
    
	//gun lagging
	if(bGunLagging)
		GunLaggingUpdate();

	if (Input.GetMouseButton(0) && !paused) {
		if(bulletTimer > bulletTime || bulletTimer == 0.0f){
			if(!GetComponent.<Animation>().IsPlaying("MachineGunStart")){		
				var clone1 : Rigidbody;
				var fwd : Vector3;
				var randCircle : Vector2 = Random.insideUnitCircle;
				var bulletDirection : Vector3 = Vector3(myFPS.GetInaccuracy()*randCircle.x, myFPS.GetInaccuracy()*randCircle.y, 0)
		 			+ Vector3.forward*bulletSpeed;
				
				clone1 = Instantiate(AK47projectile, transform.position, transform.rotation);
				Physics.IgnoreCollision(clone1.GetComponent.<Collider>(), fpsCollider);			
				clone1.transform.position = transform.TransformPoint(-0.0006, 0.0014, 0.001);
				clone1.transform.Rotate(0, 90, 0);
				clone1.velocity = transform.TransformDirection (bulletDirection);
				AudioSource.PlayClipAtPoint(AK47ShotSound, transform.position, AK47ShotVolume);	
				
				Instantiate(myMuzzleFlash, clone1.transform.position, Quaternion.identity);		
				GetComponent.<Animation>().PlayQueued("MachineGunShoot", QueueMode.PlayNow);
	
				bulletTimer = 0.001f;
				
				//Raycast bullets				
				fwd = GameObject.Find("FirstPersonCharacter").transform.TransformDirection(bulletDirection);
				var hit : RaycastHit;
                if (Physics.Raycast (GameObject.Find("FirstPersonCharacter").transform.position, fwd, hit)) {
	                if(hit.transform.gameObject.name.StartsWith("Ball") && !hit.transform.gameObject.name.StartsWith("BallBoss")){
                		var myEnemyScript : Enemy = hit.transform.gameObject.GetComponent("Enemy") as Enemy;
                		if(!myEnemyScript.bTransparentOn){
                			myEnemyScript.DestroySelf(fwd); //destroy the ball with explosion etc	
							
						}		
					}
					else { //Raycast hit a boss or something else
						if(hit.transform.gameObject.name.StartsWith("BallBoss")){
							AudioSource.PlayClipAtPoint(richochetSound, transform.position);
						}
						
                		var splatOrientation : Quaternion = Quaternion.FromToRotation(Vector3.up, hit.normal);
						var splatPosition : Vector3 = hit.point + 0.1*hit.normal;		
					
						var splatClone : GameObject = Instantiate(bulletSplat, splatPosition, splatOrientation);
						var AK47DustClone  : GameObject = Instantiate(bulletDust, splatPosition, splatOrientation);
						
						splatClone.transform.parent = hit.transform;
						AK47DustClone.transform.parent = hit.transform;																
					}					
//					Debug.DrawLine(hit.point, hit.point + hit.normal, Color.green, 1000, false);
        		}
        		
			}
		}
		else
			bulletTimer += Time.deltaTime;	
	}
	else
		bulletTimer = 0.0f;		
}

private function GunLaggingUpdate(){	
	var MoveOnX : float = Input.GetAxis("Mouse X") * Time.deltaTime * moveAmount;
	var MoveOnY : float = Input.GetAxis("Mouse Y") * Time.deltaTime * moveAmount;
	var newGunPos : Vector3 = Vector3(origGunPos.x + MoveOnX, origGunPos.y + MoveOnY, origGunPos.z);
	transform.localPosition = Vector3.Lerp(transform.localPosition, newGunPos, gunSpeed * Time.deltaTime);
}