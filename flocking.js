//TODO involute of a circle
// Polar:		r=a*sec(ß)	    θ = tan(ß) - ß 
// Cartesian:	x = r cos(θ)	=>	x = a*sec(ß) cos(tan(ß) - ß)
//				y = r sin(θ)	=>	y = a*sec(ß) sin(tan(ß) - ß)

Flock flock;
ArrayList attractionNodes;
ArrayList bullets;
ArrayList explosions;

Vector3D targetLoc;
boolean goToTarget;
boolean drawPulse;
boolean drawMissile;
int placeType;
int shipYval;
int wid;
int halfwidth;
int halfheight;
boolean begin;
Player ship;

int PULSE = 1;
int MISSILE = 2;

boolean drawAttraction;

void setup() {
    size(1000,600); //width, height
    wid = width/2;
	halfwidth = wid;
	halfheight = height/2;
    colorMode(RGB,255,255,255,100);
    
    initCode();
}

void initCode()
{
    flock = new Flock();

    // Add an initial set of boids into the system
    for (int i = 0; i < 50; i++) {
        //Vector3D v = new Vector3D(halfwidth,halfheight);
        Vector3D v = new Vector3D(halfwidth,90,0);
        Boid b = new Boid(v, 5, 0.2 );
        flock.addBoid(b);
    }

    targetLoc = new Vector3D(halfwidth,halfheight,0);
    goToTarget = false;
    placeType = PULSE;
    drawPulse = false;
    drawMissile = false;
    attractionNodes = new ArrayList();
    bullets = new ArrayList();
    explosions = new ArrayList();
    background(0);
    smooth();
    
    sYval = height/(20/19);
    
    targetYvalStart = height/6;
    targetXval = width/4;
    targetYval = targetYvalStart;
    targetSpeed = 5;
    moveTargetRight = 1;
    begin = true;//must be true for attraction point to be created

    ship = new Player(3);

    drawAttraction = true;//TODO turn off

}

int lastRedraw = 0;
int CLOCKS_PER_SECOND = 1000;

void draw() 
{
    if(millis() - lastRedraw > CLOCKS_PER_SECOND / 30)
    {
        lastRedraw = millis();
        realDraw();
    }

}

//{{{ realDraw
void realDraw()
{
    background(0);
    
    if(ship.isDead()) {
        fill(128);
        textAlign(CENTER);
        text("You Are Death", halfwidth, halfheight);
    }

    if(begin) {
        Vector3D v = new Vector3D(targetXval,targetYval,0);
        goToTarget = true;
        attractionNodes.add(v);
        begin = 0;
    }
    
    //background(0);
    if(goToTarget == true) //asdf
    {
        Vector3D tmpX;
        Vector3D tmpY;
		
//		x = a*sec(ß) cos(tan(ß) - ß) + halfwidth
//		y = a*sec(ß) sin(tan(ß) - ß) + halfheight
		
		
		
		
        for(int i = 0; i < attractionNodes.size(); i++)
        {
		
		targetXval = halfwidth;
		//targetXval = sec(beta) cos(tan(beta) - beta) + halfwidth;
		((Vector3D)attractionNodes.get(i)).x = targetXval;
		targetYval = halfheight;
		//targetYval = sec(beta) sin(tan(beta) - beta) + halfheight;
		((Vector3D)attractionNodes.get(i)).y = targetYval;
		
		/*
            if(moveTargetRight) {
                targetXval += targetSpeed;
                ((Vector3D)attractionNodes.get(i)).x = targetXval;
            }else {
                targetXval -= targetSpeed;
                ((Vector3D)attractionNodes.get(i)).x = targetXval;
            }
            
            if (targetXval > width-50) {
                moveTargetRight = 0;
                targetYval += 50;
                ((Vector3D)attractionNodes.get(i)).y = targetYval;
            }
            if (targetXval < 50){
                moveTargetRight = 1;
                targetYval += 50;
                ((Vector3D)attractionNodes.get(i)).y = targetYval;
            }
            if (targetYval > halfheight)
            {
                targetYval = targetYvalStart; 
                ((Vector3D)attractionNodes.get(i)).y = targetYval;
            }*/

            if(drawAttraction)
            {
                fill(255,0,0);
                rect(targetXval, targetYval, 10, 10);
            }
        }
    }
    if (drawPulse == true)
    {
        //keep on moving the bullets up
        for(int i = 0; i < bullets.size(); i++)
        {
            Bullet tmpB = (Bullet)bullets.get(i);
            if(!tmpB.run())
            {
                bullets.remove(i);
                i--;
            }
        }
    }
    if( drawMissile == true)
    {
        if(ship.myMissile.missileLoc.y < 0)
        {
            drawMissile = false;
            ship.missileInUse = false;
            ship.myMissile.resetAll();
        }
        ship.myMissile.run();

    }
    flock.run();
    
    //Ship
    fill(0.0,0.6,0.4);
    
    ship.run();
    statusBar();
    
    if(flock.getNumBoids() < 1) {
        fill(128);
        text("You Are Win", halfwidth, halfheight); 
    }

    if(explosions.size() > 0)
    {
        for(int i = 0; i < explosions.size(); i++)
        {

            Explosion tmpExp = (Explosion)explosions.get(i);
            if(!tmpExp.explode())
            {
                explosions.remove(i);
                i--;
            }
        }
    }
    

}
//}}}

//{{{ status bar
void statusBar()
{
    fill(128);
    stroke(128);
    rect(0,0,width, 40);

    int tmpX = 70;
    int tmpY = 18;

    Vector3D placeToDrawAt = new Vector3D(0,0,0);

    //lives left
    for(int i = 0; i < ship.lives; i++)
    {
        placeToDrawAt.x = tmpX + (i * 30);
        placeToDrawAt.y = tmpY;
        renderShipForLives(placeToDrawAt); 
    }

    //missiles
    tmpX = 200;
    tmpY = 10;
    for(int i = 0; i < ship.missilesLeft; i++)
    {
        placeToDrawAt.x = tmpX + (i * 25);
        placeToDrawAt.y = 10;

        renderMissiles(placeToDrawAt);
    }

    tmpX = 700;
    tmpY = 10;

    float widthPerCell = 300 / ship.maxShots;

    for(int i = ship.maxShots - 1; i >= 0; i--)
    {
        placeToDrawAt.x = tmpX - (i * widthPerCell);
        if(bullets.size() <= i)
            fill(0,255,0);
        else
            fill(128);
        stroke(255);
        rect(placeToDrawAt.x, tmpY, widthPerCell, 20);

    }

    fill(255,255,0);

    if(placeType == PULSE)
    {
        ellipse(410, 20, 10, 10);
    }
    else if (placeType == MISSILE)
    {
        ellipse(185, 20, 10, 10);
    }
    
}

//{{{ renderShipForLives
void renderShipForLives(Vector3D loc)
{
    float mainTri = 5; 
    float secondaryTri = 2.5;

    pushMatrix();
        //draw the side engines first
        fill(255,0,0);
        stroke(255,0,0);

        translate(loc.x, loc.y);

        pushMatrix();
            beginShape(TRIANGLES);
                vertex(-2, 6 - secondaryTri * 2);
                vertex(-2 - secondaryTri, 6 + secondaryTri*2);
                vertex(-2 + secondaryTri, 6 + secondaryTri*2);
            endShape();
        popMatrix();

        pushMatrix();
            beginShape(TRIANGLES);
                vertex(8, 6 - secondaryTri * 2);
                vertex(8 - secondaryTri, 6 + secondaryTri*2);
                vertex(8 + secondaryTri, 6 + secondaryTri*2);
            endShape();

        popMatrix();

        //main body part
        fill(0,0,255);
        stroke(0,0,255);
        pushMatrix();
            beginShape(TRIANGLES);
                vertex(3, -mainTri*2);

                vertex(3 - mainTri , mainTri*2);
                
                vertex(3 + mainTri, mainTri * 2);
            endShape();
        popMatrix();
    popMatrix();



}
//}}}

void renderMissiles(Vector3D loc)
{
    pushMatrix();
        fill(255,0,0);
        triangle(loc.x + 2.5, loc.y + 10,
                 loc.x-7.5, loc.y + 20, 
                 loc.x + 12.5, loc.y + 20);
        rect(loc.x, loc.y, 5, 20);
    popMatrix();
}
//}}}

//{{{ Input
void mousePressed() {

    if(ship.lives <= 0) {
        return;
    }
    
    if(mouseButton == LEFT)
    {

        if(placeType == PULSE)
        {
            ship.fireBullet();
        }
        else
        {
            ship.fireMissile();
        }
    }
    else if(mouseButton == RIGHT)
    {
        if(placeType == MISSILE)
        {
            if(ship.missileInUse == true)
            {
                
                Vector3D v = new Vector3D(ship.myMissile.missileLoc.x, ship.myMissile.missileLoc.y,0);
                //asplode missile
                explosions.add(new Explosion(v, 30, 5, color(255,0,0), color(255,128,0)));   
                ship.myMissile.explodeAllNear();
                ship.myMissile.resetAll();
                ship.missileInUse = false;
            }
        }
        if(placeType == PULSE)
        {
            drawPulse = false;
            bullets.clear();
        }
    }
}

void keyPressed()
{
    switch(key)
    {
        case 'q':
            placeType = PULSE;
        break;
        case 'w':
            placeType = MISSILE;
        break;
        case 'c':
            Vector3D v = new Vector3D(mouseX,mouseY,0);
            Boid b = new Boid(v, 5, 0.2 );
            flock.addBoid(b);
        break;

        case 'r':
            drawAttraction = !drawAttraction;
        break;
    }

}

//}}}


//{{{ Flock
class Flock {
    ArrayList boids; // An arraylist for all the boids

    Flock() {
        boids = new ArrayList(); // Initialize the arraylist
    }

    void run() {
        for (int i = 0; i < boids.size(); i++) {
            Boid b = (Boid) boids.get(i);  
            b.run(boids);  // Passing the entire list of boids to each boid individually
            int bulletHit = b.isNearDeath();

            if(bulletHit > -1)
            {
                //remove it, and make sure there isn't an OBOE 
                bullets.remove(bulletHit);
                ship.shotsFired--;
                boids.remove(i);
                i--;
                explosions.add(new Explosion(b.loc, 5, 5, color(0,0,255),color(0,255,128)));
            }
            
            if(ship.boidCollide(b.loc) && ship.lives > 0) {
                boids.remove(i);
                i--;
                explosions.add(new Explosion(b.loc, 5, 5, color(0,0,255),color(0,255,128)));
            }

        }
    }

    void addBoid(Boid b) {
        boids.add(b);
    }

    int getNumBoids() {
        return boids.size();
    }

}
//}}}

//{{{ Boid
class Boid {

    Vector3D loc;
    Vector3D vel;
    Vector3D acc;
    float r;
    float maxforce;    // Maximum steering force
    float maxspeed;    // Maximum speed

    Boid(Vector3D l, float ms, float mf) {
        acc = new Vector3D(0,0,0);
        vel = new Vector3D(random(-1,1),random(-1,1),0);
        loc = copy(l);
        r = 2.0;
        maxspeed = ms;
        maxforce = mf;
    }

    void run(ArrayList boids) {
        flock(boids);
        update();
        borders();
        render();
    }

    void borders()
    {
        if(loc.x < -r) loc.x = 0;
        if(loc.y < 40-r) loc.y = 41; 
        if(loc.x > width+r) loc.x = width;
    }

    // We accumulate a new acceleration each time based on three rules
    void flock(ArrayList boids) {
        Vector3D sepAliCoh = boidInteraction(boids);   // Separation
        if(goToTarget == true)
        {
            Vector3D att = attraction();
            mult(att, 2.0);
        }
        if(bullets.size() > 0)
        {
            Vector3D ave = aversion();
            if(boids.size() > 5)
                mult(ave, 2.0);
            else
                mult(ave, 1.5);
        }
        add(acc, sepAliCoh);

        if(goToTarget == true)
            add(acc,att);

        if(bullets.size() > 0)
            add(acc, ave);
    }

    // Method to update location
    void update() {
        // Update velocity
        add(vel, acc);
        // Limit speed
        limit(vel,maxspeed);

        if(loc.y + vel.y < 40)
        {
            vel.y = -vel.y;
        }
        add(loc, vel);
        // Reset accelertion to 0 each cycle
        setXYZ(acc,0,0,0);
    }

    void seek(Vector3D target) {
        add(acc, steer(target,false));
    }

    void arrive(Vector3D target) {
        add(acc, steer(target,true));
    }

    // A method that calculates a steering vector towards a target
    // Takes a second argument, if true, it slows down as it approaches the target
    Vector3D steer(Vector3D target, boolean slowdown) {
        Vector3D steer;  // The steering vector
        Vector3D desired = subNew(target,loc);  // A vector pointing from the location to the target
        float d = magnitude(desired); // Distance from the target is the magnitude of the vector
        // If the distance is greater than 0, calc steering (otherwise return zero vector)
        if (d > 0) {
            // Normalize desired
            normalize(desired);
            // Two options for desired vector magnitude (1 -- based on distance, 2 -- maxspeed)
            if ((slowdown) && (d < 100.0)) mult(desired,maxspeed*(d/100.0)); // This damping is somewhat arbitrary
            else mult(desired, maxspeed);
            // Steering = Desired minus Velocity
            steer = subNew(desired,vel);
            limit(steer, maxforce);  // Limit to maximum steering force
        } else {
            steer = new Vector3D(0,0,0);
        }
        return steer;
    }

    void render() {
        // Draw a triangle rotated in the direction of velocity
        
        float theta = heading2D(vel) + radians(90);
        fill(0,0,255);
        stroke(0,128,255);
        pushMatrix();
        translate(loc.x,loc.y);
        rotate(theta);
        beginShape(TRIANGLES);

            vertex(0, -r*2);

            vertex(-r, r*2);

            vertex(r, r*2);

        endShape();
        popMatrix();
    }

    //this now combines separation, cohesion, and alignment.
    // Much, much faster. Although it's a tad harder to read.
    Vector3D boidInteraction (ArrayList boids) {
        float desiredseparation = 25.0;
        float neighbordist = 50.0;
        Vector3D sumSep = new Vector3D(0,0,0);
        Vector3D sumAli = new Vector3D(0,0,0);
        Vector3D sumCoh = new Vector3D(0,0,0);
        Vector3D sumAll = new Vector3D(0,0,0);


        int countSep = 0;
        int countAli = 0;
        int countCoh = 0;
        // For every boid in the system, check if it's too close
        for (int i = 0 ; i < boids.size(); i++) {
            Boid other = (Boid) boids.get(i);
            float d = distance(loc,other.loc);
            // If the distance is greater than 0 and less than an arbitrary amount (0 when you are yourself)
            // Separation
            // Method checks for nearby boids and steers away
            if(d > 0)
            {

                if ( (d < desiredseparation)) {
                    // Calculate vector pointing away from neighbor
                    Vector3D diff = subNew(loc,other.loc);
                    normalize(diff);
                    div(diff,d);        // Weight by distance
                    add(sumSep,diff);
                    countSep++;            // Keep track of how many
                }

                if( (d < neighbordist)) {
                    add(sumAli,other.vel);
                    countAli++;
                    add(sumCoh, other.loc);
                    countCoh++;
                }


            }

        }
        // Average -- divide by how many
        if (countSep > 0) {
            div(sumSep,(float)countSep);
        }

        if ( countAli > 0)
        {
            div(sumAli,(float)countAli);
            limit(sumAli,maxforce);
        }

        if( countCoh > 0)
        {
            div(sumCoh, (float)countCoh);
            sumCoh = steer(sumCoh, false);
        }

        mult(sumSep,20.0);
        mult(sumAli,1.0);
        mult(sumCoh,1.0);
        add(sumAll,sumSep);
        add(sumAll,sumAli);
        add(sumAll,sumCoh);

        return sumAll;
    }

    //attraction
    Vector3D attraction()
    {

        //get the distance of this boid from all the attraction nodes.
        Vector3D sum = new Vector3D(0,0,0);
        Vector3D tmp = new Vector3D(0,0,0);

        int i = 0;
        for(i = 0; i < attractionNodes.size(); i++)
        {
            tmp = (Vector3D)attractionNodes.get(i);

            add(sum,tmp);
        }

        if(i > 0)
            div(sum,i);

        return steer(sum, false);

    }

    Vector3D aversion()
    {
        Vector3D sum = new Vector3D(0,0,0);
        Vector3D bullet = new Vector3D(0,0,0);
        Vector3D tmp = new Vector3D(0,0,0);

        int i = 0;
        for(i = 0; i < bullets.size(); i++)
        {
            bullet = ((Bullet)bullets.get(i)).bulletLoc;

            float d = distance(loc,bullet);

            if(d < 100)
            {

                tmp = subNew(loc, bullet);

                mult(tmp, 1 / Math.pow(d,2) * 10);

                add(sum,tmp);
            }
        }

       // return steer(sum, false);
        return sum;
    }

    int isNearDeath()
    {
        if(drawPulse == true)
        {
            for(int i = 0; i < bullets.size(); i++)
            {
                Bullet death = (Bullet)bullets.get(i);

                float d = distance(loc,death.bulletLoc);

                if(d < 10.0)
                {
                    return i;
                }

            }
            return -1;
        }
        return -1;
    }
}
//}}}

//{{{ BoidFood
static class BoidFood {
    float x;
    float y;
    
    BoidFood(float x_, float y) {
        x = x_; 
        y = y_; 
    }
    
    
    
    
}
//}}}


//{{{ Player
static class Player
{
    Vector3D loc;
    Vector3D vel;
    int shotsFired;
    int maxShots;

    int missilesLeft;

    int lives;
    float theta;
    float mainTri;
    float secondaryTri;
    float shipWidth;
    float shipYval;

    boolean missileInUse;

    Missile myMissile;

    Player(int _lives)
    {
        mainTri = 10;
        secondaryTri = 5;

        shipWidth = mainTri + (secondaryTri / 2);

        loc = new Vector3D(halfwidth,height-shipWidth,0);
        vel = new Vector3D(0,0,0);
        myMissile = new Missile(0,0);
        lives = _lives;
        maxShots = 15;

        shipYval = 0;
        theta = radians(0);
        missileInUse = false;
        missilesLeft = 5;
    }

    void run()
    {
        if(lives > 0) {
            update();
            render();
        } else {
            //TODO display gameover
        }
    }

    //TOP Y-VAL IS 400
    //update info about this thing
    void update()
    {
        //shipwidth here should probably be shipHeight...
        shipYval = (((mouseX-wid)*(mouseX-wid))*-.001) + height - 2*shipWidth;
        setXY(loc,mouseX, shipYval);
        theta = atan2( (shipYval - halfheight), (loc.x - halfwidth));
        theta = theta + radians(-90);
        setX(vel, 0);
        
    }

    //draw it
    void render()
    {
        pushMatrix();
            //draw the side engines first
            fill(255,0,0);
            stroke(255,0,0);

            translate(loc.x, shipYval);
            rotate(theta);

            pushMatrix();
                //translate(loc.x - 4, shipYval + 13);
                //rotate(theta);
                beginShape(TRIANGLES);
                    vertex(-4, 13 - secondaryTri * 2);
                    vertex(-4 - secondaryTri, 13 + secondaryTri*2);
                    vertex(-4 + secondaryTri, 13 + secondaryTri*2);
                endShape();
            popMatrix();

            pushMatrix();
                //translate(loc.x + 16, shipYval + 13);
                //rotate(theta);
                beginShape(TRIANGLES);
                    vertex(16, 13 - secondaryTri * 2);
                    vertex(16 - secondaryTri, 13 + secondaryTri*2);
                    vertex(16 + secondaryTri, 13 + secondaryTri*2);
                endShape();

            popMatrix();

            //main body part
            fill(0,0,255);
            stroke(0,0,255);
            pushMatrix();
                //translate(loc.x+6, shipYval);
                //rotate(theta);
                beginShape(TRIANGLES);
                    vertex(6, -mainTri*2);

                    vertex(6 - mainTri , mainTri*2);
                    
                    vertex(6 + mainTri, mainTri * 2);
                endShape();
            popMatrix();
        popMatrix();



    }

    int lastFired = 0;

    boolean fireBullet()
    {
        if(millis() - lastFired < CLOCKS_PER_SECOND / 10)
        {
            return false; 
        }

        if(bullets.size() >= maxShots)
        {
            //we can't fire!
            return false;
        }
        
        lastFired = millis();
        //need an actual bullet class. these aren't real vectors,
        //just points masquerading as vectors
        Vector3D v = new Vector3D(mouseX, shipYval,0);
        Vector3D bulletAngle = new Vector3D(0,-1,0);
        bulletAngle.x = cos(theta - radians(90));
        bulletAngle.y = sin(theta - radians(90));

        Bullet b = new Bullet(v,bulletAngle);
        drawPulse = true;
        bullets.add(b);

        return true;
    }

    boolean fireMissile()
    {
        if(missileInUse == true || missilesLeft <= 0)
        {
            return false;
        }
        myMissile.setPos(mouseX, shipYval);
        myMissile.setVel(cos(theta - radians(90)), sin(theta - radians(90)));
        myMissile.setTheta(theta);
        drawMissile = true;
        missileInUse = true;
        missilesLeft--;

        return true;
    }
    
    boolean boidCollide(Vector3D b) {
        // blah
        float d = distance(loc,b);
        if(d < shipWidth*2) {
            lives--;
            return true;
        }
        return false;
    }
    
    boolean isDead() {
        if(lives < 1)
            return true;
        return false;
    }
    
}
//}}}

//{{{ missile
static class Missile
{
    Vector3D missileLoc;
    Vector3D missileVel;
    Vector3D missileAcc; //eleration
    Vector3D initialVel;
    float theta;

    Missile(float _x, float _y)
    {
        missileLoc = new Vector3D(_x, _y,0);
        missileVel = new Vector3D(0,0,0);
        missileAcc = new Vector3D(0,0,0);
        initialVel = new Vector3D(0,0,0);
    }

    void setPos(float _x, float _y)
    {
        setXY(missileLoc,_x, _y);
    }

    void setVel(float _x, float _y)
    {
        setXY(missileVel,_x, _y);
        setXY(initialVel,_x,_y);
    }

    void resetAll()
    {
        setXYZ(missileLoc,0,0,0);
        setXYZ(missileVel,0,0,0);
        setXYZ(missileAcc,0,0,0);
    }

    void setTheta(float _theta)
    {
        theta = _theta;
    }

    void run()
    {
        fly(); 
        update();
        render();
    }

    void fly()
    {
        mult(missileAcc,15);
    }

    void update()
    {
        add(missileVel,missileAcc);
        limit(missileVel,15);
        add(missileLoc,missileVel);

        //reset this
        setXYZ(missileAcc,initialVel.x,initialVel.y,0);
    }

    void render()
    {
        pushMatrix();
            translate(missileLoc.x, missileLoc.y);
            rotate(theta);
            fill(255,0,0);
            triangle(2.5, 10,
                    -7.5, 20, 
                    12.5, 20);
            rect(0,0, 5, 20);
        popMatrix();
        //fill(255,0,0);
        //rect(missileLoc.x-5, missileLoc.y-5, 10, 10);
    }

    void explodeAllNear()
    {
        for(int i = 0; i < flock.boids.size(); i++)
        {
            Boid b = (Boid)flock.boids.get(i);

            float d = distance(missileLoc, b.loc);

            if( d < 50 )
            {
                flock.boids.remove(i);
                i--;
                explosions.add(new Explosion(b.loc, 5, 5, color(0,0,255),color(0,255,128)));
            }
        }
    }
}
//}}}

//{{{ Bullet
static class Bullet
{
    
    Vector3D bulletLoc;
    Vector3D bulletVel;
    Vector3D bulletAcc; //eleration
    Vector3D initialVel;

    Bullet(Vector3D _loc, Vector3D _vel)
    {
        bulletLoc = copy(_loc);
        bulletVel = copy(_vel);
        bulletAcc = copy(_vel);
        initialVel = copy(_vel);
        //bulletAcc = new Vector3D(0,0,0);
    }

    //return false if it should be dead.
    boolean run()
    {
        if(bulletLoc.y < 0 || bulletLoc.x < 0 || bulletLoc.x > width)
        {
            return false;
        }
        update();
        render();
        return true;
    }

    void update()
    {
        mult(bulletAcc,10); 
        
        add(bulletVel, bulletAcc);
        limit(bulletVel,10);
        add(bulletLoc, bulletVel);
        
        setXYZ(bulletAcc,initialVel.x,initialVel.y,0);
    }

    void render()
    {
        fill(0,255,0);
        rect(bulletLoc.x-5, bulletLoc.y-5, 10, 10);
    }
}
//}}}


//{{{ dot
static class Dot
{
    
    Vector3D dotLoc;
    Vector3D dotVel;
    Vector3D dotAcc; //eleration

    int timeToLive;
    float accX;
    float accY;
    boolean hasRunOnce;

    Dot(float _x, float _y, float _ox, float _oy, 
            int _ttl)
    {
        hasRunOnce = false;
        dotLoc = new Vector3D(_x,_y,0); 
        dotVel = new Vector3D(_ox, _oy,0);
        timeToLive = _ttl;
        accX = random(25, 50);
        accY = random(25, 50);
        dotAcc = new Vector3D(accX, accY,0);
    }

    boolean canStillLive()
    {
        if(timeToLive > 0)
        {
            return true;
        }
        return false;
    }

    void run(color _c)
    {
        if(hasRunOnce)
        {
            fly();
            update();
        }
        else
        {
            hasRunOnce = true;
        }

        render(_c);
        timeToLive--;
    }

    void fly()
    {
        setXY(dotAcc,accX, accY);
    }

    void update()
    {
        //dotVel.add(dotAcc);
        //dotVel.limit(25);
        add(dotLoc, dotVel);
        setXYZ(dotAcc,0,0,0);
    }

    void render(color _c)
    {
        fill(_c);
        noStroke();
        rect(dotLoc.x-2.5, dotLoc.y-2.5, 5,5);
    }
    

}
//}}}

//{{{Explosion
static class Explosion
{
    Vector3D explLoc;
    ArrayList dots;
    boolean hasExploded;
    color c1;
    color c2;
    int num;
    int ttl;
    
    Explosion(Vector3D _loc, int _num, int _ttl, color _c1, color _c2)
    {
        explLoc = copy(_loc);
        dots = new ArrayList();
        c1 = _c1;
        c2 = _c2;
        hasExploded = false;
        num = _num;
        ttl = _ttl;
    }

    boolean explode()
    {
        if(!hasExploded)
        {
            newExplode();
            hasExploded = true;
        }
        
        for(int i = 0; i < dots.size(); i++)
        {
            Dot tmpDot = (Dot)dots.get(i);
            color tmpColor = (i % 2 ? c1 : c2);
            tmpDot.run(tmpColor);
            if(!tmpDot.canStillLive())
            {
                dots.remove(i);
                i--;
            }
        }

        //everything is dead!
        if(dots.size() == 0)
            return false;


        //there are still some things exploding!
        return true;
    }

    //need to create a bunch of Dots and give them velocities and
    //what not...
    void newExplode()
    {
        for(int i = 0; i < num; i++)
        {
            dots.add(new Dot(explLoc.x, explLoc.y, random(-10,10), random(-20,20), ttl));
        }
    }
}
//}}}


//{{{ Vector3D
static class Vector3D {
    float x;
    float y;
    float z;

    Vector3D(float x_, float y_, float z_) {
        x = x_; 
        y = y_; 
        z = z_;
    }
}
//}}}

//{{{ Vector functions
Vector3D copy(Vector3D v)
{
    return new Vector3D(v.x, v.y, v.z);
}

float magnitude(Vector3D v)
{
    return (float) Math.sqrt(v.x*v.x + v.y*v.y + v.z*v.z);
}

float dotProduct(Vector3D v1, Vector3D v2)
{
    float tmp;
    tmp = v1.x * v2.x;
    tmp += v1.y * v2.y;
    tmp += v1.z * v2.z;
    return tmp;
}

void add(Vector3D v3, Vector3D v4)
{
    v3.x += v4.x;
    v3.y += v4.y;
    v3.z += v4.z;
}

void sub(Vector3D v5, Vector3D v6)
{
    v5.x += v6.x;
    v5.y += v6.y;
    v5.z += v6.z;
}

void mult(Vector3D v7, float n)
{
    v7.x *= n;
    v7.y *= n;
    v7.z *= n;
}

void div(Vector3D v8, float n)
{
    float recip = 1 / n;
    v8.x *= recip;
    v8.y *= recip;
    v8.z *= recip;
}

void normalize(Vector3D v9)
{
    float m = magnitude(v9);
    if(m > 0)
    {
        div(v9, m);
    }
}

void limit(Vector3D v10, float max)
{
    if(magnitude(v10) > max)
    {
        normalize(v10);
        mult(v10,max);
    }
}

float heading2D(Vector3D v11)
{
    float angle = (float) Math.atan2(-(v11.y), v11.x);
    return -1*angle;
}

Vector3D addNew(Vector3D v12, Vector3D v13)
{
    Vector3D v = new Vector3D(v12.x + v12.x,v12.y + v13.y, v12.z + v13.z);
    return v;
}

Vector3D subNew(Vector3D v14, Vector3D v15) {
    Vector3D v = new Vector3D(v14.x - v15.x,v14.y - v15.y,v14.z - v15.z);
    return v;
}

Vector3D divNew(Vector3D v16, float n) {
    n = 1/n;
    Vector3D v = new Vector3D(v16.x*n,v16.y*n,v16.z*n);
    return v;
}

Vector3D multNew(Vector3D v17, float n) {
    Vector3D v = new Vector3D(v17.x*n,v17.y*n,v17.z*n);
    return v;
}

float distance(Vector3D v18, Vector3D v19) 
{
    float dx = v18.x - v19.x;
    float dy = v18.y - v19.y;
    float dz = v18.z - v19.z;
    return (float) Math.sqrt(dx*dx + dy*dy + dz*dz);
}

void setX(Vector3D v, float _x)
{
    v.x = _x;
}

void setY(Vector3D v, float _y) {
    v.y = _y;
}

void setZ(Vector3D v, float _z)
{
    v.z = _z;
}

void setXY(Vector3D v, float x_, float y_) {
    v.x = x_;
    v.y = y_;
}

void setXYZ(Vector3D v, float x_, float y_, float z_) {
    v.x = x_;
    v.y = y_;
    v.z = z_;
}
//}}}
