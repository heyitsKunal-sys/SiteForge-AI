import { createContext, useContext, useEffect, useState } from "react";
import { getMe } from "../utils/api.js";


const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem("token")
        const savedUser = localStorage.getItem("user")

        if (token && savedUser) {
            setUser(JSON.parse(savedUser));

            getMe().then(({ user }) => {
                setUser(user);
                localStorage.setItem("user", JSON.stringify(user));

            })
                .catch(() => {
                    localStorage.removeItem("token");
                    localStorage.removeItem("user");
                    setUser(null)
                })
                .finally(() => setLoading(false));
        } else {
            setLoading(false);
        }


    }, []);
    const loginUser = (token, userData) => {
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(userData));
        setUser(userData);

    }
    // to logout
    const logoutUser = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setUser(null);
    }
    // to update userProfile for (credits too)
    const updateUser = (userData) => {
        setUser(userData);
        if (userData) localStorage.setItem("user", JSON.stringify(userData))
    }



    return (
        <AuthContext.Provider value={
            {
                user,
                loading,
                loginUser,
                logoutUser,
                updateUser,
                setUser,
            }
        }

        
        >
            {children}
        </AuthContext.Provider>
    );

};

export const useAuth = () => useContext(AuthContext)