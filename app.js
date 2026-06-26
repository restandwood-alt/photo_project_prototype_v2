const START = 91;
const FADE_TIME = 400;

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
let history = JSON.parse(localStorage.getItem("history") || "[]");
let cur = +localStorage.getItem("current") || START;

const img = document.getElementById("photo");
const nav = document.getElementById("nav");

fetch("graph.json")
    .then(r => r.json())
    .then(g => {
        graph = g;
        show(cur, false);
    });

function preloadNeighbours(id){
    if(!graph[id]) return;

    Object.values(graph[id]).forEach(next=>{
        const p = new Image();
        p.src = `photos/${next}.jpg`;
    });
}

function show(id, animate = true){

    cur = id;
    localStorage.setItem("current", id);

    function updateImage(){

        img.onload = () => {

            img.style.opacity = 1;

            preloadNeighbours(id);

        };

        img.src = `photos/${id}.jpg`;

        drawButtons(id);
    }

    if(!animate){

        updateImage();
        return;

    }

    img.style.opacity = 0;

    setTimeout(updateImage, FADE_TIME);
}

function drawButtons(id){

    nav.innerHTML = "";

    const neighbours = graph[id] || {};

    for(const [dir,target] of Object.entries(neighbours)){

        const b = document.createElement("button");

        b.className = "nav";
        b.textContent = dir;

        b.style.left = pos[dir][0] + "vw";
        b.style.top = pos[dir][1] + "vh";

        b.onclick = ()=>{

            history.push(cur);

            localStorage.setItem(
                "history",
                JSON.stringify(history)
            );

            show(target);

        };

        nav.appendChild(b);

    }

}

document.getElementById("back").onclick = ()=>{

    if(!history.length) return;

    const prev = history.pop();

    localStorage.setItem(
        "history",
        JSON.stringify(history)
    );

    show(prev);

};