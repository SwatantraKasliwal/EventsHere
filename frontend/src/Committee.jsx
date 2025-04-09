import React from "react";
import "./Committee.css";

function Committee({ cName, cImage, cDesc, cLink }) {
  return (
    <div className="committee-card">
      <div className="committee-image-container">
        <img src={cImage} alt={cName} className="committee-image" />
      </div>
      <div className="committee-content">
        <h3 className="committee-title">{cName}</h3>
        <p className="committee-description">{cDesc}</p>
      </div>
      <div className="committee-actions">
        <a href={cLink} className="committee-link">
          <button className="committee-button">Visit</button>
        </a>
      </div>
    </div>
  );
}

export default Committee;
