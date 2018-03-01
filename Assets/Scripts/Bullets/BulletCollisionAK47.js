/*
Author: Daniel Campbell 2011/12
Attach To: "BulletAK47" Rigidbody
*/

function OnCollisionEnter(myCollision : Collision) {
		Destroy(gameObject);
}