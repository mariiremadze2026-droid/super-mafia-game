const socket = io();

let roomId;
let name;
let action=null;
let target=null;

function შესვლა(){
  name=document.getElementById("სახელი").value;
  roomId=document.getElementById("ოთახი").value;

  socket.emit("შესვლა",{roomId,name});

  document.getElementById("შესვლა").classList.add("hidden");
  document.getElementById("თამაში").classList.remove("hidden");
}

function დაწყება(){
  socket.emit("დაწყება",roomId);
}

socket.on("შენი_როლი",(r)=>{
  document.getElementById("როლი").innerText="შენი როლი: "+r;
});

socket.on("განახლება",(room)=>{
  document.getElementById("მოთამაშეები").innerHTML =
    room.მოთამაშეები.map(m=>
      `<div class="player">
      ${m.სახელი} ${m.ცოცხალია?"🟢":"🔴"}
      </div>`
    ).join("");
});

socket.on("ფაზა",(p)=>{
  document.getElementById("ფაზა").innerText =
    p==="დღე"?"🌞 დღე":"🌙 ღამე";
});

function აირჩიე(a){
  action=a;
}

function დადასტურება(){
  socket.emit("ღამისქმედება",{
    roomId,
    type:action,
    targetId:target
  });
}

socket.on("თამაში_დასრულდა",(w)=>{
  alert("🏆 გამარჯვებული: "+w);
});