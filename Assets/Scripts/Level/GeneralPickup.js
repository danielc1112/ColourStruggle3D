/*
Author: Daniel Campbell 2011/12
Attach To: All pickups
*/

private var myRigidbody : Rigidbody;
var destroyTime : float = 10;
var explosionPrefab : GameObject;
private var timer : float = 0;
var pickupHeight : float = 10;
var HoverForce : float = 3;
var homeForce : float = 3;

private var myFPS : FPS;
private var myTransform : Transform;
private var origPos : Vector3;


function Start(){
	myTransform = transform;	
	
	myFPS = GameObject.Find("MyFPS").GetComponent(FPS);
	myRigidbody = GetComponent.<Rigidbody>();
	myRigidbody.angularVelocity = Random.insideUnitSphere * 5;
	
	origPos = myTransform.position;
	if(gameObject.name.EndsWith("(Clone)")){
		var myNameLength : float = gameObject.name.Length;
		gameObject.name = gameObject.name.Remove(myNameLength-7, 7);//remove 1 char from the end
	}
}

function Update () {
	//Pickup Hovering
	//Every 5th frame do a raycast down. if the obstacles 
	//is static and the distance is less than pickupHeight, 
	//then provide a spring force -kx back upwards stronger 
	//than gravity, so it hovers. Force should be less if 
	//timeslow is on
	var hit : RaycastHit;
    if (Physics.Raycast(transform.position, transform.position - 2*pickupHeight*Vector3.up, hit)) {    	
        if(hit.transform.gameObject.isStatic){
        	var hitDist : float = (hit.point - transform.position).magnitude;
        	if(hitDist < 2*pickupHeight){
        		var springForce : float = HoverForce*(pickupHeight - hitDist);
        		if(myFPS.bTimeSlowOn)
        			springForce *= (1-myFPS.slowMotionRate*myFPS.slowMotionRate);        		
        		myRigidbody.AddForce(0,springForce,0);
        	}       	 
        }
    }
    
    //Horizontal force towards original Position
    var forceDir : Vector3 = origPos - transform.position;				
	forceDir.y = 0;
	if(myFPS.bTimeSlowOn)
		forceDir *= (1-myFPS.slowMotionRate*myFPS.slowMotionRate);        		
	myRigidbody.AddForce(homeForce*forceDir);	

	//normal gravity for pickup, this to compensate
	if(myFPS.bTimeSlowOn){
		myRigidbody.AddForce(0, -9.81*(1-myFPS.slowMotionRate*myFPS.slowMotionRate), 0);
	}
	
	//pickup explodes after destroyTime
	if((timer > destroyTime)){
		DestroySelf();
	}
		
	timer += Time.deltaTime;
}

function DestroySelf(){	
	Instantiate(explosionPrefab, transform.position, Quaternion.identity);	
	Destroy(gameObject);
}
