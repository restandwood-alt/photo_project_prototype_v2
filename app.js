const CONFIG = {

    START: 91,

    FADE: 300,

    CLICK_LOCK: 250,

    HISTORY_LIMIT: 300,

    PRELOAD_DEPTH: 2,

    DEBUG: false

};

const pos = {

    "С":[50,1],
    "С-В":[95,5],
    "В":[97,50],
    "Ю-В":[95,95],
    "Ю":[50,97],
    "Ю-З":[5,95],
    "З":[3,50],
    "С-З":[5,5]

};

let graph = {};

let current =
    Number(localStorage.getItem("current")) ||
    CONFIG.START;

let history =
    JSON.parse(localStorage.getItem("history") || "[]");

const img = document.getElementById("photo");
const topNav = document.getElementById("top-nav");
const leftNav = document.getElementById("left-nav");
const rightNav = document.getElementById("right-nav");
const bottomNav = document.getElementById("bottom-nav");
const back = document.getElementById("back");

const cache = new Map();

let locked = false;

fetch("graph.json")
.then(r=>r.json())
.then(g=>{

    graph = g;

    show(current,false);

});

function log(...args){

    if(CONFIG.DEBUG){

        console.log(...args);

    }

}

function imagePath(id){

    return `photos/${id}.jpg`;

}

function cacheImage(id){

    if(cache.has(id)) return;

    const im = new Image();

    im.src = imagePath(id);

    im.onerror = ()=>{

        console.warn("Missing image",id);

    };

    cache.set(id,im);

}

function preload(id,depth=CONFIG.PRELOAD_DEPTH,visited=new Set()){

    if(depth<=0) return;

    if(visited.has(id)) return;

    visited.add(id);

    const neighbours = graph[id];

    if(!neighbours) return;

    Object.values(neighbours).forEach(next=>{

        cacheImage(next);

        preload(next,depth-1,visited);

    });

}

function drawButtons(id){

    topNav.innerHTML = "";
    leftNav.innerHTML = "";
    rightNav.innerHTML = "";
    bottomNav.innerHTML = "";

    const neighbours = graph[id] || {};

    for(const [dir,target] of Object.entries(neighbours)){

        const b=document.createElement("button");

        b.className="nav";

        b.textContent=dir;

	b.dataset.dir = dir;

       // b.style.left=pos[dir][0]+"vw";

       // b.style.top=pos[dir][1]+"vh";

        b.onclick=()=>{

            if(locked) return;

            locked=true;

            setTimeout(()=>{

                locked=false;

            },CONFIG.CLICK_LOCK);

            history.push(current);

            if(history.length>CONFIG.HISTORY_LIMIT){

                history.shift();

            }

            localStorage.setItem(
                "history",
                JSON.stringify(history)
            );

            show(target);

        };

        switch(dir){

    		case "С":
    		case "С-З":
   	 	case "С-В":

        		topNav.appendChild(b);
        		break;

    		case "З":

        		leftNav.appendChild(b);
       	 		break;

    		case "В":

        		rightNav.appendChild(b);
        		break;

    		case "Ю":
    		case "Ю-З":
    		case "Ю-В":

        		bottomNav.appendChild(b);
        		break;

}

    }

}

function show(id,animate=true){

    current=id;

    localStorage.setItem("current",id);

    drawButtons(id);

    preload(id);

    const updateImage=()=>{

        cacheImage(id);

        img.onload=()=>{

            img.style.opacity=1;

            log("Loaded",id);

        };

        img.onerror=()=>{

            console.warn("Missing image",id);

            img.style.opacity=1;

        };

        img.src=imagePath(id);

    };

    if(!animate){

        updateImage();

        return;

    }

    img.style.opacity=0;

    setTimeout(updateImage,CONFIG.FADE);

}

back.onclick=()=>{

    if(locked) return;

    if(!history.length) return;

    locked=true;

    setTimeout(()=>{

        locked=false;

    },CONFIG.CLICK_LOCK);

    const prev=history.pop();

    localStorage.setItem(

        "history",

        JSON.stringify(history)

    );

    show(prev);

};