import Link from "next/link";

interface LogoProps {
  href?: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  variant?: "full" | "compact";
  className?: string;
}

/* Tailles : largeur SVG × hauteur */
const SIZES = {
  xs: { w: 80,  h: 36  },
  sm: { w: 100, h: 44  },
  md: { w: 130, h: 58  },
  lg: { w: 180, h: 80  },
  xl: { w: 260, h: 116 },
};

function LogoSVG({ size = "md", variant = "full" }: { size?: LogoProps["size"]; variant?: LogoProps["variant"] }) {
  const { w, h } = SIZES[size ?? "md"];

  if (variant === "compact") {
    /* Version compacte : juste "K" dans un carré */
    return (
      <svg width={h} height={h} viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="44" height="44" rx="8" fill="#0A0A0A" />
        <rect x="0.6" y="0.6" width="42.8" height="42.8" rx="7.4" stroke="url(#cg)" strokeWidth="1.2" />
        <text
          x="22" y="31"
          textAnchor="middle"
          fontFamily="'Times New Roman', Georgia, serif"
          fontWeight="700"
          fontSize="22"
          fill="url(#cg)"
          letterSpacing="1"
        >
          K
        </text>
        <defs>
          <linearGradient id="cg" x1="0" y1="0" x2="44" y2="44" gradientUnits="userSpaceOnUse">
            <stop offset="0%"   stopColor="#F0D060" />
            <stop offset="40%"  stopColor="#D4AF37" />
            <stop offset="100%" stopColor="#8A6800" />
          </linearGradient>
        </defs>
      </svg>
    );
  }

  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        {/* Gradient or principal */}
        <linearGradient id="gold" x1="0" y1="0" x2={w} y2={h} gradientUnits="userSpaceOnUse">
          <stop offset="0%"   stopColor="#F5E070" />
          <stop offset="30%"  stopColor="#D4AF37" />
          <stop offset="65%"  stopColor="#C9A227" />
          <stop offset="100%" stopColor="#8A6800" />
        </linearGradient>
        {/* Gradient sous-titre */}
        <linearGradient id="goldSub" x1="0" y1="0" x2={w} y2="0" gradientUnits="userSpaceOnUse">
          <stop offset="0%"   stopColor="#9A7B10" />
          <stop offset="50%"  stopColor="#D4AF37" />
          <stop offset="100%" stopColor="#9A7B10" />
        </linearGradient>
      </defs>

      {/* KMM serif bold */}
      <text
        x={w / 2} y={h * 0.54}
        textAnchor="middle"
        fontFamily="'Times New Roman', 'Georgia', 'Palatino', serif"
        fontWeight="700"
        fontSize={h * 0.56}
        fill="url(#gold)"
        letterSpacing={h * 0.04}
      >
        KMM
      </text>

      {/* Séparateur fin */}
      <line
        x1={w * 0.18} y1={h * 0.65}
        x2={w * 0.82} y2={h * 0.65}
        stroke="url(#goldSub)" strokeWidth="0.8" opacity="0.6"
      />

      {/* TRADE espacé, fin */}
      <text
        x={w / 2} y={h * 0.88}
        textAnchor="middle"
        fontFamily="'Times New Roman', 'Georgia', serif"
        fontWeight="400"
        fontSize={h * 0.2}
        fill="url(#goldSub)"
        letterSpacing={h * 0.085}
      >
        TRADE
      </text>
    </svg>
  );
}

export function Logo({ href = "/", size = "md", variant = "full", className = "" }: LogoProps) {
  const content = (
    <div className={`inline-flex items-center select-none ${className}`}>
      <LogoSVG size={size} variant={variant} />
    </div>
  );

  if (!href) return content;
  return <Link href={href} className="inline-flex">{content}</Link>;
}
