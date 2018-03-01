//var uvAnimationTileX = 6; //Here you can place the number of columns of your sheet.
                           //The above sheet has 24

//var uvAnimationTileY = 6; //Here you can place the number of rows of your sheet.
                          //The above sheet has 1
//var framesPerSecond = 10.0;

var fadeTime : float = 1;
private var timer : float;
private var bGotHit : boolean;
var transFreq : float = 1;

//sounds
var FFstart : AudioClip;
//var FFloop : AudioClip;
var FFend : AudioClip;
var forceFieldVolume : float = 0.5;

function Start(){
	GetComponent.<Renderer>().material.color.a = 0.5;
	timer = 0;
	bGotHit = false;
	AudioSource.PlayClipAtPoint(FFstart, transform.position, forceFieldVolume);
}

function Update () {	
	
	if(bGotHit){
		if(timer < fadeTime){
			GetComponent.<Renderer>().material.color.a = 1 - (timer/fadeTime);
		}
		else if	(timer > fadeTime){
			Destroy(gameObject);
			GameObject.Find("MyFPS").SendMessage("ForceFieldUnArmed");
		}
	}
	else{
		if(timer < transFreq/2){
			GetComponent.<Renderer>().material.color.a = 0.1 + 0.4*(2*timer/transFreq);
		}
		else if(timer > transFreq/2 && timer < transFreq){
			GetComponent.<Renderer>().material.color.a = 0.1 + 0.4*(2*(1 - timer/transFreq));
		}
		else if(timer > transFreq){
			timer = 0;
		}
	}
	timer += Time.deltaTime;
}

function GotHit(){
	bGotHit = true;
	AudioSource.PlayClipAtPoint(FFend, transform.position, forceFieldVolume);
	timer = 0;
} 

//need animated .gif for this. bugger it
/*
function Update () {

    // Calculate index
    var index : int = Time.time * framesPerSecond;
    // repeat when exhausting all frames
    index = index % (uvAnimationTileX * uvAnimationTileY);
   
    // Size of every tile
    var size = Vector2 (1.0 / uvAnimationTileX, 1.0 / uvAnimationTileY);
   
    // split into horizontal and vertical index
    var uIndex = index % uvAnimationTileX;
    var vIndex = index / uvAnimationTileX;

    // build offset
    // v coordinate is the bottom of the image in opengl so we need to invert.
    var offset = Vector2 (uIndex * size.x, 1.0 - size.y - vIndex * size.y);
   
    renderer.material.SetTextureOffset ("_MainTex", offset);
    renderer.material.SetTextureScale ("_MainTex", size);
    
}
*/