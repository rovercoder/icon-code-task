import React from "react";
import "./loader.css";

interface LoaderProps {
    message?: string;
}

const Loader: React.FC<LoaderProps> = ({ message = "Loading..." }) => {
    return (
        <div className="loader-container">
            <div className="spinner"></div>
            <span className="loader-text">{message}</span>
        </div>
    );
};

export default Loader;
