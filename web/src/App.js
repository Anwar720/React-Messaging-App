import './assets/App.css';
import {ContactList} from './components/contacts.js'
import {Chat} from './components/chat.js';
import {Login} from './components/login.js'
import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import {BrowserRouter as Router,Routes,Route,useNavigate} from "react-router-dom";
import  secureLocalStorage  from  "react-secure-storage";
import {LoginRequired,LogoutRequired} from './utils/routeAuth.js';
const socket = io();

function App() {
  const userUid = React.useRef();
  const user = React.useRef();
  const currentChatId = React.useRef()
  const contactRef = React.useRef()
  const [messages,setMessages] = useState([])
  const [contacts,setContacts] = useState([])
  const [activeChat, setActiveChat] = useState({})
  const [suggestedContacts,setSuggestedContacts] = useState([])
  const [isAddcontactActive,setIsAddcontactActive] = React.useState(false)
  const [incomingRequests,setIncomingRequests] = React.useState([])
  const [outgoingRequests,setOutgoingRequests] = React.useState({})
  const [isChatActive,setIsChatActive] = React.useState(false)
  const navigate = useNavigate();
  user.current = secureLocalStorage.getItem('user')
  userUid.current = secureLocalStorage.getItem('userId')
  useEffect(() => {
    console.log('uid:',secureLocalStorage)
    socket.on('connect', () => {
      console.log('connected with id:',socket.id)
      // setIsConnected(true);
    });

    socket.on('disconnect', () => {
      // setIsConnected(false);
    });
    socket.on("connect_error", (err) => {
      console.log(`connect_error due to ${err.message}`);
    });

    socket.on('messages', async (msg) => {
      console.log('recieved',msg)
      setMessages(prevState => {
        let tmp = Object.assign({}, prevState)
        tmp[currentChatId.current] = prevState[currentChatId.current]?[...prevState[currentChatId.current],msg]:[msg]                     // update the name property, assign a new value                 
        return tmp; 
      })
    });

    socket.on('allContacts', async (list) => {
      setContacts(list)
      contactRef.current = list;
    });

    socket.on('chat-list', async (list) => {
      setMessages(list)
      console.log(list)
    });

    socket.on('suggested-contacts', async(list,contactRequests,outgoingRequests)=>{
        let suggested_list = []
        list.forEach(contact=>{
          // console.log(contact.uid,'user uid',userUid.current,'is contact in contact list:',contact.uid in contacts)
          if(contact.uid !== userUid.current && !contactRef.current[contact.uid])
              suggested_list.push(contact)
        })
        console.log('suggested list:',suggested_list)
        setSuggestedContacts([...suggested_list])
        setIncomingRequests([...contactRequests])
        setOutgoingRequests(prev=> outgoingRequests)
    })
    socket.on("outgoing-requests",(list)=>{
      console.log('outgoing:',list)
      setOutgoingRequests(prev=> list)
    })

    return () => {
      socket.off('connect');
      socket.off('disconnect');
    };
  }, []);

  const sendMessage = async (msg) => {
    let d = new Date()
    const msgObject = {
      sentFrom:user.current,
      date: `${d.toDateString().substring(4)} - ${d.toLocaleTimeString()}`,
      message:msg
    }

    setMessages(prevState => {
      let tmp = Object.assign({}, prevState)
      tmp[activeChat.chat] = prevState[activeChat.chat]?[...prevState[activeChat.chat],msgObject]:[msgObject]                    
      return tmp; 
    })
    
    socket.emit('newMessage',msgObject,activeChat.chat);
  }

  const joinRoom = (room) => {
    socket.emit('join-room',room);
  }

  const redirectHome = ()=>{
    navigate('/home') 
  }

  const loadContacts = ()=>{
    console.log('loading contacts')
      socket.emit('get-contacts',secureLocalStorage.getItem('token'))
  }

  function loadMessages(list){
    let initial_messages = {}
    for(let user in list){
      let contact = list[user]
      initial_messages[contact.chat] = []
    }
    setMessages(initial_messages)
  }

  const displayActiveChat = (chatId,user)=>{
    console.log('displayActiveChat:',chatId,user)
    setActiveChat({chat:chatId,user:user})
    currentChatId.current = chatId
    joinRoom(chatId)
    setIsChatActive(true);
  }
  const backgroundPrefreence = ()=>{
      if(secureLocalStorage.getItem('mode') && secureLocalStorage.getItem('mode') == 'light')
        document.querySelector('html').setAttribute('data-theme',"light")
  }
  const logoutUser = ()=>{
    secureLocalStorage.removeItem('token')
    secureLocalStorage.removeItem('user')
    secureLocalStorage.removeItem('userId')
    navigate('/') 
  }

  const Application = ()=>{
    useEffect(()=>{
      backgroundPrefreence()
      window.addEventListener('load',()=>{
          loadContacts();
      })
    }, []);
      return(
            <div className={`App  ${isChatActive?'displayMobileChat':''}`}>
              <ContactList contacts={contacts} socket={socket} joinRoom={joinRoom} 
                          displayActiveChat={displayActiveChat} user={user} suggestedContacts={suggestedContacts} isAddcontactActive={isAddcontactActive} setIsAddcontactActive={setIsAddcontactActive}
                          incomingRequests = {incomingRequests} setIncomingRequests={setIncomingRequests} logoutUser={logoutUser} outgoingRequests={outgoingRequests}/>
              <Chat activeChat={activeChat} sendMessage={sendMessage} contacts={contacts} messages={messages} user={user} setIsChatActive={setIsChatActive}/>
            </div>
      )}
    
    return (
          <Routes>
            <Route element={LogoutRequired()}>
              <Route path="" element={<Login redirectHome={redirectHome} userUid={userUid} loadContacts={loadContacts} backgroundPrefreence={backgroundPrefreence}/>} />
            </Route>
            <Route element={LoginRequired()}>
              <Route path="/home" element={<Application />} />
            </Route>
          </Routes>
      
    );
}

export default App;
