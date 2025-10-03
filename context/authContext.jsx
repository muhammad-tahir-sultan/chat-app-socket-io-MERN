import axios from "axios";
import React, { createContext, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { io } from "socket.io-client";

export const authContext = createContext()

// make all axios api request on backendUrl automatically
const backendUrl = import.meta.env.VITE_BACKEND_URL
axios.defaults.baseURL = backendUrl


export const AuthProvider = ({ children }) => {
    const [token, setToken] = useState(localStorage.getItem("token"))
    const [authUser, setAuthUser] = useState(null)
    const [onlineUsers, setOnlineUsers] = useState([])
    const [socket, setSocket] = useState(null)


    // check id user is authenticated and if so, set the user data and connect the socket
    const checkAuth = async () => {
        try {
            const { data } = await axios.get("/api/auth/check");
            if (data.success) {
                setAuthUser(data.user);
                connectSocket(data.user);
            }
        } catch (error) {
            console.log(error.response?.data?.message || error.message);
            toast.error(error.response?.data?.message || "Auth check failed");
            logout(); // force logout if token invalid
        }
    };

    // login function to handle authentication and socket connection
    const login = async (state, credentials) => {
        try {
            const { data } = await axios.post(`/api/auth/${state}`, credentials)

            if (data.success) {
                setAuthUser(data.userData)
                connectSocket(data.userData)
                axios.defaults.headers.common["token"] = data.token
                setToken(data.token)
                localStorage.setItem("token", data.token)
                toast.success(data.message)
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            console.log(error.response?.data?.message || error.message);
            toast.error(error.response?.data?.message || "Login failed");
        }
    }

    // login function to handle user logout and socket disconnection
    const logout = () => {

        localStorage.removeItem("token")
        setToken(null)
        setAuthUser(null)
        setOnlineUsers([])
        axios.defaults.headers.common["token"] = null
        toast.success("Logged Out Successfully!")
        socket.disconnect()

    }

    // update profile function to handle user profile updates
    const updateProfile = async (body) => {
        try {
            const { data } = await axios.put('/api/auth/updated-profile', body)

            if (data.success) {
                setAuthUser(data.user)
                toast.success(data.message)
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            console.log(error.response?.data?.message || error.message);
            toast.error(error.response?.data?.message || "Update failed");
        }
    }

    // connect user with socket to handle socket connection and online users updates
    const connectSocket = (userData) => {
        if (!userData || socket?.connected) return

        const newSocket = io(backendUrl, {
            query: {
                userId: userData._id
            }
        })

        newSocket.connect()
        setSocket(newSocket)

        newSocket.on("getOnlineUsers", (userIds) => {
            setOnlineUsers(userIds)
        })





    }



    // set token in axios headers whenever token changes
    useEffect(() => {
        if (token) {
            axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        } else {
            delete axios.defaults.headers.common["Authorization"];
        }
    }, [token]);

    useEffect(() => {
        if (token) {
            checkAuth();
        }
    }, [token]);



    const value = {
        axios,
        authUser,
        onlineUsers,
        socket,
        login,
        logout,
        updateProfile
    }


    return <authContext.Provider value={value}>
        {children}
    </authContext.Provider>
}