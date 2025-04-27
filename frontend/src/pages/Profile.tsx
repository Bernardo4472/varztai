import React from "react";
import './Styles.css'; // Importuojame CSS failą

const Profile: React.FC = () => {
    return (
        <div className="page_Container">
            <div className="title">Profilis</div>

            <div className="container">
                <div className="form-title">Player Information</div>
                <div className="form-box">
                    <div className="input-container">
                        <strong>Nickname:</strong> <span>&nbsp;Testas</span>
                    </div>
                    <div className="input-container">
                        <strong>Games Played: </strong> <span>&nbsp;120</span>
                    </div>
                    <div className="input-container">
                        <strong>Wins: </strong> <span>&nbsp;85</span>
                    </div>
                    <div className="input-container">
                        <strong>Losses: </strong> <span>&nbsp;35</span>
                    </div>
                    <div className="input-container">
                        <strong>Current Balance: </strong> <span>&nbsp;$500</span>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default Profile;
