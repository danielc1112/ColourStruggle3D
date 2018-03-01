
#pragma strict
import System.Text.RegularExpressions;
import LightningBolt;

private var myName : String;
private var myNameLength : int;
static var isParent : boolean;
private var myScale : float;
private var partner : GameObject;
private var fpsLevelManager : LevelManager;
private var ball : GameObject;
private var ballPoppingSound : AudioClip;

var antiForce : float = 10000;

var LightningPrefab : GameObject;
var EmptyLightningPrefab : GameObject;
private var EmptyLightningClone : GameObject;

private var myEnemyScript : Enemy;
private var myMaterials : MaterialManager;

function GetEmptyLightningClone(){
	return EmptyLightningClone;
}

function GetLightningChild(){
	return LightningPrefab;
}

function Start () {

	myScale = transform.localScale.x;
	fpsLevelManager = GameObject.Find("MyFPS").GetComponent(LevelManager);	
	myEnemyScript = gameObject.GetComponent("Enemy") as Enemy;
	myMaterials = GameObject.Find("MyFPS").GetComponent("MaterialManager") as MaterialManager;
	if(myMaterials == null)
		Debug.Log("can't find material manager");
	ballPoppingSound = myEnemyScript.ballPoppingSound;
	if(GetComponent(Cube) == null)
	    ball = fpsLevelManager.ballAnti;
	else  
		ball = fpsLevelManager.ballCubeAnti;
	//find out if it's a parent from the name
	myName = gameObject.name;
	myNameLength = myName.Length;	
	isParent = myName.EndsWith("Z") || myName.EndsWith("Y") || myName.EndsWith("X") || myName.EndsWith("W");		
						
	EmptyLightningClone = Instantiate(EmptyLightningPrefab, transform.position, Quaternion.identity);	
	EmptyLightningClone.transform.parent = transform;
	LightningPrefab.transform.parent = transform;
	var lightningScript : LightningBolt = LightningPrefab.GetComponent("LightningBolt") as LightningBolt;
	if(lightningScript == null)
		Debug.Log("can't find my own lightningscript");	
	lightningScript.target = EmptyLightningClone.transform;
	lightningScript.enabled = false;
	if(!isParent){
		FindAndSetPartner(); //a parent does not have a partner		
	}	
	AssignLightningColor();
					
}

function SetPartner(partnerp : GameObject){
	partner = partnerp;
	if(partner != null){
		var partnerAntiScript : Anti = partner.GetComponent("Anti") as Anti;
		var partnerLightning : GameObject = partnerAntiScript.GetLightningChild();
		var lightningScript : LightningBolt = LightningPrefab.GetComponent("LightningBolt") as LightningBolt;
		if(lightningScript == null)
			Debug.Log("can't find my partner's lightningscript");		
		lightningScript.enabled = true;			
		lightningScript.target = partnerLightning.transform;	
	}		
}

function FindAndSetPartner(){
	myName = gameObject.name;
	myNameLength = myName.Length;	
	var Name : String = String.Copy(myName);
	Name = Name.Remove(myNameLength-1, 1);//remove 1 char from the end	
	if(myName.EndsWith("1"))
		Name = Name + "2";		
	else if(myName.EndsWith("2"))
		Name = Name + "1";
	else if(myName.EndsWith("3"))
		Name = Name + "4";	
	else if(myName.EndsWith("4"))
		Name = Name + "3";
	else if(myName.EndsWith("5"))
		Name = Name + "6";
	else if(myName.EndsWith("6"))
		Name = Name + "5";	
	else if(myName.EndsWith("7"))
		Name = Name + "8";
	else if(myName.EndsWith("8"))
		Name = Name + "7";					

	partner = GameObject.Find(Name);	
	if(partner != null){
		partner.SendMessage("SetPartner", gameObject);	
		var partnerAntiScript : Anti = partner.GetComponent("Anti") as Anti;
		var partnerLightning : GameObject = partnerAntiScript.GetLightningChild();
        var lightningScript : LightningBolt = LightningPrefab.GetComponent("LightningBolt") as LightningBolt;
		if(lightningScript == null)
			Debug.Log("can't find my partner's lightningscript");        		
		lightningScript.enabled = true;			
		lightningScript.target = partnerLightning.transform;		
	}
}

function AssignLightningColor(){
//	Debug.Log("AssignLightningColor!");
	var myLightningColor : MyColor;
	var lightningScript : LightningBolt = LightningPrefab.GetComponent("LightningBolt") as LightningBolt;	
	if(partner != null){
		//get partner's color
		var partnerEnemyScript : Enemy = partner.GetComponent("Enemy") as Enemy;
		var partnerColor : MyColor = partnerEnemyScript.GetColor();
		
		//if antiballs are the same color, lightning color matches
		if(myEnemyScript.GetColor() == partnerColor)
			myLightningColor = partnerColor;
		else{ //if antiballs are combinations of primary colors, they can't be secondary
			if((myEnemyScript.GetColor() == MyColor.Red && partnerColor == MyColor.Blue)
			|| (myEnemyScript.GetColor() == MyColor.Blue && partnerColor == MyColor.Red)){
				myLightningColor = MyColor.Purple;
			}
			else if((myEnemyScript.GetColor() == MyColor.Red && partnerColor == MyColor.Yellow)
			|| (myEnemyScript.GetColor() == MyColor.Yellow && partnerColor == MyColor.Red)){
				myLightningColor = MyColor.Orange;
			}
			else if((myEnemyScript.GetColor() == MyColor.Yellow && partnerColor == MyColor.Blue)
			|| (myEnemyScript.GetColor() == MyColor.Blue && partnerColor == MyColor.Yellow)){
				myLightningColor = MyColor.Green;
			}			
		}	
	}
	else
		myLightningColor = myEnemyScript.GetColor(); //if it's a parent just set lightning color to its own color
		
//	Debug.Log(myLightningColor);	
	switch(myLightningColor){
		case (MyColor.Red):
			lightningScript.myColor = Color(150,0,0,1);
			break;
		case (MyColor.Blue):
			lightningScript.myColor = Color(0,0,255,1);
			break;
		case (MyColor.Yellow):
			lightningScript.myColor = Color(150,150,0,1);
			break;
		case (MyColor.Green):
			lightningScript.myColor = Color(0,150,0,1);
			break;
		case (MyColor.Orange):
			lightningScript.myColor = Color(255,127,0,1);
			break;
		case (MyColor.Purple):
			lightningScript.myColor = Color(150,0,150,1);
			break;
		default:
			Debug.Log("Lightning has no color!");																
			break;
	}
}

function Update(){
	if(partner != null){
		//The antiforce at work between partners
		var MeToPartner : Vector3 = partner.transform.position - transform.position;
		var PartnerDistSqr : float = MeToPartner.sqrMagnitude;
		var antiForceVector : Vector3 = GetComponent.<Rigidbody>().mass*antiForce*MeToPartner.normalized/PartnerDistSqr;		
		GetComponent.<Rigidbody>().AddForce(antiForceVector);
	}

}

function OnCollisionEnter (myCollision : Collision) {
	//joining together
	var potentialPartner : GameObject = myCollision.gameObject;	
	if(potentialPartner == partner && gameObject.name.EndsWith("1")){	
		//destroy both anti balls and created parent antiball
		var parentPos : Vector3 = ((potentialPartner.transform.position - gameObject.transform.position)/2)
		  + gameObject.transform.position;								
		var parent : GameObject = Instantiate(ball, parentPos, Quaternion.identity);		
		var parentName : String = String.Copy(gameObject.name);						
		parent.transform.localScale = 2*gameObject.transform.localScale;
	
		//this keeps density constant when doubling the radius
		parent.GetComponent.<Rigidbody>().mass = GetComponent.<Rigidbody>().mass*((parent.transform.localScale.x*parent.transform.localScale.x*parent.transform.localScale.x)
		                         /(myScale*myScale*myScale));
		
		//give parent a velocity that conserves momentum mv = m1v1 + m2v2
		parent.GetComponent.<Rigidbody>().velocity = potentialPartner.GetComponent.<Rigidbody>().mass*potentialPartner.GetComponent.<Rigidbody>().velocity 
		                   + GetComponent.<Rigidbody>().mass*GetComponent.<Rigidbody>().velocity;
		parent.GetComponent.<Rigidbody>().velocity /= parent.GetComponent.<Rigidbody>().mass;
		parent.name = parentName.Remove(parentName.Length-1, 1);
				
		//destroy both anti balls
		var collisionAntiScript : Anti = potentialPartner.GetComponent("Anti") as Anti;								
		collisionAntiScript.DestroySelfAnti();
		DestroySelfAnti();
		fpsLevelManager.incrementAllBalls();		
	}		
}

function DestroySelfAnti(){	
	var explosionPrefab : ParticleEmitter[];					
	var BallColor : MyColor = myEnemyScript.GetColor();	
	if(myScale == 1){
		explosionPrefab = myMaterials.Size1Explosion;
	}
	else if(myScale == 2){
		explosionPrefab = myMaterials.Size2Explosion;		
	}
	else if(myScale == 4){
		explosionPrefab = myMaterials.Size4Explosion;
	}
	else if(myScale == 8){
		explosionPrefab = myMaterials.Size8Explosion;
	}			
	Instantiate(explosionPrefab[BallColor], transform.position, Quaternion.identity);
	AudioSource.PlayClipAtPoint(ballPoppingSound, transform.position);
	fpsLevelManager.decrementAllBalls();	
			
	Destroy(EmptyLightningClone);
	Destroy(LightningPrefab);
	Destroy(gameObject);
}