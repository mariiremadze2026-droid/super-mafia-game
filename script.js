let room = [];
let roles = ["მაფია", "დონი", "ექიმი", "შერიფი", "მოქალაქე", "მოქალაქე"];
let currentRole = "";
let phase = "ღამე";

function createRoom(){
    let name = document.getElementById("playerName").value;
    if(name=="") return alert("შეიყვანე სახელი");

    room = [name];
    document.getElementById("roomCode").innerText = Math.floor(Math.random()*9999);
    document.getElementById("roomSection").classList.remove("hidden");
    updatePlayers();
}

function joinRoom(){
    let name = document.getElementById("playerName").value;
    if(name=="") return alert("შეიყვანე სახელი");

    room.push(name);
    document.getElementById("roomSection").classList.remove("hidden");
    updatePlayers();
}

function updatePlayers(){
    let list = document.getElementById("playersList");
    list.innerHTML = "";
    room.forEach(player=>{
        let li = document.createElement("li");
        li.innerText = player;
        list.appendChild(li);
    });
}

function startGame(){
    document.getElementById("gameSection").classList.remove("hidden");
    currentRole = roles[Math.floor(Math.random()*roles.length)];
    document.getElementById("roleText").innerText = "შენი როლი: " + currentRole;
}

function nextPhase(){
    phase = phase=="ღამე" ? "დღე" : "ღამე";
    document.getElementById("phaseText").innerText = phase;
}

function sendMessage(){
    let input = document.getElementById("msgInput");
    let msg = input.value;
    if(msg=="") return;

    let div = document.createElement("div");
    div.innerText = msg;
    document.getElementById("messages").appendChild(div);

    input.value="";
}