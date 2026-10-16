import type { ImgHTMLAttributes } from 'react';

/** Demo stand-in for `next/image` (plain img; `fill` covers the parent). */
export default function Image({ fill, sizes: _sizes, ...rest }: ImgHTMLAttributes<HTMLImageElement> & { fill?: boolean }) {
  return <img {...rest} alt={rest.alt ?? ''} style={fill ? { position: 'absolute', inset: 0, width: '100%', height: '100%', ...rest.style } : rest.style} />;
}
