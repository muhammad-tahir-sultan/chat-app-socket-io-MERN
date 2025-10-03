import React, { createContext, useContext, useEffect, useState } from "react";
import { authContext } from "./authContext";
import toast from "react-hot-toast";

export const ChatContext = createContext()


export const ChatContextProvider = ({ children }) => {

    const [messages, setMessages] = useState([]) //centeral chat area
    const [users, setUsers] = useState([]) // left sidebar users
    const [selectedUser, setSelectedUser] = useState(null) // left sidebar individual user, we want to chat
    const [unseenMessage, setUnseenMessage] = useState({}) // we will store key-value pair {userId: no of message not seen}

    const { axios, socket } = useContext(authContext)

    // function to get all users from sidebar
    const getUsers = async () => {
        try {
            const { data } = await axios.get("/api/messages/users")

            if (data.success) {
                setUsers(data.users)
                setUnseenMessage(data.unseenMessages)
            }
        } catch (error) {
            console.log(error.response?.data?.message || error.message);
            toast.error(error.response?.data?.message || "Fetching failed");
        }
    }

    // function to get messages for selected user
    const getMessages = async (userId) => {
        try {
            const { data } = await axios.get(`/api/messages/${userId}`)

            if (data.success) {
                setMessages(data.messages)
            }
        } catch (error) {
            console.log(error.response?.data?.message || error.message);
            toast.error(error.response?.data?.message || "Fetching failed");
        }
    }

    // function to send messages for selected user
    const sendMessage = async (messageData) => {
        try {
            const { data } = await axios.post(`/api/messages/send/${selectedUser?._id}`, messageData)

            if (data.success) {
                setMessages((prevMessages) => [...prevMessages, data.newMessage])
            } else {
                toast.error(data?.message)
            }
        } catch (error) {
            console.log(error.response?.data?.message || error.message);
            toast.error(error.response?.data?.message || "Fetching failed");
        }
    }


    // function to get new messages instantly real time for selected user 
    const subscribeToMessage = async () => {
        try {
            if (!socket) return

            socket.on("newMessage", async (newMessage) => {
                if (selectedUser && newMessage.senderId === selectedUser?._id) {
                    newMessage.seen = true // setting true before api call - optimistic UI update
                    setMessages((prevMessages) => [...prevMessages, newMessage])

                    try {
                        await axios.put(`/api/messages/mark/${newMessage._id}`);
                    } catch (error) {
                        // rollback if failed
                        newMessage.seen = false;
                        setMessages((prev) =>
                            prev.map(msg => msg._id === newMessage._id ? { ...msg, seen: false } : msg)
                        );
                    }

                } else {
                    // add new message in the previous unseen messages object if messages already exist else set unseen message as 1; 
                    setUnseenMessage((prevUnseenMessages) => ({
                        ...prevUnseenMessages, [newMessage.senderId]: prevUnseenMessages[newMessage.senderId] ? prevUnseenMessages[newMessage.senderId] + 1 : 1
                    }))
                }

            })

        } catch (error) {
            console.log(error.response?.data?.message || error.message);
            toast.error(error.response?.data?.message);
        }
    }

    // function to unsubscribe messages 
    const unsubscribeToMessage = async () => {
        try {
            if (socket) socket.off("newMessage")

        } catch (error) {
            console.log(error.response?.data?.message || error.message);
            toast.error(error.response?.data?.message);
        }
    }



    useEffect(() => {
        subscribeToMessage()

        return () => unsubscribeToMessage()

    }, [socket, selectedUser])




    const value = {
        messages,
        users,
        selectedUser,
        getUsers,
        setMessages,
        sendMessage,
        setSelectedUser,
        unseenMessage,
        setUnseenMessage,
        getMessages,

    }

    return <ChatContext.Provider value={value}>
        {children}
    </ChatContext.Provider>
}


