const socket = io();

let roomId;
let name;
let action=null;
let target=null;

function join(){
  name=document.getElementById("name").value;
  roomId=document.getElementById("room").value;

  socket.emit("joinRoom",{roomId,name});

  document.getElementById("login").classList.add("hidden");
  document.getElementById("game").classList.remove("hidden");
}

function start(){
  socket.emit("startGame",roomId);
}

socket.on("yourRole",(r)=>{
  document.getElementById("role").innerText="შენი როლი: "+r;
});

socket.on("update",(room)=>{
  document.getElementById("players").innerHTML =
    room.players.map(p=>
      `<div class="player ${p.alive?"":"dead"}"
      onclick="select('${p.id}')">
      ${p.name}
      </div>`
    ).join("");
});

socket.on("phase",(p)=>{
  document.getElementById("phase").innerText =
    p==="day"?"🌞 დღე":"🌙 ღამე";
});

function select(id){
  target=id;
}

function set(a){
  action=a;
}

function confirm(){
  socket.emit("nightAction",{
    roomId,
    type:action,
    targetId:target
  });
}

socket.on("gameOver",(w)=>{
  alert("🏆 გამარჯვებული: "+w);
});