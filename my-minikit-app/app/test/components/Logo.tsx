import Image from 'next/image';
import nookLogo from '../assets/nook-logo.png';

interface LogoProps {
  size?: number;
  marginBottom?: string;
}

export function Logo({ size = 60, marginBottom = 'clamp(1rem, 4vw, 3rem)' }: LogoProps) {
  return (
    <Image 
      src={nookLogo} 
      alt="Nook Logo"
      width={size}
      height={size}
      style={{ marginBottom }}
    />
  );
}