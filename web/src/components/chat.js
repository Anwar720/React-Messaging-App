import React from "react";

export const Chat = (props)=>{
    const sendMessage = async (e)=>{
        e.preventDefault();
        if(!props.activeChat.user)
            return
        let message = e.target.elements.msg;
        await props.sendMessage(message.value)
        document.querySelector('.message-input').reset()
    }

    const AlwaysScrollToBottom = () => {
        const elementRef = React.useRef(document.querySelector(`div[data-chat=${props.activeChat.chat}]`));
        React.useEffect(() => elementRef.current.scrollIntoView({inline: "center", }));
        return <div ref={elementRef} />;
    };

    return (
        <div className="chat-container">
            <div className="contact-info">
                <button className="contact-options">
                    <i class="fa-solid fa-angle-left" onClick={()=>props.setIsChatActive(false)}></i>
                </button>
                <div className="profile">
                    <div className="profileImg"></div>
                    <div className="profileName">{props.activeChat.user}</div>
                </div>
                
            </div>

            <div className="chat-box">
            <div className="chat">
            {(props.messages && Object.keys(props.messages).length) &&
                    Object.keys(props.messages).map((contact,idx)=>{
                        let user = props.messages[contact]    
                        return(
                        <div key={idx} className={"messages  " + (props.activeChat.chat === contact ? 'active' : '')} data-chatid={contact}  >
                            {
                                user.map((msg,k)=>{
                                    return <div className={"msg-container  " + (msg.sentFrom === props.user.current ? 'msg-owner' : '')} key={k} style={{color:"white"}}>{msg.message}
                                        <span className="message-from">{msg["sentFrom"]}</span> 
                                        <span className="message-date">{msg["date"]}</span></div>
                                })
                            }
                                <AlwaysScrollToBottom />
                        </div>
                        )
                    })
                }

            </div>
            {
                (props.activeChat.user) &&
                <form className="message-input" onSubmit={sendMessage}>
                    <input required className="msg-input-field" name="msg" type="text" placeholder="Type Your Message Here....."/>
                    <button><i className="fa-solid fa-paper-plane"></i></button>
                </form>
            }
            </div>
        </div> 
    )
}
