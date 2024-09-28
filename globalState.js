import { createContext, useState } from "react";

const GlobalStateContext = createContext({
    user : null , 
    setUser : ()=>{}
});

const ContextProvider = ({ children }) => {

    const [user , setUser] = useState(null)

    return(
        <GlobalStateContext.Provider value={{
            user,
            setUser,
        }}>
            {children}
        </GlobalStateContext.Provider>
    )

}

export { ContextProvider , GlobalStateContext };