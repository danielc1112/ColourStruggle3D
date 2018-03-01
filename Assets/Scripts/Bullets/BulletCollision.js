/*
Author: Daniel Campbell 2011/12
Attach To: "Bullet.." Rigidbody
*/

var bulletSplat : GameObject;
var bulletColor : MyColor = MyColor.Blue;
private var bulletSplatSound : AudioClip;
private var richochetSound : AudioClip;

private var fpsLevelManager : LevelManager;

function Start(){
	fpsLevelManager = GameObject.Find("MyFPS").GetComponent(LevelManager);
	
	//prefabs/variables from level Manager
	bulletSplatSound = fpsLevelManager.bulletSplatSound;
	richochetSound = fpsLevelManager.richochetSound;
}

function GetNextColor(aColor : MyColor, aCycleBy : int){
	var Result : int = aColor + aCycleBy;
	
	if(Result >= 6)
		Result -= 6;
    else if (Result < 0)
    	Result += 6;

	return Result;
}

function OnCollisionEnter (myCollision : Collision) {
	if(myCollision.gameObject.name.StartsWith("Ball") && !myCollision.gameObject.name.StartsWith("BallBlack")){
		var EnemyScript : Enemy = myCollision.gameObject.GetComponent("Enemy") as Enemy;
		var collisionColor : MyColor = EnemyScript.GetColor();

		//enum MyColor {Red, Purple, Blue, Green, Yellow, Orange}		 
		if(collisionColor == GetNextColor(bulletColor, 0)){
			//destroy the ball with explosion/childballs,pickup etc
			EnemyScript.DestroySelf(GetComponent.<Rigidbody>().velocity);				
	        Destroy(gameObject); //destroy bullet
	    }    
	    else if(collisionColor == GetNextColor(bulletColor, 2)){
			//gets absorbed, turns ball into green ball	
			EnemyScript.AssignMyColor(GetNextColor(bulletColor, 1));
			Destroy(gameObject); //destroy bullet
		}	
		else if(collisionColor == GetNextColor(bulletColor, 4)){
			//gets absorbed, turns ball into purple ball	
			EnemyScript.AssignMyColor(GetNextColor(bulletColor, 5));
			Destroy(gameObject); //destroy bullet
		}	
		else if(collisionColor == GetNextColor(bulletColor, 1)){
			AudioSource.PlayClipAtPoint(richochetSound, transform.position);
		}	
		else if(collisionColor == GetNextColor(bulletColor, 5)){
			AudioSource.PlayClipAtPoint(richochetSound, transform.position);
		}
		else if(collisionColor == GetNextColor(bulletColor, 3)){
			EnemyScript.DestroySelfTriplet(GetComponent.<Rigidbody>().velocity);				
	        Destroy(gameObject); //destroy bullet        
		}	
		else if(myCollision.gameObject.name.StartsWith("BallBoss")){
		}
	}
	else {  //bullet must have hit a wall/floor/object in level
		//bullet hit a switch		
		if (myCollision.gameObject.name.StartsWith("Switch")){
			var SwitchScript : Switch = myCollision.gameObject.GetComponent("Switch") as Switch;
			var switchColor : MyColor = SwitchScript.GetColor();
			if (bulletColor == GetNextColor(switchColor, 0)){
				SwitchScript.GotHitBySameColorBullet();
			}
		}
		
		Destroy(gameObject); //destroy bullet
		var contact : ContactPoint = myCollision.contacts[0];
		var splatOrientation : Quaternion = Quaternion.FromToRotation(Vector3.up, contact.normal);
		var splatPosition : Vector3 = contact.point + 0.1*contact.normal;		
		
		AudioSource.PlayClipAtPoint(bulletSplatSound, splatPosition);
		Instantiate(bulletSplat, splatPosition, splatOrientation);
	}	
	
}