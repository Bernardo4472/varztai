import React, { useEffect, useState } from "react";
import io from "socket.io-client";
import { useNavigate } from "react-router-dom";

const socket = io("http://localhost:3000"); // Prisijungiame prie serverio

const Main = () => {
    const navigate = useNavigate();
    const handleDirectoryPlay = () => {

        navigate("/PlayChoose");
    };
    const handleDirectorySettings = () => {
        
        navigate("/Settings");
    };
    const handleDirectoryRules = () => {
        
        navigate("/Rules");
    };
    const [players, setPlayers] = useState([]);

    useEffect(() => {
        socket.on("connect", () => {
            console.log("✅ Prisijungta prie serverio!");
        });

        socket.on("players", (playersData) => {
            setPlayers(playersData);
        });

        return () => {
            socket.off("players");
        };
    }, []);

    const placeBet = (amount) => {
        socket.emit("bet", amount);
    };

    return (
        <div>
            <div className="page_Container">
            <h1 class="title">Blackjack žaidimas</h1>
            <div class="container">
                <div class="form-box">
                    <h2 class="form-title">Pasirinkite</h2>
                        <button onClick={handleDirectoryPlay}>
                        Žaisti
                    </button>
                        <button onClick={handleDirectorySettings}>
                        Nustatymai
                    </button>
                    <button>
                        Išjungti
                    </button>
                    <button onClick={handleDirectoryRules}>
                        Taisyklės
                    </button>
                </div>
            </div>
            </div>
        </div>
    );
};

export default Main;
