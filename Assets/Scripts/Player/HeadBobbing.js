//head bobbing script from 
//http://www.unifycommunity.com/wiki/index.php?title=Headbobber
/*
SFX code by Daniel Campbell 2011/12
Attach To: "Main Camera" Camera
*/

 private var timer = 0.0;
 var bobbingSpeed = 0.18;
 var bobbingAmount = 0.2;
 var midpoint = 2.0;
 var footSqueakSound1 : AudioClip;
 var footSqueakSound2 : AudioClip;
 var footStepVolume : float = 0.5f;
 
 private var isGrounded : boolean = true;
 
 function Grounding(boolValue : boolean){
 	isGrounded = boolValue;
 }
 
 function Update () {
 	if(isGrounded){	 
	    waveslice = 0.0;
	    horizontal = Input.GetAxis("Horizontal");
	    vertical = Input.GetAxis("Vertical");
	    if (Mathf.Abs(horizontal) == 0 && Mathf.Abs(vertical) == 0) {
	       timer = 0.0;
	    }
	    else {
	       waveslice = Mathf.Sin(timer);
	       timer += bobbingSpeed;
	       if (timer > Mathf.PI * 2) {
	          timer -= (Mathf.PI * 2);
	       }
	    }
	    if (waveslice != 0) {
	       translateChange = waveslice * bobbingAmount;
	       totalAxes = Mathf.Abs(horizontal) + Mathf.Abs(vertical);
	       totalAxes = Mathf.Clamp (totalAxes, 0.0, 1.0);
	       translateChange = totalAxes * translateChange;
	       transform.localPosition.y = midpoint + translateChange;
	    }
	    else {
	       transform.localPosition.y = midpoint;      
	    }
	   
	    if(waveslice > 0.995 && timer != 0){
	    	var randInt : int = Random.Range(0, 2);
	    	if(randInt == 0)
	    		AudioSource.PlayClipAtPoint(footSqueakSound1, transform.position, footStepVolume);
			else
	    		AudioSource.PlayClipAtPoint(footSqueakSound2, transform.position, footStepVolume);
	    		
	    }
    }
 }