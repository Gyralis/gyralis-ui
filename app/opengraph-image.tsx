import { ImageResponse } from "next/og"

import { siteConfig } from "@/config/site"

export const runtime = "edge"

export const alt = "Gyralis Open Graph Image"
export const size = {
  width: 1200,
  height: 630,
}

export const contentType = "image/png"

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          position: "relative",
          overflow: "hidden",
          padding: "54px",
          backgroundColor: "#f8fafc",
          backgroundImage:
            "linear-gradient(135deg, #fff7ed 0%, #eff6ff 48%, #ecfdf5 100%)",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: "-140px",
            right: "-90px",
            width: "420px",
            height: "420px",
            borderRadius: "9999px",
            background:
              "radial-gradient(circle, rgba(251,146,60,0.28) 0%, rgba(251,146,60,0) 70%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "-120px",
            left: "-40px",
            width: "460px",
            height: "460px",
            borderRadius: "9999px",
            background:
              "radial-gradient(circle, rgba(45,212,191,0.24) 0%, rgba(45,212,191,0) 72%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: "72px",
            right: "118px",
            width: "168px",
            height: "168px",
            borderRadius: "44px",
            background:
              "linear-gradient(135deg, rgba(96,165,250,0.88) 0%, rgba(45,212,191,0.88) 100%)",
            transform: "rotate(20deg)",
            boxShadow: "0 24px 80px rgba(14, 116, 144, 0.22)",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: "118px",
            right: "230px",
            width: "110px",
            height: "110px",
            borderRadius: "9999px",
            background:
              "linear-gradient(135deg, rgba(251,113,133,0.95) 0%, rgba(244,114,182,0.95) 100%)",
            boxShadow: "0 18px 60px rgba(190, 24, 93, 0.2)",
          }}
        />
        <div
          style={{
            position: "relative",
            zIndex: 1,
            display: "flex",
            flex: 1,
            borderRadius: "40px",
            border: "1px solid rgba(255,255,255,0.7)",
            background: "rgba(255,255,255,0.72)",
            boxShadow:
              "0 30px 90px rgba(15, 23, 42, 0.10), inset 0 1px 0 rgba(255,255,255,0.85)",
            padding: "48px",
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              width: "100%",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "16px",
              }}
            >
              <img
                alt="Gyralis Logo"
                src={new URL(
                  "../public/gyralis-logo.svg",
                  import.meta.url
                ).toString()}
                width="56"
                height="56"
              />
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  borderRadius: "9999px",
                  padding: "10px 18px",
                  fontSize: "20px",
                  color: "#334155",
                  background: "rgba(255,255,255,0.86)",
                  border: "1px solid rgba(148,163,184,0.25)",
                }}
              >
                Loop-based participation
              </div>
            </div>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "18px",
                maxWidth: "720px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  fontSize: "92px",
                  lineHeight: 0.92,
                  letterSpacing: "-0.06em",
                  color: "#0f172a",
                  fontWeight: 700,
                }}
              >
                {siteConfig.name}
              </div>
              <div
                style={{
                  display: "flex",
                  fontSize: "34px",
                  lineHeight: 1.25,
                  color: "#334155",
                  maxWidth: "820px",
                }}
              >
                Build trust, reward real participation, and turn daily rituals
                into visible reputation.
              </div>
            </div>

            <div
              style={{
                display: "flex",
                gap: "18px",
              }}
            >
              {[
                "Human-first",
                "Cross-chain loops",
                "Transparent reputation",
              ].map((item) => (
                <div
                  key={item}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    borderRadius: "9999px",
                    padding: "12px 20px",
                    fontSize: "24px",
                    color: "#1e293b",
                    background:
                      "linear-gradient(135deg, rgba(255,255,255,0.92) 0%, rgba(248,250,252,0.82) 100%)",
                    border: "1px solid rgba(148,163,184,0.22)",
                  }}
                >
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
        <div
          style={{
            position: "absolute",
            right: "122px",
            bottom: "76px",
            display: "flex",
            flexDirection: "column",
            gap: "16px",
            padding: "24px",
            borderRadius: "28px",
            background: "rgba(255,255,255,0.78)",
            border: "1px solid rgba(255,255,255,0.72)",
            boxShadow: "0 24px 80px rgba(15, 23, 42, 0.10)",
            minWidth: "240px",
          }}
        >
          <div
            style={{
              display: "flex",
              fontSize: "18px",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: "#64748b",
            }}
          >
            Web3
          </div>
          <div
            style={{
              display: "flex",
              fontSize: "28px",
              lineHeight: 1.2,
              color: "#0f172a",
              fontWeight: 700,
            }}
          >
            Prove participation.
            <br />
            Grow reputation.
          </div>
        </div>
      </div>
    ),
    {}
  )
}
