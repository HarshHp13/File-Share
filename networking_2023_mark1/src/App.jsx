import { useEffect, useState } from "react";
import "./App.css";
import io from 'socket.io-client'

const socket=io('http://localhost:3001')

function App() {
  const [message, setMessage]= useState()
  const [file, setFile]= useState(null)
  const [files, setFiles]=useState([])
  const [metadata, setMetadata]=useState({})
  const [buffer, setBuffer]=useState([])
  const [meta, setMeta]=useState({})

  const handleChange=(e)=>{
    e.preventDefault()
    handleFile(e.target.files[0])
  }

  const handleFile=(s_file)=>{
    console.log("here")
    const f=s_file
    if(!f){return}
    console.log(s_file.name)
    const reader=new FileReader()
    let bfr=[]
    reader.onload=(e)=>{
      let buffer=new Uint8Array(reader.result)
      setMeta({
        name: f.name,
        chunkSize: 20000000,
        totalFileSize: buffer.length,
      })
      setBuffer(buffer)
      console.log(buffer.length)
    }
    reader.readAsArrayBuffer(f)
    // reader.onloadend=()=>{
    //   console.log(reader.result)
    // }
    // reader.readAsDataURL(f)
    
    // reader.onloadend=()=>{
    //   setFile({
    //     name:f.name,
    //     data:reader.result
    //   })
    //   console.log(reader.result)
    // }
  }

  const sendMessage=(e)=>{
    // send message to server
    e.preventDefault()
    if(buffer.length===0){return}
    console.log("send button clicked")
    console.log(socket.id)
    socket.emit("file-meta", meta)
    console.log(files)
  }

  const handleDownload = (receivedFile)=>{
    // download file
    console.log(receivedFile)
    const uri=URL.createObjectURL(new Blob(receivedFile.data,{type: "application/octet-stream"}))
    return uri
  }

  useEffect(()=>{
    // socket.on("receive_message",(data)=>{
    //   setFiles((prev)=>{
    //     return [...prev, data.file]
    //   })
    // })

    //E->S => metadata

    //S->R => metadata

    //R->S => start
    socket.on("fs-meta",(data)=>{
      console.log("metadata received")
      console.log(data)
      let meta={
        name: data.name,
        chunkSize: data.chunkSize,
        totalFileSize: data.totalFileSize,
        buffer: []
      }
      setMetadata(meta)
      socket.emit("fs-start",{})
    })

    //S->E => chunk 
    
    //S->R => raw
    //R->S => metadata.fileSize==metadata.totalFileSize?stop:start
    socket.on("file-chunk",async (data)=>{
      console.log(data)
      console.log("chunk received")
      let temp=metadata
      temp.buffer=temp.buffer.concat(data.buffer)
      setMetadata((prev)=>{
        return {
          ...prev,
          buffer: prev.buffer.concat(data.buffer)
        }
      })
      if((temp.buffer.length)*20000000>=temp.totalFileSize){
        setFiles(prev=>[...prev, {name: temp.name,data: temp.buffer}])
        setMetadata({})
      }
      else{
        socket.emit("fs-start",{})
      }
      
    })

    return ()=>{
      socket.off("fs-meta")
      socket.off("file-chunk")
    }

  },[metadata,files])

  useEffect(()=>{
    //E->S => raw
    socket.on("fs-chunk",()=>{
      console.log("chunk request received")
      console.log(buffer.length)
      let chunk=buffer.slice(0,meta.chunkSize)
      let newBuffer=buffer.slice(meta.chunkSize, buffer.length)
      setBuffer(newBuffer)
      if(chunk.length!==0){
        console.log()
        socket.emit("file-raw",{
          buffer:chunk
        })
      }
    })

    return ()=>{
      socket.off("fs-chunk")
    }
  },[buffer, meta])


  const setActive=(e)=>{
    e.stopPropagation()
    e.preventDefault()
    document.getElementById("box").classList.add("active")
  }
  const setInactive=(e)=>{
    e.stopPropagation()
    e.preventDefault()
    document.getElementById("box").classList.remove("active")
  }
  const handleDrop=(e)=>{
    e.stopPropagation()
    e.preventDefault()
    handleFile(e.dataTransfer.files[0])
  }

  const handleClick=()=>{
    document.getElementById("btn").click()
  }

  return (
    <div className="app__container">
      <div
        id="box"
        className="app__containerFileSelector"
        onDragEnter={(e)=>{setActive(e)}}
        onDragOver={(e)=>{e.preventDefault()}}
        onDragLeave={(e)=>{setInactive(e)}}
        onDrop={(e)=>{handleDrop(e)}}
        onClick={handleClick}
      >
        <label htmlFor="box">Click or drag your files here</label>
        <input id='btn' type="file" onChange={handleChange} 
          
          
        />
      </div>  
      
      <button onClick={sendMessage} id='send' >Send</button>
      <div className="props">
        <span>meta: {JSON.stringify(meta)}</span>
        <span>buffer: {buffer.length}</span>
      </div>
      <div className="app__containerFiles">
        {
          files.map((file,index)=>{
            return <span key={index}>{index+1}: {file.name} <a href={handleDownload(file)} download={`${file.name}`} >Download</a> </span>
          })
        }
      </div>
    </div>
  );
}

export default App;
