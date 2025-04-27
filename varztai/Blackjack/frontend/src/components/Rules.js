import React from "react";
import "./Styles.css"; 
import { useNavigate } from "react-router-dom";

const BlackjackRules = () => {
  const navigate = useNavigate();//dw

  return (
    <div className="page_Container">
      <div className="container">
        <h1 className="title">Blackjack taisyklės</h1>

        <div className="form-box">
            <div className="text-color">
          <p>
            <strong>🎯 Žaidimo tikslas:</strong> Surinkti kuo artimesnę 21 taškui kortų sumą, neviršijant jos.
          </p>

          <p>
            <strong>🃏 Kortų reikšmės:</strong>
          </p>
          <ul style={{ textAlign: "left" }}>
            <li>Skaičiai (2–10): jų vertė atitinka skaičių.</li>
            <li>Valetas, dama, karalius – 10 taškų.</li>
            <li>Tūzas – 1 arba 11 taškų (atsižvelgiama į naudingesnę reikšmę).</li>
          </ul>

          <p>
            <strong>🕹️ Žaidimo eiga:</strong>
          </p>
          <ul style={{ textAlign: "left" }}>
            <li>Žaidėjas ir dalintojas gauna po 2 kortas (viena iš dalintojo – paslėpta).</li>
            <li>Žaidėjas gali pasirinkti:
              <ul>
                <li><strong>Hit</strong> – traukti dar vieną kortą.</li>
                <li><strong>Stand</strong> – sustoti ir perduoti ėjimą dalintojui.</li>
              </ul>
            </li>
            <li>Dalintojas traukia kortas, kol surenka bent 17 taškų.</li>
          </ul>

          <p>
            <strong>🏆 Pergalės sąlygos:</strong>
          </p>
          <ul style={{ textAlign: "left" }}>
            <li>Žaidėjas laimi, jei jo taškai arčiau 21 nei dalintojo.</li>
            <li>Jei dalintojas viršija 21 – žaidėjas automatiškai laimi.</li>
            <li>Lygiosios – jei taškai vienodi.</li>
          </ul>

          <p>
            <strong>🎉 Blackjack:</strong> Jei iškart gauni tūzą ir 10 taškų kortą – automatinė pergalė, išskyrus atvejį, jei dalintojas taip pat turi Blackjack.
          </p>

          <button className="menu-btn" onClick={() => navigate("/")}>
            Grįžti į meniu
          </button>
        </div>
      </div>
    </div>
    </div> 
  );
};

export default BlackjackRules;
