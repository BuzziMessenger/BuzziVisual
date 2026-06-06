import React from "react";

interface BuzziLogoProps {
  className?: string;
  size?: number;
  textColor?: string;
}

export function BuzziLogo({ className = "", size = 160, textColor }: BuzziLogoProps) {
  return (
    <div className={`flex flex-col items-center select-none ${className}`} style={{ width: size }}>
      <svg
        viewBox="0 0 200 240"
        width="100%"
        height="100%"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="drop-shadow-lg"
      >
        <defs>
          {/* Shield Border Gradient */}
          <linearGradient id="shieldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ADF842" />
            <stop offset="50%" stopColor="#34D399" />
            <stop offset="100%" stopColor="#38BDF8" />
          </linearGradient>

          {/* Bee Bubble Radial Gradient */}
          <radialGradient id="bubbleGradient" cx="35%" cy="30%" r="70%">
            <stop offset="0%" stopColor="#BEF264" />
            <stop offset="45%" stopColor="#4ADE80" />
            <stop offset="100%" stopColor="#059669" />
          </radialGradient>

          {/* Wings Linear Gradient */}
          <linearGradient id="wingGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="100%" stopColor="#BAE6FD" />
          </linearGradient>

          {/* Professional High-contrast Drop Shadow for readability on ANY background */}
          <filter id="buzziTextShadow" x="-10%" y="-10%" width="120%" height="120%">
            <feDropShadow dx="1.5" dy="2.5" stdDeviation="1.5" floodColor="#040D1A" floodOpacity="0.6" />
          </filter>
          
          <filter id="shieldShadow" x="-10%" y="-10%" width="120%" height="120%">
            <feDropShadow dx="0" dy="3" stdDeviation="2" floodColor="#000000" floodOpacity="0.3" />
          </filter>
        </defs>

        {/* 1. Wings (Stuck to the left side and layered behind the shield outline) */}
        <g stroke="#064E3B" strokeWidth="3" strokeLinejoin="round" filter="url(#shieldShadow)">
          {/* Upper Wing */}
          <path
            d="M 48 76 C 20 74, 12 90, 31 95 C 41 97, 45 88, 48 76 Z"
            fill="url(#wingGradient)"
          />
          {/* Lower Wing */}
          <path
            d="M 44 91 C 26 95, 23 105, 38 103 C 44 103, 46 96, 44 91 Z"
            fill="url(#wingGradient)"
          />
        </g>

        {/* 2. Outer Shield Outline */}
        <path
          d="M 100 152 C 145 132, 160 85, 160 45 C 130 35, 115 30, 100 42 C 85 30, 70 35, 40 45 C 40 85, 55 132, 100 152 Z"
          stroke="url(#shieldGradient)"
          strokeWidth="8"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
          filter="url(#shieldShadow)"
        />

        {/* 3. Star sparkle in upper right quadrant */}
        <path
          d="M 132 58 Q 136 58 136 54 Q 136 58 140 58 Q 136 58 136 62 Q 136 58 132 58 Z"
          fill="#FDE047"
          stroke="#064E3B"
          strokeWidth="1"
        />

        {/* 4. Smiling Bee Bubble body */}
        <g filter="url(#shieldShadow)">
          {/* Speech bubble base circle + lower-left tail */}
          <path
            d="M 100 54 A 34 34 0 1 1 76 112 L 68 128 L 86 122 A 34 34 0 0 1 100 54 Z"
            fill="url(#bubbleGradient)"
            stroke="#064E3B"
            strokeWidth="3.5"
            strokeLinejoin="round"
          />

          {/* Smiling Eyes ^ ^ */}
          <path
            d="M 84 84 Q 90 77 96 84"
            stroke="#064E3B"
            strokeWidth="3.5"
            strokeLinecap="round"
            fill="none"
          />
          <path
            d="M 104 84 Q 110 77 116 84"
            stroke="#064E3B"
            strokeWidth="3.5"
            strokeLinecap="round"
            fill="none"
          />

          {/* Blush Cheeks */}
          <ellipse cx="80" cy="92" rx="4.5" ry="3" fill="#F87171" opacity="0.8" />
          <ellipse cx="120" cy="92" rx="4.5" ry="3" fill="#F87171" opacity="0.8" />

          {/* Laughing Mouth with Tongue */}
          <path
            d="M 90 94 C 90 106, 110 106, 110 94 Z"
            fill="#064E3B"
          />
          <path
            d="M 94 98 C 96 102, 104 102, 106 98 C 103 103, 97 103, 94 98 Z"
            fill="#FCA5A5"
          />
        </g>

        {/* 5. Typography "BUZZI" */}
        <text
          x="100"
          y="194"
          fill="#8DE43B"
          fontWeight="900"
          fontSize="29px"
          letterSpacing="0.08em"
          textAnchor="middle"
          filter="url(#buzziTextShadow)"
          style={{ fontFamily: '"Tahoma", "Segoe UI", sans-serif' }}
        >
          BUZZI
        </text>

        {/* 6. Typography "MESSENGER" */}
        <text
          x="97"
          y="215"
          fill={textColor || "#FFFFFF"}
          fontWeight="800"
          fontSize="14px"
          letterSpacing="0.16em"
          textAnchor="middle"
          filter="url(#buzziTextShadow)"
          style={{ fontFamily: '"Tahoma", "Segoe UI", sans-serif' }}
        >
          MESSENGER
        </text>

        {/* 7. Sparkle on the word MESSENGER */}
        <path
          d="M 163 213 Q 167 213 167 209 Q 167 213 171 213 Q 167 213 167 217 Q 167 213 163 213 Z"
          fill="#D1D5DB"
          filter="url(#buzziTextShadow)"
        />
      </svg>
    </div>
  );
}
