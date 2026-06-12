'use client';

import React from 'react';

interface NeonButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit';
  disabled?: boolean;
  className?: string;
  href?: string;
}

export const NeonButton: React.FC<NeonButtonProps> = ({
  children,
  onClick,
  type = 'button',
  disabled,
  className = '',
  href,
}) => {
  const Tag = href ? 'a' : 'button';
  const cls = `btn btn-primary ${className}`;
  const props = href
    ? { href, className: cls }
    : { type, onClick, disabled, className: cls };

  return <Tag {...props}>{children}</Tag>;
};
