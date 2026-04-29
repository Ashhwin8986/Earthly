
import React from 'react';
import { validateUrl } from '@/utils/security';

interface SecureLinkProps {
  href: string;
  children: React.ReactNode;
  className?: string;
  target?: '_blank' | '_self' | '_parent' | '_top';
}

const SecureLink: React.FC<SecureLinkProps> = ({ 
  href, 
  children, 
  className = '', 
  target = '_blank' 
}) => {
  // Validate URL before rendering
  if (!validateUrl(href)) {
    console.warn('Invalid URL provided to SecureLink:', href);
    return <span className={className}>{children}</span>;
  }

  const isExternal = !href.startsWith('/') && !href.startsWith('#');
  const rel = isExternal ? 'noopener noreferrer' : undefined;

  return (
    <a 
      href={href} 
      target={target} 
      rel={rel}
      className={className}
    >
      {children}
    </a>
  );
};

export default SecureLink;
