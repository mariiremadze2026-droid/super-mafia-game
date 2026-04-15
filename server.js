const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static("public"));

let rooms = {};

const rolesBase = [
  "მოქალაქე","მოქალაქე","მოქალაქე","მოქალაქე",
  "მაფია","მაფია","ექიმი","დეტექტივი","დონი","სერიული"
];

function createRoom(id){
  rooms[id] = {
    players: [],
    phase: "lobby",
    votes: {},
    night: {}
  };
}

function assignRoles(room){
  let shuffled = rolesBase.slice(0, room.players.length)
    .sort(()=>Math.random()-0.5);

  room.players.forEach((p,i)=>{
    p.role = shuffled[i];
    p.alive = true;
  });
}

function checkWin(room){
  let mafia = room.players.filter(p=>p.role==="მაფია" && p.alive);
  let others = room.players.filter(p=>p.role!=="მაფია" && p.alive);

  if(mafia.length === 0) return "citizens";
  if(mafia.length >= others.length) return "mafia";
  return null;
}

io.on("connection",(socket)=>{

  socket.on("joinRoom",({roomId,name})=>{
    if(!rooms[roomId]) createRoom(roomId);

    socket.join(roomId);

    rooms[roomId].players.push({
      id: socket.id,
      name,
      role: null,
      alive: true
    });

    io.to(roomId).emit("update", rooms[roomId]);
  });

  socket.on("startGame",(roomId)=>{
    let room = rooms[roomId];

    assignRoles(room);
    room.phase = "night";

    room.players.forEach(p=>{
      io.to(p.id).emit("yourRole", p.role);
    });

    io.to(roomId).emit("phase","night");

    setTimeout(()=>night(roomId),3000);
  });

  socket.on("nightAction",({roomId,type,targetId})=>{
    let room = rooms[roomId];
    room.night[socket.id] = {type,targetId};
  });

  socket.on("vote",({roomId,targetId})=>{
    let room = rooms[roomId];
    room.votes[socket.id] = targetId;
  });

  function night(roomId){
    let room = rooms[roomId];

    let actions = Object.values(room.night);

    let kill = actions.find(a=>a.type==="kill");
    let heal = actions.find(a=>a.type==="heal");

    room.players.forEach(p=>p.protected=false);

    if(heal){
      let h = room.players.find(p=>p.id===heal.targetId);
      if(h) h.protected=true;
    }

    if(kill){
      let v = room.players.find(p=>p.id===kill.targetId);
      if(v && !v.protected) v.alive=false;
    }

    room.night = {};
    room.phase="day";

    io.to(roomId).emit("update",room);
    io.to(roomId).emit("phase","day");

    setTimeout(()=>vote(roomId),15000);
  }

  function vote(roomId){
    let room = rooms[roomId];

    let count = {};

    Object.values(room.votes).forEach(v=>{
      count[v]=(count[v]||0)+1;
    });

    let eliminated = Object.keys(count)
      .sort((a,b)=>count[b]-count[a])[0];

    if(eliminated){
      let p = room.players.find(x=>x.id===eliminated);
      if(p) p.alive=false;
    }

    room.votes = {};

    let win = checkWin(room);

    if(win){
      io.to(roomId).emit("gameOver",win);
      return;
    }

    room.phase="night";

    io.to(roomId).emit("update",room);
    io.to(roomId).emit("phase","night");

    setTimeout(()=>night(roomId),5000);
  }

});

server.listen(3000,()=>{
  console.log("🔥 super-mafia-game running on http://localhost:3000");
});