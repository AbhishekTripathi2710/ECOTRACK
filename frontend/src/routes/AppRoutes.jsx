import React from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import UserAuth from "../auth/UserAuth";
import Home from "../pages/hOME.JSX";
import Login from "../pages/Login";
import Register from "../pages/Register";
import CarbonCalculator from "../pages/CarbonCalculator";
import About from "../pages/About";



const AppRoutes = () => {
    return(
        <BrowserRouter>
        <Routes>
            <Route path="/" element={<UserAuth><About></About></UserAuth>}></Route>
            <Route path="/home"  element={<UserAuth><Home></Home></UserAuth>}></Route>
            <Route path="/login" element={<Login></Login>}></Route>
            <Route path="/register" element={<Register></Register>}></Route>
            <Route path="/calculator" element={<UserAuth><CarbonCalculator></CarbonCalculator></UserAuth>}></Route>
        </Routes>
        </BrowserRouter>
    )
}

export default AppRoutes;