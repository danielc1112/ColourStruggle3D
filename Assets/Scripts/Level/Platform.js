#pragma strict

var start : Transform;
var end : Transform;
var platformTime : float;
private var timer : float = 0;
private var startToEnd : Vector3;

function Start () {
	transform.position = start.position;
	startToEnd = end.position - start.position;
}

function FixedUpdate () {

	if(timer <= platformTime/2)
		transform.position += startToEnd*Time.deltaTime/(platformTime/2);
	else if(timer > platformTime/2 && timer < platformTime)
		transform.position -= startToEnd*Time.deltaTime/(platformTime/2);
	else
		timer = 0;	
	timer += Time.deltaTime;
}