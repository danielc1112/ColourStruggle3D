function Start(){
	transform.parent.GetComponent.<Renderer>().material.color.a = 0.7;
}

function OnTriggerExit (collision : Collider) {
	if(collision.gameObject.name.StartsWith("Ball") && !collision.gameObject.name.StartsWith("BallBoss") && !collision.gameObject.name.StartsWith("BallBlack")){
		var randInt : int;
		var ballColor : int;
		var EnemyScript : Enemy = collision.gameObject.GetComponent("Enemy") as Enemy;			
		ballColor = EnemyScript.GetColor();			
				
		do{
			randInt = Random.Range(0, 6);
		}while(randInt == ballColor);
		
		collision.gameObject.SendMessage("AssignBallName", randInt);	
	}

}