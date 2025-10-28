"use client"

import { useEffect, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { FaNetworkWired, FaShieldAlt, FaTrophy, FaUsers } from "react-icons/fa"

type ButtonProps = {
  type?: "button" | "submit" | "reset"
  variant?: "primary" | "secondary"
  onClick?: React.DOMAttributes<HTMLButtonElement>["onClick"]
  className?: string
  disabled?: boolean
  children?: React.ReactNode
  isLoading?: boolean
  icon?: React.ReactNode
  style?: React.CSSProperties
}

function Button({
  onClick,
  className = "",
  disabled = false,
  children,
  variant = "primary",
  isLoading = false,
  icon,
  type = "button",
  style,
}: ButtonProps) {
  const baseClass =
    variant === "primary" ? "tamagotchi-button" : "tamagotchi-button-secondary"

  return (
    <button
      type={type}
      className={`${baseClass} flex items-center justify-center gap-2 transition-all ease-out disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
      onClick={onClick}
      disabled={disabled || isLoading}
      style={style}
      aria-disabled={disabled || isLoading ? "true" : "false"}
      aria-label={
        children != null ? (typeof children === "string" ? children : "") : ""
      }
    >
      {isLoading && (
        <span className="loading loading-spinner loading-sm text-inherit" />
      )}
      {icon != null && !isLoading && icon}
      {children}
    </button>
  )
}

function BlobBuddy() {
  const [scrollY, setScrollY] = useState(0)

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY)
    }
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const scrollThreshold = 400
  const animationProgress = Math.min(scrollY / scrollThreshold, 1)

  return (
    <div className="relative flex h-80 w-80 items-center justify-center">
      <div
        className="relative h-64 w-64 rounded-full transition-all duration-700 ease-out"
        style={{
          background: `
            radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.8), transparent 50%),
            radial-gradient(circle at 70% 70%, rgba(0, 0, 0, 0.2), transparent 50%),
            linear-gradient(135deg, #ff6b9d 0%, #c44569 50%, #8e2de2 100%)
          `,
          boxShadow: `
            0 20px 60px rgba(142, 45, 226, 0.4),
            inset -10px -10px 30px rgba(0, 0, 0, 0.3),
            inset 10px 10px 30px rgba(255, 255, 255, 0.2)
          `,
          transform: `
            translateY(${animationProgress * 50}px) 
            rotate(${animationProgress * -10}deg) 
            scale(${1 - animationProgress * 0.2})
          `,
          opacity: 1 - animationProgress * 0.3,
        }}
      >
        <div className="absolute left-12 top-20 h-8 w-8 rounded-full bg-white shadow-lg">
          <div className="absolute left-2 top-2 h-4 w-4 rounded-full bg-gray-900"></div>
          <div className="absolute left-1 top-1 h-2 w-2 rounded-full bg-white"></div>
        </div>
        <div className="absolute right-12 top-20 h-8 w-8 rounded-full bg-white shadow-lg">
          <div className="absolute left-2 top-2 h-4 w-4 rounded-full bg-gray-900"></div>
          <div className="absolute left-1 top-1 h-2 w-2 rounded-full bg-white"></div>
        </div>
        <div className="absolute left-6 top-24 h-6 w-6 rounded-full bg-pink-300 opacity-60 blur-sm"></div>
        <div className="absolute right-6 top-24 h-6 w-6 rounded-full bg-pink-300 opacity-60 blur-sm"></div>
        <div className="absolute bottom-16 left-1/2 h-8 w-16 -translate-x-1/2 transform rounded-full border-b-4 border-gray-900"></div>
        <div
          className="absolute left-8 top-8 h-16 w-16 rounded-full opacity-40 blur-xl"
          style={{
            background:
              "radial-gradient(circle, rgba(255,255,255,0.8) 0%, transparent 70%)",
          }}
        ></div>
      </div>
      <div
        className="absolute right-0 top-0 h-12 w-12 rounded-full transition-all duration-700 ease-out"
        style={{
          background: "linear-gradient(135deg, #ffd89b 0%, #19547b 100%)",
          boxShadow:
            "0 10px 30px rgba(255, 216, 155, 0.4), inset -5px -5px 15px rgba(0, 0, 0, 0.2)",
          transform: `translate(${animationProgress * 60}px, ${
            -animationProgress * 40
          }px) rotate(${animationProgress * 180}deg)`,
          opacity: 1 - animationProgress * 0.5,
        }}
      ></div>
      <div
        className="absolute bottom-0 left-0 h-10 w-10 rounded-full transition-all duration-700 ease-out"
        style={{
          background: "linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)",
          boxShadow:
            "0 10px 30px rgba(168, 237, 234, 0.4), inset -5px -5px 15px rgba(0, 0, 0, 0.2)",
          transform: `translate(${-animationProgress * 50}px, ${
            animationProgress * 60
          }px) rotate(${-animationProgress * 120}deg)`,
          opacity: 1 - animationProgress * 0.5,
        }}
      ></div>
    </div>
  )
}

function CubicCompanion() {
  const [scrollY, setScrollY] = useState(0)

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY)
    }
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const scrollThreshold = 400
  const animationProgress = Math.min(scrollY / scrollThreshold, 1)

  return (
    <div className="perspective-1000 relative flex h-80 w-80 items-center justify-center">
      <div
        className="relative h-48 w-48 transition-all duration-700 ease-out"
        style={{
          transform: `
            translateY(${animationProgress * 50}px) 
            rotateX(${-25 + animationProgress * 15}deg) 
            rotateY(${45 + animationProgress * 20}deg)
            scale(${1 - animationProgress * 0.2})
          `,
          transformStyle: "preserve-3d",
          opacity: 1 - animationProgress * 0.3,
        }}
      >
        <div
          className="absolute inset-0 rounded-2xl"
          style={{
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            boxShadow:
              "0 20px 60px rgba(102, 126, 234, 0.4), inset -10px -10px 20px rgba(0, 0, 0, 0.3)",
            transform: "translateZ(24px)",
          }}
        >
          <div className="absolute left-8 top-12 h-10 w-10 rotate-3 transform rounded-lg bg-white shadow-lg">
            <div className="absolute left-2 top-2 h-6 w-6 rounded-lg bg-gray-900"></div>
            <div className="absolute left-1 top-1 h-3 w-3 rounded-sm bg-white"></div>
          </div>
          <div className="absolute right-8 top-12 h-10 w-10 -rotate-3 transform rounded-lg bg-white shadow-lg">
            <div className="absolute left-2 top-2 h-6 w-6 rounded-lg bg-gray-900"></div>
            <div className="absolute left-1 top-1 h-3 w-3 rounded-sm bg-white"></div>
          </div>
          <div className="absolute bottom-12 left-1/2 h-3 w-20 -translate-x-1/2 transform rounded-full bg-gray-900"></div>
        </div>
        <div
          className="absolute inset-0 rounded-2xl"
          style={{
            background: "linear-gradient(135deg, #8b9dc3 0%, #9d7cbf 100%)",
            boxShadow: "inset -5px -5px 15px rgba(0, 0, 0, 0.2)",
            transform: "rotateX(90deg) translateZ(24px)",
            transformOrigin: "top",
          }}
        ></div>
        <div
          className="absolute inset-0 rounded-2xl"
          style={{
            background: "linear-gradient(135deg, #4a5568 0%, #5a4a7a 100%)",
            boxShadow: "inset -10px -10px 20px rgba(0, 0, 0, 0.4)",
            transform: "rotateY(90deg) translateZ(24px)",
            transformOrigin: "right",
          }}
        ></div>
        <div
          className="absolute left-4 top-4 h-12 w-12 rounded-lg opacity-30 blur-lg"
          style={{
            background:
              "radial-gradient(circle, rgba(255,255,255,0.9) 0%, transparent 70%)",
            transform: "translateZ(25px)",
          }}
        ></div>
      </div>
      <div
        className="absolute right-8 top-8 h-16 w-16 transition-all duration-700 ease-out"
        style={{
          background: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
          boxShadow: "0 15px 40px rgba(240, 147, 251, 0.4)",
          clipPath: "polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)",
          transform: `translate(${animationProgress * 70}px, ${
            -animationProgress * 50
          }px) rotate(${animationProgress * 180}deg)`,
          opacity: 1 - animationProgress * 0.5,
        }}
      ></div>
      <div
        className="absolute bottom-8 left-8 h-14 w-14 transition-all duration-700 ease-out"
        style={{
          background: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
          boxShadow: "0 15px 40px rgba(79, 172, 254, 0.4)",
          clipPath:
            "polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%)",
          transform: `translate(${-animationProgress * 60}px, ${
            animationProgress * 70
          }px) rotate(${-animationProgress * 120}deg)`,
          opacity: 1 - animationProgress * 0.5,
        }}
      ></div>
    </div>
  )
}

function OrbitalOrb() {
  const [scrollY, setScrollY] = useState(0)
  const [rotation, setRotation] = useState(0)

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY)
    }
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      setRotation((prev) => (prev + 1) % 360)
    }, 50)
    return () => clearInterval(interval)
  }, [])

  const scrollThreshold = 400
  const animationProgress = Math.min(scrollY / scrollThreshold, 1)

  return (
    <div className="relative flex h-80 w-80 items-center justify-center">
      <div
        className="relative h-56 w-56 rounded-full transition-all duration-700 ease-out"
        style={{
          background: `
            radial-gradient(circle at 35% 35%, rgba(255, 255, 255, 0.9), transparent 40%),
            radial-gradient(circle at 65% 65%, rgba(0, 0, 0, 0.3), transparent 50%),
            radial-gradient(circle at 50% 50%, #fa709a 0%, #fee140 100%)
          `,
          boxShadow: `
            0 30px 80px rgba(250, 112, 154, 0.5),
            inset -15px -15px 40px rgba(0, 0, 0, 0.4),
            inset 15px 15px 40px rgba(255, 255, 255, 0.3)
          `,
          transform: `
            translateY(${animationProgress * 50}px) 
            scale(${1 - animationProgress * 0.2})
          `,
          opacity: 1 - animationProgress * 0.3,
        }}
      >
        <div className="absolute left-16 top-16 h-10 w-10 rounded-full bg-white shadow-xl">
          <div className="absolute left-2 top-2 h-6 w-6 rounded-full bg-gray-900">
            <div className="absolute left-1 top-1 h-2 w-2 rounded-full bg-white"></div>
          </div>
        </div>
        <div className="absolute right-16 top-16 h-10 w-10 rounded-full bg-white shadow-xl">
          <div className="absolute left-2 top-2 h-6 w-6 rounded-full bg-gray-900">
            <div className="absolute left-1 top-1 h-2 w-2 rounded-full bg-white"></div>
          </div>
        </div>
        <div className="absolute bottom-14 left-1/2 h-10 w-20 -translate-x-1/2 transform rounded-full border-b-4 border-gray-900"></div>
        <div className="absolute left-8 top-20 h-8 w-8 rounded-full bg-pink-400 opacity-50 blur-md"></div>
        <div className="absolute right-8 top-20 h-8 w-8 rounded-full bg-pink-400 opacity-50 blur-md"></div>
      </div>
      <div
        className="absolute inset-0 transition-all duration-700 ease-out"
        style={{
          transform: `rotate(${rotation}deg) scale(${
            1 - animationProgress * 0.15
          })`,
          opacity: 1 - animationProgress * 0.4,
        }}
      >
        <div
          className="absolute left-1/2 top-1/2 h-72 w-72 rounded-full border-4 border-dashed"
          style={{
            borderColor: "rgba(99, 102, 241, 0.3)",
            transform: "translate(-50%, -50%) rotateX(70deg)",
            boxShadow: "0 0 20px rgba(99, 102, 241, 0.2)",
          }}
        >
          <div
            className="absolute left-1/2 top-0 h-6 w-6 -translate-x-1/2 -translate-y-1/2 rounded-full"
            style={{
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              boxShadow: "0 5px 15px rgba(102, 126, 234, 0.5)",
            }}
          ></div>
        </div>
      </div>
      <div
        className="absolute inset-0 transition-all duration-700 ease-out"
        style={{
          transform: `rotate(${-rotation * 0.7}deg) scale(${
            1 - animationProgress * 0.15
          })`,
          opacity: 1 - animationProgress * 0.4,
        }}
      >
        <div
          className="absolute left-1/2 top-1/2 h-80 w-80 rounded-full border-4 border-dotted"
          style={{
            borderColor: "rgba(236, 72, 153, 0.3)",
            transform: "translate(-50%, -50%) rotateX(70deg) rotateZ(60deg)",
            boxShadow: "0 0 20px rgba(236, 72, 153, 0.2)",
          }}
        >
          <div
            className="absolute bottom-0 left-1/2 h-5 w-5 -translate-x-1/2 translate-y-1/2 rounded-full"
            style={{
              background: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
              boxShadow: "0 5px 15px rgba(240, 147, 251, 0.5)",
            }}
          ></div>
        </div>
      </div>
      <div
        className="absolute right-12 top-4 h-3 w-3 bg-yellow-400 transition-all duration-700 ease-out"
        style={{
          clipPath:
            "polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)",
          transform: `translate(${animationProgress * 80}px, ${
            -animationProgress * 60
          }px) rotate(${rotation * 2}deg)`,
          opacity: 1 - animationProgress * 0.5,
        }}
      ></div>
      <div
        className="absolute bottom-8 left-4 h-4 w-4 bg-cyan-400 transition-all duration-700 ease-out"
        style={{
          clipPath:
            "polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)",
          transform: `translate(${-animationProgress * 70}px, ${
            animationProgress * 80
          }px) rotate(${-rotation * 1.5}deg)`,
          opacity: 1 - animationProgress * 0.5,
        }}
      ></div>
    </div>
  )
}

function LoopOctopus() {
  return (
    <div className="relative flex h-80 w-80 items-center justify-center">
      <motion.div
        className="relative z-10"
        animate={{
          y: [0, -10, 0],
        }}
        transition={{
          duration: 3,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
        }}
      >
        <div className="relative h-48 w-48">
          <div
            className="absolute inset-0 rounded-full bg-gradient-to-br from-pink-300 via-pink-400 to-pink-600 dark:from-pink-500 dark:via-pink-600 dark:to-pink-800"
            style={{
              boxShadow: `
                inset -20px -20px 40px rgba(0,0,0,0.2),
                inset 20px 20px 40px rgba(255,255,255,0.3),
                0 20px 40px rgba(0,0,0,0.3)
              `,
            }}
          />
          <div className="absolute left-8 top-8 h-16 w-16 rounded-full bg-white/40 blur-xl" />
          <div
            className="absolute left-12 top-16 h-12 w-12 rounded-full bg-white dark:bg-gray-100"
            style={{ boxShadow: "0 4px 8px rgba(0,0,0,0.2)" }}
          >
            <motion.div
              className="absolute left-2 top-2 h-8 w-8 rounded-full bg-gray-900"
              animate={{ x: [0, 2, 0, -2, 0] }}
              transition={{ duration: 4, repeat: Number.POSITIVE_INFINITY }}
            >
              <div className="absolute left-1 top-1 h-3 w-3 rounded-full bg-white" />
            </motion.div>
          </div>
          <div
            className="absolute right-12 top-16 h-12 w-12 rounded-full bg-white dark:bg-gray-100"
            style={{ boxShadow: "0 4px 8px rgba(0,0,0,0.2)" }}
          >
            <motion.div
              className="absolute left-2 top-2 h-8 w-8 rounded-full bg-gray-900"
              animate={{ x: [0, -2, 0, 2, 0] }}
              transition={{ duration: 4, repeat: Number.POSITIVE_INFINITY }}
            >
              <div className="absolute left-1 top-1 h-3 w-3 rounded-full bg-white" />
            </motion.div>
          </div>
          <div className="absolute bottom-12 left-1/2 h-8 w-16 -translate-x-1/2 rounded-b-full border-b-4 border-gray-800 dark:border-gray-900" />
          <div className="absolute left-4 top-20 h-6 w-8 rounded-full bg-pink-400/50 blur-sm dark:bg-pink-500/50" />
          <div className="absolute right-4 top-20 h-6 w-8 rounded-full bg-pink-400/50 blur-sm dark:bg-pink-500/50" />
        </div>
        {[...Array(8)].map((_, i) => {
          const angle = i * 45 - 90
          const colors = [
            "from-blue-400 to-blue-600",
            "from-green-400 to-green-600",
            "from-purple-400 to-purple-600",
            "from-orange-400 to-orange-600",
            "from-teal-400 to-teal-600",
            "from-pink-400 to-pink-600",
            "from-yellow-400 to-yellow-600",
            "from-indigo-400 to-indigo-600",
          ]
          return (
            <motion.div
              key={i}
              className="absolute left-1/2 top-1/2 origin-left"
              style={{
                transform: `rotate(${angle}deg)`,
                width: "120px",
                height: "24px",
                marginTop: "-12px",
              }}
              animate={{
                rotate: [angle, angle + 5, angle - 5, angle],
              }}
              transition={{
                duration: 2 + i * 0.2,
                repeat: Number.POSITIVE_INFINITY,
                ease: "easeInOut",
              }}
            >
              <div
                className={`h-full w-full rounded-full bg-gradient-to-r ${colors[i]} dark:opacity-90`}
                style={{
                  boxShadow: `
                    inset 0 -4px 8px rgba(0,0,0,0.3),
                    inset 0 4px 8px rgba(255,255,255,0.2),
                    0 4px 12px rgba(0,0,0,0.2)
                  `,
                  clipPath: "polygon(0 0, 100% 20%, 100% 80%, 0 100%)",
                }}
              >
                <div className="absolute bottom-1 left-1/4 h-3 w-3 rounded-full bg-white/30" />
                <div className="absolute bottom-1 left-1/2 h-3 w-3 rounded-full bg-white/30" />
                <div className="absolute bottom-1 left-3/4 h-3 w-3 rounded-full bg-white/30" />
              </div>
            </motion.div>
          )
        })}
      </motion.div>
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute h-4 w-4 rounded-full bg-blue-300/30 dark:bg-blue-400/20"
          style={{
            left: `${20 + i * 15}%`,
            top: `${30 + (i % 3) * 20}%`,
          }}
          animate={{
            y: [0, -100],
            opacity: [0.5, 0],
            scale: [1, 1.5],
          }}
          transition={{
            duration: 3 + i * 0.5,
            repeat: Number.POSITIVE_INFINITY,
            delay: i * 0.5,
          }}
        />
      ))}
    </div>
  )
}

function GeometricOcto() {
  return (
    <div className="relative flex h-80 w-80 items-center justify-center">
      <motion.div
        className="relative z-10"
        animate={{
          rotateY: [0, 5, 0, -5, 0],
        }}
        transition={{
          duration: 4,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
        }}
        style={{ transformStyle: "preserve-3d" }}
      >
        <div className="relative h-40 w-40">
          <div
            className="absolute inset-0 bg-gradient-to-br from-purple-400 via-purple-500 to-purple-700 dark:from-purple-600 dark:via-purple-700 dark:to-purple-900"
            style={{
              clipPath:
                "polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%)",
              boxShadow: `
                inset -10px -10px 20px rgba(0,0,0,0.3),
                inset 10px 10px 20px rgba(255,255,255,0.2),
                0 15px 30px rgba(0,0,0,0.4)
              `,
            }}
          />
          <div
            className="absolute inset-0 bg-gradient-to-tl from-purple-300/40 to-transparent"
            style={{
              clipPath:
                "polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%)",
            }}
          />
          <div
            className="absolute left-8 top-12 h-10 w-10 rotate-45 transform bg-white dark:bg-gray-100"
            style={{ boxShadow: "0 4px 8px rgba(0,0,0,0.3)" }}
          >
            <motion.div
              className="absolute left-2 top-2 h-6 w-6 rotate-0 transform bg-gray-900"
              animate={{ scale: [1, 0.9, 1] }}
              transition={{ duration: 3, repeat: Number.POSITIVE_INFINITY }}
            >
              <div className="absolute left-1 top-1 h-2 w-2 bg-white" />
            </motion.div>
          </div>
          <div
            className="absolute right-8 top-12 h-10 w-10 rotate-45 transform bg-white dark:bg-gray-100"
            style={{ boxShadow: "0 4px 8px rgba(0,0,0,0.3)" }}
          >
            <motion.div
              className="absolute left-2 top-2 h-6 w-6 rotate-0 transform bg-gray-900"
              animate={{ scale: [1, 0.9, 1] }}
              transition={{
                duration: 3,
                repeat: Number.POSITIVE_INFINITY,
                delay: 0.2,
              }}
            >
              <div className="absolute left-1 top-1 h-2 w-2 bg-white" />
            </motion.div>
          </div>
          <div className="absolute bottom-8 left-1/2 h-1 w-12 -translate-x-1/2 bg-gray-800 dark:bg-gray-900" />
          <div className="absolute bottom-8 left-1/2 h-1 w-8 origin-left -translate-x-1/2 rotate-45 transform bg-gray-800 dark:bg-gray-900" />
          <div className="absolute bottom-8 left-1/2 h-1 w-8 origin-right -translate-x-1/2 -rotate-45 transform bg-gray-800 dark:bg-gray-900" />
        </div>
        {[...Array(8)].map((_, i) => {
          const angle = i * 45 - 90
          const colors = [
            "from-cyan-400 to-cyan-600",
            "from-emerald-400 to-emerald-600",
            "from-violet-400 to-violet-600",
            "from-amber-400 to-amber-600",
            "from-sky-400 to-sky-600",
            "from-rose-400 to-rose-600",
            "from-lime-400 to-lime-600",
            "from-fuchsia-400 to-fuchsia-600",
          ]
          return (
            <motion.div
              key={i}
              className="absolute left-1/2 top-1/2 origin-left"
              style={{
                transform: `rotate(${angle}deg)`,
                width: "100px",
                height: "20px",
                marginTop: "-10px",
              }}
              animate={{
                rotate: [angle, angle + 8, angle - 8, angle],
                scaleX: [1, 1.1, 0.9, 1],
              }}
              transition={{
                duration: 2.5 + i * 0.15,
                repeat: Number.POSITIVE_INFINITY,
                ease: "easeInOut",
              }}
            >
              <div
                className={`relative h-full w-full bg-gradient-to-r ${colors[i]} dark:opacity-90`}
                style={{
                  clipPath:
                    "polygon(0 30%, 25% 0, 75% 0, 100% 30%, 100% 70%, 75% 100%, 25% 100%, 0 70%)",
                  boxShadow: `
                    inset 0 -3px 6px rgba(0,0,0,0.4),
                    inset 0 3px 6px rgba(255,255,255,0.3),
                    0 3px 10px rgba(0,0,0,0.3)
                  `,
                }}
              >
                <div className="absolute bottom-0 left-1/4 top-0 w-px bg-black/20" />
                <div className="absolute bottom-0 left-1/2 top-0 w-px bg-black/20" />
                <div className="absolute bottom-0 left-3/4 top-0 w-px bg-black/20" />
              </div>
            </motion.div>
          )
        })}
      </motion.div>
      {[...Array(8)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute h-3 w-3 rotate-45 transform bg-purple-400/40 dark:bg-purple-500/30"
          style={{
            left: `${15 + i * 12}%`,
            top: `${25 + (i % 4) * 15}%`,
          }}
          animate={{
            y: [0, -80],
            rotate: [45, 225],
            opacity: [0.6, 0],
          }}
          transition={{
            duration: 3 + i * 0.3,
            repeat: Number.POSITIVE_INFINITY,
            delay: i * 0.4,
          }}
        />
      ))}
    </div>
  )
}

function CosmicOctopus() {
  return (
    <div className="relative flex h-80 w-80 items-center justify-center">
      <div className="bg-gradient-radial absolute inset-0 from-purple-500/20 via-transparent to-transparent blur-3xl" />
      <motion.div
        className="relative z-10"
        animate={{
          y: [0, -15, 0],
          scale: [1, 1.05, 1],
        }}
        transition={{
          duration: 4,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
        }}
      >
        <div className="relative h-44 w-44">
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-indigo-400/60 via-purple-500/60 to-pink-500/60 blur-xl" />
          <div
            className="absolute inset-2 rounded-full bg-gradient-to-br from-indigo-300 via-purple-400 to-pink-400 dark:from-indigo-500 dark:via-purple-600 dark:to-pink-600"
            style={{
              boxShadow: `
                inset -15px -15px 30px rgba(0,0,0,0.2),
                inset 15px 15px 30px rgba(255,255,255,0.4),
                0 0 40px rgba(147, 51, 234, 0.4),
                0 20px 40px rgba(0,0,0,0.3)
              `,
            }}
          />
          <div className="absolute left-6 top-6 h-20 w-20 rounded-full bg-white/30 blur-2xl" />
          <div
            className="absolute left-10 top-14 h-14 w-14 rounded-full bg-white/90 dark:bg-white/80"
            style={{
              boxShadow:
                "0 0 20px rgba(255,255,255,0.6), 0 4px 8px rgba(0,0,0,0.2)",
            }}
          >
            <motion.div
              className="absolute left-2 top-2 h-10 w-10 rounded-full bg-gradient-to-br from-purple-600 to-pink-600"
              animate={{
                scale: [1, 1.1, 1],
                boxShadow: [
                  "0 0 10px rgba(147, 51, 234, 0.5)",
                  "0 0 20px rgba(147, 51, 234, 0.8)",
                  "0 0 10px rgba(147, 51, 234, 0.5)",
                ],
              }}
              transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
            >
              <div className="absolute left-2 top-2 h-4 w-4 rounded-full bg-white" />
              <div className="absolute left-1 top-1 h-2 w-2 rounded-full bg-white/60" />
            </motion.div>
          </div>
          <div
            className="absolute right-10 top-14 h-14 w-14 rounded-full bg-white/90 dark:bg-white/80"
            style={{
              boxShadow:
                "0 0 20px rgba(255,255,255,0.6), 0 4px 8px rgba(0,0,0,0.2)",
            }}
          >
            <motion.div
              className="absolute left-2 top-2 h-10 w-10 rounded-full bg-gradient-to-br from-purple-600 to-pink-600"
              animate={{
                scale: [1, 1.1, 1],
                boxShadow: [
                  "0 0 10px rgba(147, 51, 234, 0.5)",
                  "0 0 20px rgba(147, 51, 234, 0.8)",
                  "0 0 10px rgba(147, 51, 234, 0.5)",
                ],
              }}
              transition={{
                duration: 2,
                repeat: Number.POSITIVE_INFINITY,
                delay: 0.3,
              }}
            >
              <div className="absolute left-2 top-2 h-4 w-4 rounded-full bg-white" />
              <div className="absolute left-1 top-1 h-2 w-2 rounded-full bg-white/60" />
            </motion.div>
          </div>
          <div
            className="absolute bottom-10 left-1/2 h-10 w-20 -translate-x-1/2 rounded-b-full border-b-4 border-white/60 dark:border-white/50"
            style={{ boxShadow: "0 4px 12px rgba(255,255,255,0.3)" }}
          />
        </div>
        {[...Array(8)].map((_, i) => {
          const angle = i * 45 - 90
          const colors = [
            {
              from: "from-blue-400",
              to: "to-cyan-500",
              glow: "rgba(59, 130, 246, 0.5)",
            },
            {
              from: "from-green-400",
              to: "to-emerald-500",
              glow: "rgba(34, 197, 94, 0.5)",
            },
            {
              from: "from-purple-400",
              to: "to-violet-500",
              glow: "rgba(168, 85, 247, 0.5)",
            },
            {
              from: "from-orange-400",
              to: "to-amber-500",
              glow: "rgba(251, 146, 60, 0.5)",
            },
            {
              from: "from-teal-400",
              to: "to-cyan-500",
              glow: "rgba(20, 184, 166, 0.5)",
            },
            {
              from: "from-pink-400",
              to: "to-rose-500",
              glow: "rgba(244, 114, 182, 0.5)",
            },
            {
              from: "from-yellow-400",
              to: "to-orange-500",
              glow: "rgba(250, 204, 21, 0.5)",
            },
            {
              from: "from-indigo-400",
              to: "to-purple-500",
              glow: "rgba(129, 140, 248, 0.5)",
            },
          ]
          return (
            <motion.div
              key={i}
              className="absolute left-1/2 top-1/2 origin-left"
              style={{
                transform: `rotate(${angle}deg)`,
                width: "110px",
                height: "22px",
                marginTop: "-11px",
              }}
              animate={{
                rotate: [angle, angle + 6, angle - 6, angle],
                opacity: [0.8, 1, 0.8],
              }}
              transition={{
                duration: 2.8 + i * 0.2,
                repeat: Number.POSITIVE_INFINITY,
                ease: "easeInOut",
              }}
            >
              <div
                className={`relative h-full w-full rounded-full bg-gradient-to-r ${colors[i].from} ${colors[i].to} dark:opacity-90`}
                style={{
                  boxShadow: `
                    0 0 15px ${colors[i].glow},
                    inset 0 -3px 6px rgba(0,0,0,0.2),
                    inset 0 3px 6px rgba(255,255,255,0.4),
                    0 4px 12px rgba(0,0,0,0.2)
                  `,
                  clipPath: "polygon(0 20%, 100% 0%, 100% 100%, 0 80%)",
                }}
              >
                <motion.div
                  className="absolute top-1/2 h-2 w-2 rounded-full bg-white"
                  style={{ left: "30%", marginTop: "-4px" }}
                  animate={{
                    opacity: [0.4, 1, 0.4],
                    scale: [0.8, 1.2, 0.8],
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Number.POSITIVE_INFINITY,
                    delay: i * 0.2,
                  }}
                />
                <motion.div
                  className="absolute top-1/2 h-2 w-2 rounded-full bg-white"
                  style={{ left: "60%", marginTop: "-4px" }}
                  animate={{
                    opacity: [0.4, 1, 0.4],
                    scale: [0.8, 1.2, 0.8],
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Number.POSITIVE_INFINITY,
                    delay: i * 0.2 + 0.5,
                  }}
                />
              </div>
            </motion.div>
          )
        })}
      </motion.div>
      {[...Array(12)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute"
          style={{
            left: `${10 + i * 8}%`,
            top: `${20 + (i % 5) * 15}%`,
          }}
          animate={{
            y: [0, -60, 0],
            opacity: [0, 1, 0],
            scale: [0, 1, 0],
          }}
          transition={{
            duration: 3 + i * 0.3,
            repeat: Number.POSITIVE_INFINITY,
            delay: i * 0.3,
          }}
        >
          <div
            className="h-1 w-1 rounded-full bg-white"
            style={{ boxShadow: "0 0 8px rgba(255,255,255,0.8)" }}
          />
        </motion.div>
      ))}
    </div>
  )
}

export default function HomePage() {
  const [mascotOption, setMascotOption] = useState<1 | 2 | 3 | 4 | 5 | 6>(1)

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-blue-50 to-green-50 dark:from-background dark:via-background dark:to-background">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0">
          <div className="floating absolute left-10 top-20 h-8 w-8 rounded-full bg-orange-300 opacity-60 dark:opacity-30"></div>
          <div className="floating absolute right-20 top-40 h-6 w-6 rounded-full bg-blue-300 opacity-60 dark:opacity-30"></div>
          <div className="floating absolute left-1/4 top-60 h-4 w-4 rounded-full bg-green-300 opacity-60 dark:opacity-30"></div>
          <div className="floating absolute bottom-40 right-10 h-10 w-10 rounded-full bg-pink-300 opacity-60 dark:opacity-30"></div>
        </div>

        <div className="mx-auto max-w-6xl px-4 py-16 md:py-24">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            {/* Left side - Text content with fade in animation */}
            <motion.div
              className="space-y-8"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              <motion.h1
                className="font-heading text-5xl leading-tight text-gray-800 dark:text-foreground lg:text-7xl"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                Prove Participation.
                <br />
                <span className="text-primary">Earn Rewards.</span>
                <br />
                <span className="text-secondary">Build Trust.</span>
              </motion.h1>

              <motion.p
                className="max-w-lg font-body text-xl leading-relaxed text-gray-600 dark:text-muted-foreground"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
              >
                Gyralis is the loop-based participation platform that helps
                communities, DAOs, and contributors verify real human engagement
                — and get rewarded for showing up.
              </motion.p>

              <motion.div
                className="flex flex-col gap-4 sm:flex-row"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.6 }}
              >
                <Button variant="primary" className="px-8 py-4 text-lg">
                  Launch App
                </Button>
                <Button variant="secondary" className="px-8 py-4 text-lg">
                  See How It Works
                </Button>
              </motion.div>
            </motion.div>

            {/* Right side - Mascot selector with fade in animation */}
            <motion.div
              className="relative flex flex-col items-center gap-6"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              <div className="mb-4 flex flex-wrap justify-center gap-2">
                {[
                  { id: 1, name: "Blob Buddy", color: "bg-primary" },
                  { id: 2, name: "Cubic Companion", color: "bg-primary" },
                  { id: 3, name: "Orbital Orb", color: "bg-primary" },
                  { id: 4, name: "Loop Octopus", color: "bg-pink-500" },
                  { id: 5, name: "Geometric Octo", color: "bg-purple-500" },
                  { id: 6, name: "Cosmic Octopus", color: "bg-indigo-500" },
                ].map((mascot) => (
                  <motion.button
                    key={mascot.id}
                    onClick={() =>
                      setMascotOption(mascot.id as 1 | 2 | 3 | 4 | 5 | 6)
                    }
                    className={`rounded-full px-3 py-2 font-body text-xs transition-all sm:text-sm ${
                      mascotOption === mascot.id
                        ? `${mascot.color} scale-105 text-white shadow-lg`
                        : "bg-white text-gray-600 hover:bg-gray-100 dark:bg-card dark:text-muted-foreground dark:hover:bg-card/80"
                    }`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {mascot.name}
                  </motion.button>
                ))}
              </div>

              {/* Mascot display with smooth transitions */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={mascotOption}
                  initial={{ opacity: 0, scale: 0.8, rotateY: -90 }}
                  animate={{ opacity: 1, scale: 1, rotateY: 0 }}
                  exit={{ opacity: 0, scale: 0.8, rotateY: 90 }}
                  transition={{ duration: 0.5, ease: "easeInOut" }}
                >
                  {mascotOption === 1 && <BlobBuddy />}
                  {mascotOption === 2 && <CubicCompanion />}
                  {mascotOption === 3 && <OrbitalOrb />}
                  {mascotOption === 4 && <LoopOctopus />}
                  {mascotOption === 5 && <GeometricOcto />}
                  {mascotOption === 6 && <CosmicOctopus />}
                </motion.div>
              </AnimatePresence>

              {(mascotOption === 4 ||
                mascotOption === 5 ||
                mascotOption === 6) && (
                <motion.p
                  className="max-w-md text-center text-sm text-gray-600 dark:text-muted-foreground"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  Each tentacle represents a loop helping communities grow and
                  connect
                </motion.p>
              )}
            </motion.div>
          </div>
        </div>
      </div>

      {/* Why Gyralis Section */}
      <motion.div
        className="mx-auto max-w-6xl px-4 py-16 md:py-24"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8 }}
      >
        <motion.div
          className="mb-12 text-center"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="mb-4 font-heading text-4xl text-gray-800 dark:text-foreground md:text-5xl">
            Why Gyralis?
          </h2>
          <p className="font-body text-xl text-gray-600 dark:text-muted-foreground">
            Built for communities that value real participation
          </p>
        </motion.div>

        {/* Feature cards with stagger animation */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[
            {
              icon: FaShieldAlt,
              gradient: "from-orange-400 to-pink-400",
              title: "Turn Rituals into Proofs",
              description:
                "Convert daily or weekly check-ins into verifiable participation.",
              delay: 0,
            },
            {
              icon: FaShieldAlt,
              gradient: "from-blue-400 to-teal-400",
              title: "Stay Human-First",
              description:
                "Identity shields protect privacy while keeping bots out.",
              delay: 0.1,
            },
            {
              icon: FaUsers,
              gradient: "from-green-400 to-emerald-400",
              title: "Built for Communities",
              description:
                "DAOs and guilds can design loops that match their rhythms.",
              delay: 0.2,
            },
            {
              icon: FaNetworkWired,
              gradient: "from-purple-400 to-indigo-400",
              title: "Cross-Chain, Frictionless",
              description:
                "Claim and track activity across Ethereum, Gnosis, Optimism, and more.",
              delay: 0.3,
            },
            {
              icon: FaShieldAlt,
              gradient: "from-yellow-400 to-orange-400",
              title: "Always Transparent",
              description:
                "Live leaderboards and open metrics show who's really active.",
              delay: 0.4,
            },
          ].map((feature, index) => (
            <motion.div
              key={index}
              className="tamagotchi-card"
              initial={{ opacity: 0, y: 30, scale: 0.9 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: feature.delay }}
              whileHover={{ scale: 1.02, y: -5 }}
            >
              <motion.div
                className={`h-14 w-14 rounded-full bg-gradient-to-br ${feature.gradient} mb-4 flex items-center justify-center shadow-lg`}
                whileHover={{ rotate: 360, scale: 1.1 }}
                transition={{ duration: 0.6 }}
              >
                <feature.icon className="h-7 w-7 text-white" />
              </motion.div>
              <h3 className="mb-2 font-heading text-xl text-gray-800 dark:text-foreground">
                {feature.title}
              </h3>
              <p className="font-body text-gray-600 dark:text-muted-foreground">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* How It Works Section */}
      <motion.div
        className="mx-auto max-w-6xl px-4 py-16 md:py-24"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8 }}
      >
        <motion.div
          className="mb-12 text-center"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="mb-4 font-heading text-4xl text-gray-800 dark:text-foreground md:text-5xl">
            How It Works
          </h2>
          <p className="font-body text-xl text-gray-600 dark:text-muted-foreground">
            Get started in three simple steps
          </p>
        </motion.div>

        {/* Steps with alternating slide animations */}
        <div className="grid gap-8 md:grid-cols-3">
          {[
            {
              icon: FaShieldAlt,
              gradient: "from-blue-400 to-teal-400",
              number: 1,
              title: "Verify You're Human",
              description:
                "Connect once with a trusted proof-of-personhood tool.",
              direction: -50,
            },
            {
              icon: FaUsers,
              gradient: "from-green-400 to-emerald-400",
              number: 2,
              title: "Join a Loop",
              description: "Pick a community loop that matches your role.",
              direction: 0,
            },
            {
              icon: FaTrophy,
              gradient: "from-orange-400 to-pink-400",
              number: 3,
              title: "Claim & Build Reputation",
              description:
                "Earn rewards, prove your presence, and grow your track record.",
              direction: 50,
            },
          ].map((step, index) => (
            <motion.div
              key={index}
              className="space-y-4 text-center"
              initial={{ opacity: 0, x: step.direction }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
            >
              <motion.div
                className="relative inline-block"
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ duration: 0.3 }}
              >
                <div
                  className={`h-24 w-24 rounded-full bg-gradient-to-br ${step.gradient} mx-auto flex items-center justify-center shadow-2xl`}
                >
                  <step.icon className="h-12 w-12 text-white" />
                </div>
                <motion.div
                  className="absolute -right-2 -top-2 flex h-8 w-8 items-center justify-center rounded-full bg-primary font-bold text-white shadow-lg"
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  viewport={{ once: true }}
                  transition={{
                    duration: 0.4,
                    delay: index * 0.2 + 0.3,
                    type: "spring",
                  }}
                >
                  {step.number}
                </motion.div>
              </motion.div>
              <h3 className="font-heading text-2xl text-gray-800 dark:text-foreground">
                {step.title}
              </h3>
              <p className="font-body text-gray-600 dark:text-muted-foreground">
                {step.description}
              </p>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Social Proof Section */}
      <motion.div
        className="mx-auto max-w-6xl px-4 py-16 md:py-24"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8 }}
      >
        <motion.div
          className="mb-12 text-center"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="mb-4 font-heading text-4xl text-gray-800 dark:text-foreground md:text-5xl">
            Today on Gyralis
          </h2>
        </motion.div>

        {/* Stats with stagger and scale animation */}
        <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
          {[
            {
              value: "10,000+",
              label: "Verified Participants",
              gradient: "from-orange-100 to-pink-100",
              darkGradient: "dark:from-orange-900/20 dark:to-pink-900/20",
              color: "text-primary",
              delay: 0,
            },
            {
              value: "50+",
              label: "Live Loops",
              gradient: "from-blue-100 to-teal-100",
              darkGradient: "dark:from-blue-900/20 dark:to-teal-900/20",
              color: "text-secondary",
              delay: 0.1,
            },
            {
              value: "5",
              label: "Supported Chains",
              gradient: "from-green-100 to-emerald-100",
              darkGradient: "dark:from-green-900/20 dark:to-emerald-900/20",
              color: "text-green-600 dark:text-green-400",
              delay: 0.2,
            },
            {
              value: "99.9%",
              label: "Uptime",
              gradient: "from-purple-100 to-indigo-100",
              darkGradient: "dark:from-purple-900/20 dark:to-indigo-900/20",
              color: "text-purple-600 dark:text-purple-400",
              delay: 0.3,
            },
          ].map((stat, index) => (
            <motion.div
              key={index}
              className={`rounded-2xl bg-gradient-to-br p-6 text-center ${stat.gradient} ${stat.darkGradient} shadow-lg transition-shadow hover:shadow-xl`}
              initial={{ opacity: 0, scale: 0.8, y: 30 }}
              whileInView={{ opacity: 1, scale: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: stat.delay }}
              whileHover={{ scale: 1.05, y: -5 }}
            >
              <motion.div
                className={`font-heading text-4xl md:text-5xl ${stat.color} mb-2`}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: stat.delay + 0.2 }}
              >
                {stat.value}
              </motion.div>
              <div className="font-body text-gray-600 dark:text-muted-foreground">
                {stat.label}
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* CTA Section */}
      <motion.div
        className="mx-auto max-w-4xl px-4 py-16 md:py-24"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8 }}
      >
        <motion.div
          className="space-y-8 rounded-3xl bg-gradient-to-br from-primary/10 to-secondary/10 p-12 text-center shadow-xl dark:from-primary/5 dark:to-secondary/5"
          initial={{ opacity: 0, scale: 0.9, y: 30 }}
          whileInView={{ opacity: 1, scale: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          whileHover={{ scale: 1.02 }}
        >
          <motion.h2
            className="font-heading text-4xl text-gray-800 dark:text-foreground md:text-5xl"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Ready to Join the Loop?
          </motion.h2>
          <motion.p
            className="mx-auto max-w-2xl font-body text-xl text-gray-600 dark:text-muted-foreground"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            Whether you're a steward, facilitator, partner, or contributor —
            Gyralis helps you prove participation and grow reputation.
          </motion.p>
          <motion.div
            className="flex flex-col justify-center gap-4 sm:flex-row"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <Button variant="primary" className="px-10 py-5 text-lg">
              Launch App
            </Button>
            <Button variant="secondary" className="px-10 py-5 text-lg">
              Read the Docs
            </Button>
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  )
}
