/*
Author: Daniel Campbell 2011/12
Attach To: "OuterSphere" Trigger
*/

var SmallExplosion : ParticleEmitter[];

function Awake(){
	Physics.IgnoreLayerCollision(8, 10); // 8 = "Bullet", 10 = "OuterSphere"
	var fpsCollider : Collider = GameObject.Find("MyFPS").GetComponent.<Collider>();
	Physics.IgnoreCollision(GetComponent.<Collider>(), fpsCollider);
}

function OnTriggerExit (other : Collider) {
	if(other.gameObject.name.StartsWith("Bullet"))
    	if(other.gameObject.name == "BulletRed(Clone)"){
    		Instantiate(SmallExplosion[0],other.transform.position,Quaternion.identity);
    		Destroy(other);
    	}
    	else if(other.gameObject.name == "BulletYellow(Clone)"){
    		Instantiate(SmallExplosion[1],other.transform.position,Quaternion.identity);
    		Destroy(other);
    	}
    	else if(other.gameObject.name == "BulletBlue(Clone)"){
    		Instantiate(SmallExplosion[2],other.transform.position,Quaternion.identity);
    		Destroy(other);
    	}
    	else if(other.gameObject.name == "BulletGreen(Clone)"){
    		Instantiate(SmallExplosion[3],other.transform.position,Quaternion.identity);
    		Destroy(other);
    	}
    	else if(other.gameObject.name == "BulletPurple(Clone)"){
    		Instantiate(SmallExplosion[4],other.transform.position,Quaternion.identity);
    		Destroy(other);
    	}
    	else if(other.gameObject.name == "BulletOrange(Clone)"){
    		Instantiate(SmallExplosion[5],other.transform.position,Quaternion.identity);
    		Destroy(other);
    	}
    	else if(other.gameObject.name == "BulletAK47(Clone)"){
    		Instantiate(SmallExplosion[6],other.transform.position,Quaternion.identity);
    		Destroy(other);
    	}
    		
}