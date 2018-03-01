
var lightTime : float = 7;
var fadeTime : float = 2;
private var previousColor : Color;
private var nextColor : Color;
private var timer : float;
var Flares : Flare[];

function Start(){	
	nextColor = Color.white;
	ChooseNewColor();
	ChangeFlameColor(nextColor);
	timer = 0;
	//lightComponent = GetComponentInChildren(Light);
}

private function ChooseNewColor(){
	previousColor = nextColor;
	var myLightSource = GetComponentInChildren(Light);
	
	do{
		switch(Random.Range(0,5)){
			case 0:
				nextColor = Color.red;
				myLightSource.flare = Flares[0];
			break;
			case 1:
				nextColor = Color.yellow;
				myLightSource.flare = Flares[1];
			break;
			case 2:
				nextColor = Color.blue;
				myLightSource.flare = Flares[2];
			break;
			case 3:
				nextColor = Color.green;
				myLightSource.flare = Flares[3];
			break;
			case 4: 
				nextColor = Color.magenta;
				myLightSource.flare = Flares[4];
			break;
			case 5:
				nextColor = Color(1, 0.5, 0, 1);
				myLightSource.flare = Flares[5];
			break;						
		}	
	}while(previousColor == nextColor);	
}

private function ChangeFlameColor(newColor : Color) {
    var particleAnimators = GetComponentsInChildren(ParticleAnimator);
	for(var pAnim : ParticleAnimator in particleAnimators){
    	if(pAnim.gameObject.name != "Smoke"){
		    var modifiedColors : Color[] = pAnim.colorAnimation;
		    modifiedColors[0] = nextColor;
		    modifiedColors[1] = nextColor;
		    modifiedColors[2] = nextColor;
		    modifiedColors[3] = nextColor;
		    pAnim.colorAnimation = modifiedColors;
	    }
    }
}

function Update () {
	if(timer < fadeTime){
		var newColor : Color = (previousColor *(fadeTime - timer) +  nextColor*timer)/fadeTime;
		//lightComponent.color = newColor;
		ChangeFlameColor(newColor);		
	}
	else if(timer > fadeTime+lightTime){
		previousColor = nextColor;
		ChooseNewColor();
		timer = 0;
	}
	
	timer += Time.deltaTime;
}