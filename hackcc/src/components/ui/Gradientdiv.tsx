"use client";

import React, { ReactNode, useEffect, useState } from "react";

// Mouse position hook
const useMousePosition = () => {
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

    useEffect(() => {
        const updateMousePosition = (event: MouseEvent) => {
            setMousePosition({ x: event.clientX, y: event.clientY });
        };

        window.addEventListener("mousemove", updateMousePosition);
        return () => window.removeEventListener("mousemove", updateMousePosition);
    }, []);

    return mousePosition;
};

interface GradientdivProps {
    children: ReactNode;
    className?: string;
}

const Gradientdiv: React.FC<GradientdivProps> = ({ children, className }) => {
    const { x, y } = useMousePosition();

    return (
        <div
            style={{
                backgroundImage: `radial-gradient(circle at ${x}px ${y}px, red, blue 50%)`,
            }}
            className={className}
        >
            {children}
        </div>
    );
};

export default Gradientdiv;
