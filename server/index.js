const express=require('express')
const app=express()
const http=require('http')
const {Server} =require('socket.io')
const cors=require('cors')

app.use(cors())

const server=http.createServer(app)
const io=new Server(server,{
    maxHttpBufferSize: 1e8,
    cors:{
        origin:"http://localhost:8000",
        methods: ["GET", "POST"],
    }
})

io.on("connection", (socket)=>{
    console.log(`User connected: ${socket.id}`)
    socket.on("send_message",(data)=>{
        // console.log(data)
        socket.broadcast.emit("receive_message", data)
    })

    socket.on("file-meta",(metadata)=>{
        socket.broadcast.emit("fs-meta",metadata)
    })
    socket.on("fs-start",()=>{
        socket.broadcast.emit("fs-chunk")
    })
    socket.on("file-raw",(data)=>{
        // console.log(data)
        socket.broadcast.emit("file-chunk",data)
    })
    socket.on("test",(data)=>{
        console.log(data)
    })
})


server.listen(3001, ()=>{
    console.log("listening on port 3001");
})