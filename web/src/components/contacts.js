import React, { useEffect, useState } from "react";
import  secureLocalStorage  from  "react-secure-storage";

export const ContactList = (props)=>{
    const [check,setCheck] = useState(secureLocalStorage.getItem('mode')==='light')
    const handleAddContactEvent = ()=>{
        if(!props.suggestedContacts.length){
            console.log('calling get suggested contacts')
            props.socket.emit('get-suggested-contacts',secureLocalStorage.getItem('token'))
        }
        props.setIsAddcontactActive(props.isAddcontactActive===false?true:false)
    }
    const addContact = (element,uid)=>{
        console.log('clicked add contact')
        props.socket.emit('add-contact',secureLocalStorage.getItem('token'),uid,props.user.current)
    }
    const acceptContact = (e,contactUid,contactName)=>{
        e.currentTarget.parentElement.parentElement.style.display = 'none'
        props.socket.emit('accept-contact',secureLocalStorage.getItem('token'),contactUid,contactName,props.user.current)
    }
    const toggleOptionsMenu = (e)=>{
        if(e.target.checked)
            document.querySelector('.options').style.top = '0%';
        else
            document.querySelector('.options').style.top = '-100%';
    }
    const toogleTheme = (e)=>{
        console.log(e.target.checked,secureLocalStorage.getItem('mode'))
        // e.target.checked = secureLocalStorage.getItem('mode')=='light'
        if(check == false){
            secureLocalStorage.setItem('mode','light')
            document.querySelector('html').setAttribute('data-theme',"light")
            setCheck(true)
        }
        else{
            secureLocalStorage.setItem('mode','dark')
            document.querySelector('html').setAttribute('data-theme',"dark")
            setCheck(false)
        }
    }

        return(
        <div className="main-contactList-container">
            <div className="userProfile">
                <div className="profile">
                    <div className="profileImg">
                        {/* <img src="" /> */}
                    </div>
                    <div className="profileName">{props.user.current}</div>
                </div>
                <div className="profileBtns">
                    <input name="check" type="radio" id="add-contact-btn" onClick={()=>{handleAddContactEvent()}}/>   <label htmlFor="add-contact-btn"> <i className="add-contact-btn fa-solid fa-plus btn" ></i></label> 
                    {/* <input name="check" type="radio" id="search" />   <label  htmlFor="search"> <i className="fa-solid fa-magnifying-glass btn"></i></label>  */}
                    <input name="check"  type="checkbox" id="options" onChange={(e)=>toggleOptionsMenu(e)}/>   <label htmlFor="options"> <i className="fa-solid fa-circle-chevron-down btn"></i></label> 
                    
                </div>
            </div>


            <div className="contactList">
                    <div className="options">
                        <input onChange={(e)=>toogleTheme(e)} checked={check} className="mode" type="checkbox" id="theme"/> <label htmlFor="theme"><div class="glider"><i class="darkMode fa-solid fa-moon"></i><i class="lightMode fa-solid fa-sun"></i></div> </label>
                        <button onClick={()=>props.logoutUser()}>Logout <i class="fa-solid fa-right-from-bracket"></i></button>
                    </div>

                {Object.values(props.contacts).map((contact,idx)=>{
                    return (
                            <div data-chat={''+contact.chat} onClick={()=>{props.displayActiveChat(contact.chat,contact.name)}} className="contact" key={idx} >
                                <div className="profile">
                                    <div className="profileImg">
                                        {/* <img src=""  /> */}
                                    </div>
                                    <div className="profileName">{contact.name}</div>
                                </div>
                                <div className="notifications"></div>
                            </div>
                            )
                })}

            {/* toogle section to add new contacts */}
                <div className={"add-contact-section  " + (props.isAddcontactActive === true?"active-contact-section":'')}>
                    <h1 className="h1-white">Add A New Contact</h1>
                    <div className="add-contact-inputs">
                        <input type="text" name="contact-name" placeholder="Enter Name of Contact..."/>
                        <button>Search</button>
                    </div>
                    <div class="user-list-wrapper">
                        <div className="user-lists">
                            { props.suggestedContacts&&props.suggestedContacts.map((contact,idx)=>{
                                // {console.log('contact:',contact)}
                                return (
                                    <div className="suggested-contact" key={idx}>
                                        <i class="fa-solid fa-user user-icon"></i>
                                        <div className="user-name">{contact.displayName}</div>
                                        <div >
                                            {
                                                (!props.outgoingRequests[contact.uid])?<i onClick={(e)=>addContact(e,contact.uid)} className="confirm-contact-btn fa-solid fa-user-plus"></i>
                                                :<i  className="confirm-contact-btn fa-solid fa-envelope-circle-check"></i>
                                            }
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                        <div className="user-lists">
                            <span><h3>Incoming Requests</h3></span>
                            {
                                props.incomingRequests&&props.incomingRequests.map((contact,idx)=>{
                                    return (props.contacts[contact.sender])? '':
                                    (
                                        <div className="suggested-contact" key={idx}>
                                            <i class="fa-solid fa-user user-icon"></i>
                                            <div className="user-name">{contact.name}</div>
                                            <div >
                                                {
                                                    <i onClick={(e)=>acceptContact(e,contact.sender,contact.name)} className="confirm-contact-btn fa-solid fa-circle-check"></i>
                                                }
                                            </div>
                                        </div>
                                    )
                                })
                            }
                        </div>
                    </div>
                </div>

            </div>
        </div>
        )}