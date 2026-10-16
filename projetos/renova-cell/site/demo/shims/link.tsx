import type { AnchorHTMLAttributes, MouseEvent } from 'react';
import { navigate } from './navigation';

type Props = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> & { href: string | { pathname?: string } };

/** Demo stand-in for `next/link`. */
export default function Link({ href, onClick, ...rest }: Props) {
  const url = typeof href === 'string' ? href : (href.pathname ?? '/');
  return (
    <a
      {...rest}
      href={`#${url.replace(/^\//, '')}`}
      onClick={(e: MouseEvent<HTMLAnchorElement>) => {
        onClick?.(e);
        if (!e.defaultPrevented && url.startsWith('/')) {
          e.preventDefault();
          navigate(url);
        }
      }}
    />
  );
}
