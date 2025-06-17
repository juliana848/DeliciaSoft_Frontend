import React from "react";

function Modal({ code, onClose }) {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
      }}
    >
      <div
        style={{
          background: "white",
          borderRadius: "10px",
          padding: "2rem",
          width: "300px",
          textAlign: "center",
        }}
      >
        <h2 style={{ fontSize: "1.25rem", marginBottom: "1rem" }}>¡Tu código especial!</h2>
        <p style={{ fontSize: "1.5rem", fontWeight: "bold", color: "#0070f3" }}>{code}</p>
        <button
          onClick={onClose}
          style={{
            marginTop: "1.5rem",
            padding: "0.5rem 1rem",
            backgroundColor: "#e91e63",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
          }}
        >
          Cerrar
        </button>
      </div>
    </div>
  );
}

export default Modal;
