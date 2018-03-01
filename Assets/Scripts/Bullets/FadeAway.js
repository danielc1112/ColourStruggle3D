
/*
Author: Daniel Campbell 2011/12
Attach To: "BulletSplatter"(all of them) Plane with transparent texture
*/

var destroyTime : float = 10;
var fadeTime : float = 1;

private var timer : float = 0;

function Update () {
	if((timer > destroyTime) && timer < (destroyTime + fadeTime)){
		GetComponent.<Renderer>().material.color.a = 1 - (timer-destroyTime)/fadeTime;
	}
	else if	(timer > (destroyTime + fadeTime))
		Destroy(gameObject);
		
	timer += Time.deltaTime;

}