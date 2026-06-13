import React, { forwardRef } from "react";
import { Globe } from "lucide-react";

// 80G Tax Exemption Certificate — printable / downloadable layout
// Mirrors the official format (NPO 80G donor certificate)
const Certificate = forwardRef(function Certificate({ data }, ref) {
  if (!data) return null;

  const {
    certificateNo,
    date,
    financialYear,
    donorName,
    donorPan,
    totalAmount,
    items = [],
    ngoName = "FoodBridge Foundation",
    ngoAddress = ["E-215, Third Floor, East of Kailash", "New Delhi", "Postal Code: 110065", "India"],
    ngoEmail = "info@foodbridge.org",
    ngoPan = "AAATF1234C",
    eightyGNumber = "NQ.CIT(E)I2018-19/DEL-FB28615-27062018/10087",
    eightyGValidFrom = "31-03-2021",
  } = data;

  return (
    <div
      ref={ref}
      data-testid="certificate-print-area"
      style={{
        width: "780px",
        minHeight: "1100px",
        background: "#ffffff",
        color: "#0f172a",
        padding: "60px 70px",
        fontFamily: "'Times New Roman', Georgia, serif",
        boxSizing: "border-box",
        border: "1px solid #e5e7eb",
      }}
    >
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "40px" }}>
        <div
          style={{
            width: "72px",
            height: "72px",
            borderRadius: "50%",
            background: "linear-gradient(135deg,#16A34A,#F97316)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "white",
            boxShadow: "0 6px 18px rgba(22,163,74,0.25)",
          }}
        >
          <Globe size={36} />
        </div>
        <div style={{ lineHeight: 1.15 }}>
          <div style={{ fontSize: "11px", letterSpacing: "3px", color: "#b45309", fontWeight: 700 }}>
            FOODBRIDGE
          </div>
          <div style={{ fontSize: "11px", letterSpacing: "3px", color: "#b45309", fontWeight: 700 }}>
            FOUNDATION
          </div>
        </div>
      </div>

      <div style={{ textAlign: "center", marginBottom: "10px" }}>
        <h1 style={{ fontSize: "20px", fontWeight: 700, margin: 0 }}>
          {ngoName} Donor 80G Certificate
        </h1>
        <h2 style={{ fontSize: "18px", fontWeight: 700, margin: "12px 0 0 0" }}>
          Financial Cycle {financialYear}
        </h2>
      </div>

      <div style={{ marginTop: "44px", fontSize: "14px", lineHeight: 1.8 }}>
        <div>
          <strong>Certificate No. :</strong> {certificateNo}
        </div>
        <div>
          <strong>Date :</strong> {date}
        </div>
      </div>

      <p style={{ marginTop: "30px", fontSize: "14px", lineHeight: 1.8 }}>
        This is to confirm that the <strong>{ngoName}</strong> received a food donation valued at{" "}
        <strong>₹ {Number(totalAmount).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</strong>{" "}
        from <strong>{donorName}</strong>
        {donorPan ? (
          <>
            {" "}
            (PAN: <strong>{donorPan}</strong>)
          </>
        ) : null}{" "}
        as per the donation details given below:
      </p>

      {/* Items table */}
      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          marginTop: "20px",
          fontSize: "13px",
        }}
      >
        <thead>
          <tr style={{ background: "#f3f4f6" }}>
            <th style={cellHead}>Date</th>
            <th style={cellHead}>Donation</th>
            <th style={{ ...cellHead, textAlign: "right" }}>Value (₹)</th>
            <th style={{ ...cellHead, textAlign: "right" }}>Donation ID</th>
          </tr>
        </thead>
        <tbody>
          {items.map((it, i) => (
            <tr key={i}>
              <td style={cell}>{it.date}</td>
              <td style={cell}>
                {it.foodName} — {it.quantity} meals
              </td>
              <td style={{ ...cell, textAlign: "right" }}>
                {Number(it.value).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
              </td>
              <td style={{ ...cell, textAlign: "right" }}>FB-{it.id}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <p style={{ marginTop: "30px", fontSize: "14px", lineHeight: 1.8 }}>
        We thank you for your contribution towards the corpus of the {ngoName} and helping support our
        mission to fight hunger and reduce food waste.
      </p>

      {/* NGO address */}
      <div style={{ marginTop: "32px", fontSize: "13px", lineHeight: 1.6, color: "#374151" }}>
        {ngoAddress.map((line, i) => (
          <div key={i}>{line}</div>
        ))}
        <div>Email: {ngoEmail}</div>
      </div>

      {/* Footer */}
      <div style={{ textAlign: "center", marginTop: "48px", fontSize: "13px" }}>
        <em style={{ color: "#6b7280" }}>Computer generated receipt — Does not require signature</em>
        <div style={{ marginTop: "18px", fontWeight: 700 }}>
          {ngoName}'s PAN Account No : {ngoPan}
        </div>
        <div style={{ marginTop: "10px" }}>
          <strong>80G Number :</strong> {eightyGNumber} ( w.e.f. {eightyGValidFrom} )
        </div>
      </div>
    </div>
  );
});

const cellHead = {
  padding: "10px 12px",
  textAlign: "left",
  fontWeight: 700,
  borderBottom: "1px solid #d1d5db",
  fontSize: "13px",
};

const cell = {
  padding: "10px 12px",
  borderBottom: "1px solid #e5e7eb",
  fontSize: "13px",
};

export default Certificate;
