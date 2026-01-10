import React from "react";

export default function Home() {
  return (
    <main style={{ margin: 0, padding: 0 }}>
      <iframe
        src="/inventory.html"
        style={{
          border: "none",
          display: "block",
          width: "100vw",
          height: "100vh",
          background: "#f5f5f5",
        }}
        title="Medha Inventory"
      />
    </main>
  );
}
