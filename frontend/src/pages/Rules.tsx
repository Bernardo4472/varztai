import React from "react";
import "./StylesRules.css";
import { useNavigate } from "react-router-dom";

const BlackjackRules: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="page_Container">
      <div className="container">
        <h1 className="title">Blackjack taisyklės</h1>

        <div className="form-box">
          <div className="rules-text">
            <section>
              <h2>🎯 Žaidimo tikslas</h2>
              <p>Surinkti kuo artimesnę 21 taškui kortų sumą, neviršijant jos.</p>
            </section>

            <section>
              <h2>🃏 Kortų reikšmės</h2>
              <ul>
                <li>Skaičiai (2–10): jų vertė atitinka skaičių.</li>
                <li>Valetas, dama, karalius – 10 taškų.</li>
                <li>Tūzas – 1 arba 11 taškų (atsižvelgiama į naudingesnę reikšmę).</li>
              </ul>
            </section>

            <section>
              <h2>🕹️ Žaidimo eiga</h2>
              <ul>
                <li>Žaidėjas ir dalintojas gauna po 2 kortas (viena iš dalintojo – paslėpta).</li>
                <li>Žaidėjas gali pasirinkti:
                  <ul>
                    <li><strong>Hit</strong> – traukti dar vieną kortą.</li>
                    <li><strong>Stand</strong> – sustoti ir perduoti ėjimą dalintojui.</li>
                  </ul>
                </li>
                <li>Dalintojas traukia kortas, kol surenka bent 17 taškų.</li>
              </ul>
            </section>

            <section>
              <h2>🏆 Pergalės sąlygos</h2>
              <ul>
                <li>Žaidėjas laimi, jei jo taškai arčiau 21 nei dalintojo.</li>
                <li>Jei dalintojas viršija 21 – žaidėjas automatiškai laimi.</li>
                <li>Lygiosios – jei taškai vienodi.</li>
              </ul>
            </section>

            <section>
              <h2>🎉 Blackjack</h2>
              <p>Jei iškart gauni tūzą ir 10 taškų kortą – automatinė pergalė, išskyrus atvejį, jei dalintojas taip pat turi Blackjack.</p>
            </section>

            <button className="menu-btn" onClick={() => navigate("/Lobby")}>
              Grįžti į meniu
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlackjackRules;
