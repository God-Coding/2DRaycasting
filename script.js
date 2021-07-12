var canvas  = document.getElementById("canvas");
var c = canvas.getContext("2d");

canvas.style.border = "2px solid black";
document.body.style.margin = "0px";

var w = canvas.width = window.innerWidth - 10;
var h = canvas.height = window.innerHeight - 15;

//some functions
function line(x0, y0, x1, y1){
    c.beginPath();
    c.moveTo(x0, y0);
    c.lineTo(x1, y1);
    c.stroke();
    c.closePath();
}

function circle(p){
    c.beginPath();
    c.fillStyle = "white";
    c.arc(p.x, p.y, 6, 0, 2 * Math.PI);
    c.fill();
    c.closePath();
}

function random(min, max){
    return Math.random() * (max - min) + min;
}

//vector class
class Vec2d{
    constructor(x, y){
        this.x = x; this.y = y;
    }

    add(v){
        return new Vec2d(this.x + v.x, this.y + v.y);    
    }

    sub(v){
        return new Vec2d(this.x - v.x, this.y - v.y);
    }

    dot(v){
        return this.x * v.x + this.y * v.y;
    }

    len(){
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }

    sca(k){
        return new Vec2d(this.x * k, this.y * k);
    }

    angle(){
        return Math.acos(this.x / this.len());
    }

    static dis(a, b){
        let r = a.sub(b);
        return r.len();
    }

    normalize(){
        return new Vec2d((this.x / this.len()) * 100, (this.y / this.len()) * 100);
    }
}

class Vec2dFromAngle{
    constructor(angle){
        let a = angle / 57.2957795;
        let x = Math.cos(a) * 500;
        let y = Math.sin(a) * 500;
        return new Vec2d(x, y);
    }
}

//wall class
class Wall{
    constructor(s, e){
        this.s = new Vec2d(s.x, s.y);
        this.e = new Vec2d(e.x, e.y);
    }

    draw(c){
        c.strokeStyle = "white";
        c.lineWidth = 3;
        line(this.s.x, this.s.y, this.e.x, this.e.y);
    }
}

class Ray{
    constructor(c, v){
        this.c = c;
        this.v = v;
    }

    draw(c){
        c.strokeStyle = "Red";
        c.save();
        c.translate(this.c.x, this.c.y);
        line(0, 0, this.v.x, this.v.y);
        c.restore();
    }

    cast(wall){
        let x1 = wall.s.x;
        let y1 = wall.s.y;
        let x2 = wall.e.x;
        let y2 = wall.e.y;
        
        let x3 = this.c.x;
        let y3 = this.c.y;
        let x4 = this.c.x + this.v.x;
        let y4 = this.c.y + this.v.y;

        let den = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);

        if(den == 0) return;

        let t = ((x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4)) / den;
        let u = -((x1 - x2) * (y1 - y3) - (y1 - y2) * (x1 - x3)) / den;

        if(t > 0 && t < 1 && u > 0){
            let p = new Vec2d();
            p.x = x1 + t * (x2 - x1);
            p.y = y1 + t * (y2 - y1);
            return p;
        }else{ return }
    }

    dir(){
        let v = new Vec2d(this.v.x - this.c.x, this.v.y - this.c.y);
        return v.angle();
    }
}

class Particle{
    constructor(){
        this.pos = new Vec2d(w / 3, h / 2);
        this.rays = [];
        for(let i = 0; i < 360; i += 1){
            this.rays[i] = new Ray(this.pos, new Vec2dFromAngle(i));
        }
    }

    followMouse(){
        canvas.addEventListener("mousemove", (e)=>{
            this.pos.x = e.clientX;
            this.pos.y = e.clientY;
        });
        
        canvas.addEventListener("touchmove", (e)=>{
            e.preventDefault()
            this.pos.x = e.touches[0].clientX;
            this.pos.y = e.touches[0].clientY;
        });
    }

    update(walls){
        this.rays.forEach(ray=>{
            let current = 999999;
            let point = undefined;
            walls.forEach(wall=>{
                let p = ray.cast(wall);
                if(p){
                    let d = Vec2d.dis(this.pos, new Vec2d(p.x, p.y));
                    if(d < current){
                        current = d;
                        point = p;
                    }
                }
            });
            if(point){
                c.strokeStyle = "rgba(255, 255, 255, 0.3)";
                line(this.pos.x, this.pos.y, point.x, point.y)
            }
        });
    }

    draw(c){
        circle(this.pos);
        c.lineWidth = 1;
        // this.rays.forEach(ray=>{
        //     ray.draw(c);
        // });
    }
}

//***********/

let walls = [];

walls.push(new Wall(new Vec2d(0, 0), new Vec2d(w, 0)));
walls.push(new Wall(new Vec2d(0, 0), new Vec2d(0, h)));
walls.push(new Wall(new Vec2d(w, 0), new Vec2d(w, h)));
walls.push(new Wall(new Vec2d(0, h), new Vec2d(w, h)));


for(let i = 0; i < 5; i++){
    walls.push(new Wall(new Vec2d(random(0, w), random(0, h)),new Vec2d(random(0, w), random(0, h))));
}

let p = new Particle();
p.followMouse()

function update(dt){

}

function draw(c){
    c.fillStyle = 'rgba(0, 0, 0)';
    c.fillRect(0, 0, w, h);
    walls.forEach(wall=>{
        wall.draw(c);
    });
    p.draw(c);
    p.update(walls);
}
var t0 = Date.now();
var t1 = dt = 0;

function loop(){
    t1 = Date.now();
    dt = t1 - t0;
    update(dt / 1000);
    draw(c);
    t0 = t1;
    requestAnimationFrame(loop);
}
loop();
