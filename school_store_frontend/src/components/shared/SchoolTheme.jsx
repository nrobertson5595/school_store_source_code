import React from 'react';

// School Mascot Placeholder Component
export const SchoolMascot = ({ size = 'md', animated = false, className = '' }) => {
    const sizeClasses = {
        sm: 'w-12 h-12',
        md: 'w-16 h-16',
        lg: 'w-24 h-24',
        xl: 'w-32 h-32'
    };

    return (
        <div className={`${sizeClasses[size]} ${animated ? 'bounce-animation' : ''} ${className}`}>
            <div className="w-full h-full bg-school-spirit rounded-full flex items-center justify-center text-white font-bold text-xl">
                🦅
            </div>
        </div>
    );
};

// Educational Icon Components
export const BookIcon = ({ className = '', animated = false }) => (
    <div className={`inline-flex items-center justify-center ${animated ? 'bounce-animation' : ''} ${className}`}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className="text-chalkboard">
            <path d="M21 5c-1.11-.35-2.33-.5-3.5-.5-1.95 0-4.05.4-5.5 1.5-1.45-1.1-3.55-1.5-5.5-1.5S2.45 4.9 1 6v14.65c0 .25.25.5.5.5.1 0 .15-.05.25-.05C3.1 20.45 5.05 20 6.5 20c1.95 0 4.05.4 5.5 1.5 1.35-.85 3.8-1.5 5.5-1.5 1.65 0 3.35.3 4.75 1.05.1.05.15.05.25.05.25 0 .5-.25.5-.5V6c-.6-.45-1.25-.75-2-1zm0 13.5c-1.1-.35-2.3-.5-3.5-.5-1.7 0-4.15.65-5.5 1.5V8c1.35-.85 3.8-1.5 5.5-1.5 1.2 0 2.4.15 3.5.5v11.5z" />
        </svg>
    </div>
);

export const AppleIcon = ({ className = '', animated = false }) => (
    <div className={`inline-flex items-center justify-center ${animated ? 'wiggle-animation' : ''} ${className}`}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className="text-apple">
            <path d="M12.75 2.25c-2.25 0-4.5 1.8-4.5 4.5 0 .75.15 1.5.45 2.25-1.8.3-3.15 1.8-3.15 3.75 0 2.25 1.8 4.5 4.5 4.5h6c2.25 0 4.5-1.8 4.5-4.5 0-1.95-1.35-3.45-3.15-3.75.3-.75.45-1.5.45-2.25 0-2.7-2.25-4.5-4.5-4.5h-1.5z" />
            <path d="M15 3c.15-.9.75-1.5 1.5-1.5s1.35.6 1.5 1.5c0 .15-.15.3-.3.3s-.3-.15-.3-.3c-.15-.6-.45-.9-.9-.9s-.75.3-.9.9c0 .15-.15.3-.3.3s-.3-.15-.3-.3z" />
        </svg>
    </div>
);

export const StarIcon = ({ className = '', animated = false, filled = true }) => (
    <div className={`inline-flex items-center justify-center ${animated ? 'sparkle-animation' : ''} ${className}`}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" className="text-gold">
            <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26 12,2" />
        </svg>
    </div>
);

export const PencilIcon = ({ className = '', animated = false }) => (
    <div className={`inline-flex items-center justify-center ${animated ? 'wiggle-animation' : ''} ${className}`}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className="text-pencil">
            <path d="M3 17.25V21h3.75l11-11-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />
        </svg>
    </div>
);

export const GraduationCapIcon = ({ className = '', animated = false }) => (
    <div className={`inline-flex items-center justify-center ${animated ? 'bounce-animation' : ''} ${className}`}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className="text-school">
            <path d="M5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82zM12 3L1 9l11 6 9-4.91V17h2V9L12 3z" />
        </svg>
    </div>
);

export const TrophyIcon = ({ className = '', animated = false }) => (
    <div className={`inline-flex items-center justify-center ${animated ? 'sparkle-animation' : ''} ${className}`}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className="text-gold">
            <path d="M7 4V2c0-1.1.9-2 2-2h6c1.1 0 2 .9 2 2v2h-2V3H9v1H7zm10 4c0 2.21-1.79 4-4 4s-4-1.79-4-4V6h8v2zm2-4h-2v4c0 2.93-2.07 5-5 5s-5-2.07-5-5V4H5c-1.1 0-2 .9-2 2v4c0 2.21 1.79 4 4 4h.17c1.9 2.65 4.98 3.82 7.83 3.82s5.93-1.17 7.83-3.82H19c2.21 0 4-1.79 4-4V6c0-1.1-.9-2-2-2z" />
        </svg>
    </div>
);

// School Banner Component
export const SchoolBanner = ({
    title = "School Store",
    subtitle = "Learning Rewards",
    mascot = true,
    className = ''
}) => {
    return (
        <div className={`bg-school-primary text-white rounded-lg p-6 mb-6 relative overflow-hidden ${className}`}>
            <div className="absolute top-0 right-0 w-32 h-32 opacity-10 transform rotate-12 translate-x-8 -translate-y-8">
                <GraduationCapIcon />
            </div>

            <div className="flex items-center justify-between relative z-10">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2 font-display">{title}</h1>
                    <p className="text-blue-100 text-lg">{subtitle}</p>
                </div>

                {mascot && (
                    <SchoolMascot size="lg" animated={true} />
                )}
            </div>

            <div className="absolute bottom-0 left-0 w-full h-2 bg-school-warning"></div>
        </div>
    );
};

// Achievement Badge Component
export const AchievementBadge = ({
    title,
    description,
    icon = "star",
    level = "bronze",
    earned = false,
    className = ''
}) => {
    const levelStyles = {
        bronze: "bg-gradient-to-r from-amber-600 to-amber-500",
        silver: "bg-gradient-to-r from-gray-400 to-gray-300",
        gold: "bg-gradient-to-r from-yellow-500 to-yellow-400",
        platinum: "bg-gradient-to-r from-purple-500 to-purple-400"
    };

    const icons = {
        star: <StarIcon animated={earned} />,
        trophy: <TrophyIcon animated={earned} />,
        book: <BookIcon animated={earned} />,
        apple: <AppleIcon animated={earned} />,
        cap: <GraduationCapIcon animated={earned} />
    };

    return (
        <div className={`
      card-achievement p-4 text-center relative
      ${earned ? levelStyles[level] : 'bg-gray-200 opacity-50'}
      ${className}
    `}>
            <div className="text-4xl mb-2">
                {icons[icon]}
            </div>

            <h3 className="font-bold text-lg mb-1 font-display">{title}</h3>
            <p className="text-sm opacity-90">{description}</p>

            {earned && (
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
                        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                    </svg>
                </div>
            )}
        </div>
    );
};

// School Card Wrapper Component
export const SchoolCard = ({
    children,
    variant = "default",
    subject = null,
    animated = false,
    className = ''
}) => {
    const variants = {
        default: "bg-card rounded-lg p-6 shadow-sm border border-border",
        academic: "card-academic",
        achievement: "card-achievement",
    };

    const subjectThemes = {
        math: "math-theme",
        science: "science-theme",
        reading: "reading-theme"
    };

    return (
        <div className={`
      ${variants[variant]}
      ${subject ? subjectThemes[subject] : ''}
      ${animated ? 'school-hover' : ''}
      transition-all duration-300
      ${className}
    `}>
            {children}
        </div>
    );
};

// Subject Icon Component
export const SubjectIcon = ({ subject, size = "md", animated = false, className = '' }) => {
    const sizeClasses = {
        sm: 'w-6 h-6',
        md: 'w-8 h-8',
        lg: 'w-12 h-12'
    };

    const subjectIcons = {
        math: (
            <div className={`${sizeClasses[size]} ${animated ? 'bounce-animation' : ''} ${className} text-school`}>
                <svg fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z" />
                </svg>
            </div>
        ),
        science: (
            <div className={`${sizeClasses[size]} ${animated ? 'wiggle-animation' : ''} ${className} text-chalkboard`}>
                <svg fill="currentColor" viewBox="0 0 24 24">
                    <path d="M9 2v7.38l5.38-5.38h2.82L12 9.2V2H9zM12 19.8L16.2 15.6 12 11.4 7.8 15.6 12 19.8z" />
                </svg>
            </div>
        ),
        reading: <BookIcon className={`${sizeClasses[size]} ${className}`} animated={animated} />
    };

    return subjectIcons[subject] || <BookIcon className={`${sizeClasses[size]} ${className}`} animated={animated} />;
};

// Grade Level Badge Component
export const GradeLevelBadge = ({ grade, className = '' }) => {
    const gradeColors = {
        'K': 'bg-purple-500',
        '1': 'bg-blue-500',
        '2': 'bg-green-500',
        '3': 'bg-yellow-500',
        '4': 'bg-red-500',
        '5': 'bg-indigo-500'
    };

    return (
        <span className={`
      inline-flex items-center px-3 py-1 rounded-full text-sm font-medium text-white
      ${gradeColors[grade] || 'bg-gray-500'}
      ${className}
    `}>
            Grade {grade}
        </span>
    );
};

// Points Display Component
export const PointsDisplay = ({ points, animated = false, size = "md", className = '' }) => {
    const sizeClasses = {
        sm: 'text-lg',
        md: 'text-xl',
        lg: 'text-2xl',
        xl: 'text-3xl'
    };

    return (
        <div className={`
      inline-flex items-center gap-2 font-bold text-gold
      ${sizeClasses[size]}
      ${animated ? 'sparkle-animation' : ''}
      ${className}
    `}>
            <StarIcon animated={animated} filled={true} />
            <span>{points.toLocaleString()}</span>
            <span className="text-sm opacity-75">points</span>
        </div>
    );
};

// Progress Bar Component
export const SchoolProgressBar = ({
    progress,
    total,
    label,
    color = "primary",
    showPercentage = true,
    className = ''
}) => {
    const percentage = Math.round((progress / total) * 100);

    const colorClasses = {
        primary: 'bg-blue-500',
        success: 'bg-green-500',
        warning: 'bg-yellow-500',
        spirit: 'bg-red-500'
    };

    return (
        <div className={`w-full ${className}`}>
            {label && (
                <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700">{label}</span>
                    {showPercentage && (
                        <span className="text-sm text-gray-500">{percentage}%</span>
                    )}
                </div>
            )}

            <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                    className={`h-3 rounded-full transition-all duration-500 ${colorClasses[color]}`}
                    style={{ width: `${percentage}%` }}
                ></div>
            </div>
        </div>
    );
};

export default {
    SchoolMascot,
    BookIcon,
    AppleIcon,
    StarIcon,
    PencilIcon,
    GraduationCapIcon,
    TrophyIcon,
    SchoolBanner,
    AchievementBadge,
    SchoolCard,
    SubjectIcon,
    GradeLevelBadge,
    PointsDisplay,
    SchoolProgressBar
};