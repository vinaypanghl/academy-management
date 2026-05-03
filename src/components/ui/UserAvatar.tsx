import React, { useState } from 'react';
import './UserAvatar.scss';

interface UserAvatarProps {
    name?: string | null;
    src?: string | null;
    size?: 'sm' | 'md' | 'lg' | 'xl';
    className?: string;
    alt?: string;
}

export const getInitials = (name?: string | null) => {
    const words = String(name || 'User').trim().split(/\s+/).filter(Boolean);
    if (!words.length) return 'U';
    if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
    return `${words[0][0]}${words[words.length - 1][0]}`.toUpperCase();
};

const UserAvatar: React.FC<UserAvatarProps> = ({
    name,
    src,
    size = 'md',
    className = '',
    alt,
}) => {
    const [imageFailed, setImageFailed] = useState(false);
    const shouldShowImage = Boolean(src && !imageFailed);

    return (
        <span className={`user-avatar user-avatar--${size} ${className}`} aria-label={alt || name || 'User'}>
            {shouldShowImage ? (
                <img src={src || ''} alt={alt || name || 'User'} onError={() => setImageFailed(true)} />
            ) : (
                <span>{getInitials(name)}</span>
            )}
        </span>
    );
};

export default UserAvatar;
