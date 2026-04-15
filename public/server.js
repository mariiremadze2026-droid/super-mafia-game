const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static("public"));

let ოთახები = {};

const როლები = [
  "მოქალაქე","მოქალაქე","მოქალაქე","მოქალაქე",
  "მაფია","მაფია","ექიმი","დეტექტივი","დონი","სერიული"
];

function ოთახისშექმნა(id){
  ოთახები[id] = {
    მოთამაშეები: [],
    ფაზა: "ლობისი",
    ხმები: {},
    ღამე: {}
  };
}

function როლებისდარიგება(ოთახი){
  let shuffled = როლები.slice(0, ოთახი.მოთამაშეები.length)
    .sort(()=>Math.random()-0.5);

  ოთახი.მოთამაშეები.forEach((m,i)=>{
    m.როლი = shuffled[i];
    m.ცოცხალია = true;
  });
}

function მოგება(ოთახი){
  let მაფია = ოთახი.მოთამაშეები.filter(m=>m.როლი==="მაფია" && m.ცოცხალია);
  let სხვები = ოთახი.მოთამაშეები.filter(m=>m.როლი!=="მაფია" && m.ცოცხალია);

  if(მაფია.length === 0) return "მოქალაქეები";
  if(მაფია.length >= სხვები.length) return "მაფია";
  return null;
}

io.on("connection",(socket)=>{

  socket.on("შესვლა",({roomId,name})=>{
    if(!ოთახები[roomId]) ოთახისშექმნა(roomId);

    socket.join(roomId);

    ოთახები[roomId].მოთამაშეები.push({
      id: socket.id,
      სახელი: name,
      როლი: null,
      ცოცხალია: true
    });

    io.to(roomId).emit("განახლება", ოთახები[roomId]);
  });

  socket.on("დაწყება",(roomId)=>{
    let ოთახი = ოთახები[roomId];

    როლებისდარიგება(ოთახი);
    ოთახი.ფაზა = "ღამე";

    ოთახი.მოთამაშეები.forEach(m=>{
      io.to(m.id).emit("შენი_როლი", m.როლი);
    });

    io.to(roomId).emit("ფაზა","ღამე");

    setTimeout(()=>ღამე(roomId),3000);
  });

  socket.on("ღამისქმედება",({roomId,type,targetId})=>{
    let ოთახი = ოთახები[roomId];
    ოთახი.ღამე[socket.id] = {type,targetId};
  });

  socket.on("ხმისმიცემა",({roomId,targetId})=>{
    let ოთახი = ოთახები[roomId];
    ოთახი.ხმები[socket.id] = targetId;
  });

  function ღამე(roomId){
    let ოთახი = ოთახები[roomId];

    let ქმედებები = Object.values(ოთახი.ღამე);

    let მკვლელობა = ქმედებები.find(a=>a.type==="kill");
    let განკურნება = ქმედებები.find(a=>a.type==="heal");

    ოთახი.მოთამაშეები.forEach(m=>m.დაცულია=false);

    if(განკურნება){
      let h = ოთახი.მოთამაშეები.find(m=>m.id===განკურნება.targetId);
      if(h) h.დაცულია=true;
    }

    if(მკვლელობა){
      let v = ოთახი.მოთამაშეები.find(m=>m.id===მკვლელობა.targetId);
      if(v && !v.დაცულია) v.ცოცხალია=false;
    }

    ოთახი.ღამე = {};
    ოთახი.ფაზა = "დღე";

    io.to(roomId).emit("განახლება",ოთახი);
    io.to(roomId).emit("ფაზა","დღე");

    setTimeout(()=>ხმა(roomId),15000);
  }

  function ხმა(roomId){
    let ოთახი = ოთახები[roomId];

    let count = {};

    Object.values(ოთახი.ხმები).forEach(v=>{
      count[v]=(count[v]||0)+1;
    });

    let მოკლული = Object.keys(count)
      .sort((a,b)=>count[b]-count[a])[0];

    if(მოკლული){
      let m = ოთახი.მოთამაშეები.find(x=>x.id===მოკლული);
      if(m) m.ცოცხალია=false;
    }

    ოთახი.ხმები = {};

    let win = მოგება(ოთახი);

    if(win){
      io.to(roomId).emit("თამაში_დასრულდა",win);
      return;
    }

    ოთახი.ფაზა = "ღამე";

    io.to(roomId).emit("განახლება",ოთახი);
    io.to(roomId).emit("ფაზა","ღამე");

    setTimeout(()=>ღამე(roomId),5000);
  }

});

server.listen(3000,()=>console.log("super-mafia-game გაშვებულია"));