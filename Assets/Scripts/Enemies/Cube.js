/*
Author: Daniel Campbell 2011/12
Attach To: "BallCube" Rigidbody
*/

function Start(){								
	//random spinning	
	GetComponent.<Rigidbody>().angularVelocity = Random.insideUnitSphere * 5;			
}
