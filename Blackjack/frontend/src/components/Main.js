import React, { useEffect, useState } from "react";
import io from "socket.io-client";

const socket = io("http://localhost:3000"); // Prisijungiame prie serverio

const Main = () => {
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
            <h1 class="title">Blackjack žaidimas</h1>
            <div class="container">
                <div class="form-box">
                    <h2 class="form-title">Pasirinkite</h2>
                    <button>
                        Žaisti
                    </button>
                    <button>
                        Nustatymai
                    </button>
                    <button>
                        Išjungti
                    </button>
                </div>
            </div>
            <button onClick={() => placeBet(100)}>Statyti 100</button>
            <pre>{JSON.stringify(players, null, 2)}</pre>
        </div>
    );
};

export default Main;
