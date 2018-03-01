#pragma strict
static var ShakeTime : float = 5;
private var ShakeTimer : float = 0;
var ShakeAmount : float = 0.6;
private var bShakeOn : boolean = false; 
var earthquakeSound : AudioClip;

function Update () {
	if(bShakeOn){
		if(ShakeTimer <= 0){
			ShakeTime = 0;
			bShakeOn = false;
		}
		else if(ShakeTimer > 0){
			transform.localPosition = Random.insideUnitCircle * ShakeAmount;
			ShakeTimer -= Time.deltaTime;
		}
	}
}

function Shake(){
	bShakeOn = true;
	ShakeTimer = ShakeTime;
	AudioSource.PlayClipAtPoint(earthquakeSound, transform.position);
}