
const http=require("http")
const path = require("path")
const websocket=require("websocket").server
const app=require("express")()
let con,users={},userId=0

const server=http.createServer( app )

server.listen(8080,()=> console.log("Server has started"))

const wsServer=new websocket({
    httpServer: server
})

app.get("/:roomId",(req,res)=>{
    res.sendFile(path.resolve("index.html"))
})

wsServer.on("request",(req)=>{
    userId++;
    console.log(`New connection established with user id: ${userId}`)
    con=req.accept(null,req.origin)

    //recieving message from client
    con.on("message",(data)=>{
        data=JSON.parse(data.utf8Data)
        if(data.type=="join"){
            users[userId]={
                roomId: data.roomId,
                ws: con
            }
        }
        else if(data.type=="message"){
            Object.keys(users).forEach( (id)=>{
                if(users[id].roomId==data.roomId){
                    users[id].ws.send( data.payload )
                }
            } )
        }
    })

    //removing user who has disconnected
    con.on("close",()=>{
        Object.keys(users).forEach( (id)=>{
            if(!users[id].ws.connected){
                console.log(`User with user id ${id} has disconnected`)
                delete users[id]
            }
        } )
    })
})
