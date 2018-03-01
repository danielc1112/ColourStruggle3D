/*
Author: Daniel Campbell 2011/12
Attach To: "Ball" Rigidbody
*/
var ballSize1Sound : AudioClip;
var ballSize2Sound : AudioClip;
var ballSize4Sound : AudioClip;
var ballSize8Sound : AudioClip;
var ballPoppingSound : AudioClip;

//controlling ball velocities
private var ball1UpVelocity : float = 5;
private var ball2UpVelocity : float = 8;
private var ball4UpVelocity : float = 11;
private var ball8UpVelocity : float = 14;

var horizForce : float = 0.1;
var sqrHorizThreshold : float = 36;

private var myScale : float;
private var EnemyScript : Enemy;
private var myRigidbody : Rigidbody;

function Start(){		
	myScale = transform.localScale.x;
	myRigidbody = GetComponent.<Rigidbody>();
	EnemyScript = GetComponent("Enemy") as Enemy;
			
	//ball sounds
	if(myScale == 1)
		GetComponent.<AudioSource>().clip = ballSize1Sound;
	else if(myScale == 2)
		GetComponent.<AudioSource>().clip = ballSize2Sound;
	else if(myScale == 4)
		GetComponent.<AudioSource>().clip = ballSize4Sound;
	else if(myScale == 8)
		GetComponent.<AudioSource>().clip = ballSize8Sound;						
}

function FixedUpdate(){

	//maintain horizontal velocity
	if(!EnemyScript.GetTimeSlow()){
		var horizVel : Vector3 = myRigidbody.velocity;
		horizVel.y = 0;
		if(horizVel.sqrMagnitude < sqrHorizThreshold)
			myRigidbody.AddForce(horizVel.normalized*horizForce*Time.deltaTime);
	}		
}

function OnCollisionEnter (myCollision : Collision) {

	if(!myCollision.gameObject.name == "MyFPS"){
		if(!EnemyScript.GetTimeSlow()){
			if(myCollision.gameObject.name == "Floor"){		
				if(myScale == 1){
					myRigidbody.velocity.y = ball1UpVelocity;			
				}
				else if(myScale == 2){
					myRigidbody.velocity.y = ball2UpVelocity;
				}
				else if(myScale == 4){
					myRigidbody.velocity.y = ball4UpVelocity;
				}
				else if(myScale == 8){
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