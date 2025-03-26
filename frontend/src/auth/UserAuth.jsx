import React, { useContext, useEffect, useState } from "react";
import { UserContext } from "../context/userContext";
import { useNavigate } from "react-router-dom";

const UserAuth = ({children}) => {
    const {user, loading: userLoading} = useContext(UserContext)
    const [loading, setLoading] = useState(true);
    const token = localStorage.getItem('authToken')
    const navigate = useNavigate()

    useEffect(() => {
        if (!userLoading) {
            if (user && token) {
                setLoading(false)
            } else {
                navigate('/login')
            }
        }
    }, [user, token, userLoading, navigate])

    if (loading || userLoading) {
        return <div className="min-h-screen flex items-center justify-center">
            <div className="text-xl">Loading...</div>
        </div>
    }

    return (
        <>
            {children}
        </>
    )
}

export default UserAuth;