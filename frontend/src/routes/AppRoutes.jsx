import React from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import UserAuth from "../auth/UserAuth";
import Home from "../pages/hOME.JSX";
import Login from "../pages/Login";
import Register from "../pages/Register";



const AppRoutes = () => {
    return(
        <BrowserRouter>
        <Routes>
            <Route path="/"  element={<UserAuth><Home></Home></UserAuth>}></Route>
            <Route path="/login" element={<Login></Login>}></Route>
            <Route path="/register" element={<Register></Register>}></Route>
            </Routes>
        </BrowserRouter>
    )
}

export default AppRoutes;