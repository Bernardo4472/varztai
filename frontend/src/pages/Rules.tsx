import React from "react";
import "./StylesRules.css";
import { useNavigate } from "react-router-dom";

const BlackjackRules: React.FC = () => {
  const navigate = useNavigate();

return (
  <div className="page_Container">
    <div className="container">
      <h1 className="title">Blackjack Rules</h1>

      <div className="form-box">
        <div className="rules-text">
          <section>
            <h2>🎯 Objective</h2>
            <p>Get as close to 21 points as possible without exceeding it.</p>
          </section>

          <section>
            <h2>🃏 Card Values</h2>
            <ul>
              <li>Numbers (2–10): their face value.</li>
              <li>Jack, Queen, King – 10 points each.</li>
              <li>Ace – 1 or 11 points (whichever is more beneficial).</li>
            </ul>
          </section>

          <section>
            <h2>🕹️ Gameplay</h2>
            <ul>
              <li>The player and dealer each receive 2 cards (one of the dealer's is hidden).</li>
              <li>The player can choose to:
                <ul>
                  <li><strong>Hit</strong> – draw another card.</li>
                  <li><strong>Stand</strong> – stop and pass the turn to the dealer.</li>
                </ul>
              </li>
              <li>The dealer draws cards until reaching at least 17 points.</li>
            </ul>
          </section>

          <section>
            <h2>🏆 Winning Conditions</h2>
            <ul>
              <li>The player wins if their total is closer to 21 than the dealer’s.</li>
              <li>If the dealer goes over 21 – the player wins automatically.</li>
              <li>Draw – if both have the same score.</li>
            </ul>
          </section>

          <section>
            <h2>🎉 Blackjack</h2>
            <p>If you get an Ace and a 10-point card right away – automatic win, unless the dealer also has Blackjack.</p>
          </section>

          <button className="menu-btn" onClick={() => navigate("/Lobby")}>
            Back to Menu
          </button>
        </div>
      </div>
    </div>
  </div>
);

};

export default BlackjackRules;
