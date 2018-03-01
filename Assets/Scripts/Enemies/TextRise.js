/*
Author: Daniel Campbell 2011/12
Attach To: "Bonus Text" TextMesh
*/

private var textRiseTimer : float = 0;
var textRiseTime : float = 1.0f;
var textRiseSpeed : float = 2;
private var fpsCam : Transform;

function Start(){
	fpsCam = GameObject.Find("FirstPersonCharacter").transform;
}

function Update () {
	textRiseTimer += Time.deltaTime;
	if(textRiseTimer < textRiseTime){
		transform.Translate(0,textRiseSpeed*Time.deltaTime,0);
		transform.rotation = Quaternion.LookRotation(transform.position - fpsCam.position);
	}
	else
		Destroy(gameObject);
}