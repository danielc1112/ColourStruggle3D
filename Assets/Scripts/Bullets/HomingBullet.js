#pragma strict

var homingDelay : float = 1;
private var ballToFollow : Transform;
var homingForce : float = 1;
private var thisBulletColor : MyColor;
var maxSpeed : float = 40;

function SetBulletColorEnum(bulletColor : MyColor){
	thisBulletColor = bulletColor;
}

function Start(){
	yield WaitForSeconds(homingDelay);
	ballToFollow = FindNearestBall();
}

function FixedUpdate () {
	var homingDirection : Vector3;
	if(ballToFollow != null){		
		homingDirection = (ballToFollow.position - transform.position).normalized;
		GetComponent.<Rigidbody>().AddForce(homingForce * homingDirection);
		GetComponent.<Rigidbody>().velocity = Vector3.ClampMagnitude(GetComponent.<Rigidbody>().velocity, maxSpeed);	
	}
}

private function FindNearestBall() : Transform {
	var smallestDistEnemy : Transform = null;
	var smallestDistSqr : float = 1000000;
	var distSqr : float;	
	var Enemies : GameObject[] = GameObject.FindGameObjectsWithTag("Enemy");
							
	for (var anEnemy : GameObject in Enemies) {
		var EnemyScript : Enemy = anEnemy.GetComponent("Enemy") as Enemy;
		var enemyColorEnum : MyColor = EnemyScript.GetColor();
			
		if(enemyColorEnum == thisBulletColor){
			distSqr = (transform.position - anEnemy.transform.position).sqrMagnitude;
			if(distSqr < smallestDistSqr){
				smallestDistSqr = distSqr;
				smallestDistEnemy = anEnemy.transform;
			}	
		}
	}
	return smallestDistEnemy;
}