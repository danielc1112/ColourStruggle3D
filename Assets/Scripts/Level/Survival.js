#pragma strict

private var myFPS : FPS;
private var survivalSpawnPoint : Transform;
var outgoingVelocity : float;
var randVelMax : float = 5;
var levelTime : float;
private var survivalLevel : int = 1;
private var survivalTimer : float = 0;
private var nextLevelTime : float = 0;
var levelWhenSecondaryColor : int;
var levelWhenSize2 : int;
var levelWhenSize4 : int;
var levelWhenSize8 : int;
var levelWhenTransparent : int;
var levelWhenAnti : int;
var levelWhenCube : int;
var levelWhen2Balls : int;
var levelWhen3Balls : int;
var levelWhen4Balls : int;
var levelWhenBossBall : int;
var ChanceOfTrans : int;
var ChanceOfCube : int;
var ChanceOfAnti : int;
var ChanceOfBoss : int;

//prefabs
var ball : GameObject;
var ballCube : GameObject;
var ballAnti : GameObject;
var ballCubeAnti : GameObject;
var bossPrefab : GameObject;

function Awake(){
	myFPS = GetComponent(FPS);
	survivalSpawnPoint = GameObject.Find("SurvivalSpawnPoint").transform;
	survivalSpawnPoint.GetComponent.<Renderer>().enabled = false;
}

function Start () {
	myFPS.PostGUIStart();
	nextLevelTime = levelTime*(survivalLevel);
	SpawnEnemiesForLevel(survivalLevel);
	var myLevelManager : LevelManager = GetComponent(LevelManager);
	myLevelManager.SetSurvival(true);
}

function Update () {
					
	//go to next level			
	if(survivalTimer > nextLevelTime){
		survivalLevel++;
		nextLevelTime = levelTime*(survivalLevel);
		SpawnEnemiesForLevel(survivalLevel);
	}
	
	survivalTimer += Time.deltaTime;
}

function SpawnEnemiesForLevel(level : int){
	var newPosition2D : Vector2 = Random.insideUnitCircle;
	var newPosition	: Vector3;
	var newPositionRightAngle : Vector3;
	var newPositionQuarterAngle : Vector3;
	var noOfBalls : int;
	
	if((survivalLevel >= levelWhenBossBall) && (Random.Range(1,101) < ChanceOfBoss)){
		SpawnBoss();
	}
	else{		
		var couldBeTrans : boolean = (survivalLevel >= levelWhenTransparent);
		var couldBeCube : boolean = (survivalLevel >= levelWhenCube);
		var couldBeAnti : boolean = (survivalLevel >= levelWhenAnti);
	
	
		//determining the maximum size
		var maxSize : int = 1;
		if(survivalLevel >= levelWhenSize2)
			maxSize = 2;
		else if(survivalLevel >= levelWhenSize4)
			maxSize = 4;
		else if(survivalLevel >= levelWhenSize8)
			maxSize = 8;
			
		//decide number of balls to spawn
		if(survivalLevel >= levelWhen4Balls)
			noOfBalls = Random.Range(1,5);
		else if(survivalLevel >= levelWhen3Balls)
			noOfBalls = Random.Range(1,4);
		else if(survivalLevel >= levelWhen2Balls)
			noOfBalls = Random.Range(1,3);	
		else
			noOfBalls = 1;
	
		//balls spread out from the spawn point	
		if(noOfBalls >= 2)
			newPosition = Vector3(newPosition2D.x, 0, newPosition2D.y);
		if(noOfBalls >= 3)	
			newPositionRightAngle = Vector3(-newPosition.z,0,newPosition.x);
		if(noOfBalls >= 4)
			newPositionQuarterAngle = newPosition + newPositionRightAngle;	
	
		//spawn the number of balls	
		SpawnEnemy(maxSize, couldBeCube, couldBeTrans, couldBeAnti, newPosition2D);
		if(noOfBalls > 1)
			SpawnEnemy(maxSize, couldBeCube, couldBeTrans, couldBeAnti, newPosition);
		if(noOfBalls > 2)
			SpawnEnemy(maxSize, couldBeCube, couldBeTrans, couldBeAnti, newPositionRightAngle);
		if(noOfBalls > 3)
			SpawnEnemy(maxSize, couldBeCube, couldBeTrans, couldBeAnti, newPositionQuarterAngle);						
	}
}

function SpawnBoss(){
	var aBoss : GameObject = Instantiate(bossPrefab, survivalSpawnPoint.position, Quaternion.identity);
	aBoss.SendMessage("SetAsChildBall");
	aBoss.GetComponent.<Rigidbody>().velocity.y = 1.5*outgoingVelocity;
}

function SpawnEnemy(couldBeSize : int, couldBeCube : boolean, couldBeTransparent : boolean, couldBeAnti : boolean, shiftedPos : Vector3){
	var enemyPrefab : GameObject;
	var isCube : boolean = false;
	var isTrans : boolean = false;
	var isAnti : boolean = false;
	var size : int = 1;
	
	isTrans = (Random.Range(1,101) < ChanceOfTrans);
	isCube = (Random.Range(1,101) < ChanceOfCube);
	isAnti = (Random.Range(1,101) < ChanceOfAnti);	
	
	if(isCube)
		if(isAnti)
			enemyPrefab = ballCubeAnti;
		else
			enemyPrefab = ballCube;
	else
		if(isAnti)
			enemyPrefab = ballAnti;
		else
			enemyPrefab = ball;			

	//create it at the spawn position							
	var anEnemy : GameObject = Instantiate(enemyPrefab, survivalSpawnPoint.position, Quaternion.identity);	
	anEnemy.SendMessage("SetAsChildBall", isTrans);
	
	if(shiftedPos != Vector3.zero){
	//anEnemy position and velocities	
		anEnemy.transform.position = survivalSpawnPoint.TransformPoint(shiftedPos);
		anEnemy.GetComponent.<Rigidbody>().velocity = outgoingVelocity*shiftedPos;																	
		anEnemy.GetComponent.<Rigidbody>().velocity.y = 1.5*outgoingVelocity;	
	}
	else{
		anEnemy.GetComponent.<Rigidbody>().velocity = Random.insideUnitSphere * randVelMax;
		
	}	
	//set size
	size = Random.Range(1, 1 + Mathf.Log(couldBeSize, 2));
	size = Mathf.Pow(size, 2);	
	anEnemy.transform.localScale *= size;
	
	//Random enemy color
	anEnemy.SendMessage("AssignBallName", Random.Range(0, 6));
		
}