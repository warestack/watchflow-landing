// Star generation system
function generateRandomStars() {
    const colors = ['#FFD700', '#4ECDC4', '#FF6B6B', '#95E1D3'];
    const leftStars = 8;
    const rightStars = 8;
    const minDistance = 60; // Smaller distance for better coverage while preventing clustering
    let globalStarIndex = 0;
    
    // Generate left margin stars
    globalStarIndex = generateStarsInMargin('floating-decorations', leftStars, colors, minDistance, 'left', globalStarIndex);
    
    // Generate right margin stars
    generateStarsInMargin('floating-decorations', rightStars, colors, minDistance, 'right', globalStarIndex);
}

function generateStarsInMargin(containerId, count, colors, minDistance, side, startIndex = 0) {
    const container = document.querySelector(`.${containerId}`);
    if (!container) return startIndex;
    
    // Clear existing stars if this is the first call
    if (startIndex === 0) {
        container.innerHTML = '';
    }
    
    const positions = [];
    let currentIndex = startIndex;
    
    // Create vertical zones for better distribution
    const verticalZones = Math.ceil(count / 2); // 2 stars per zone for better distribution
    const zoneHeight = 100 / verticalZones;
    
    for (let i = 0; i < count; i++) {
        let position = null;
        let attempts = 0;
        const maxAttempts = 50;
        
        while (!position && attempts < maxAttempts) {
            const candidate = generateMarginPosition(side, i, count, zoneHeight);
            
            if (isValidPosition(candidate, positions, minDistance / 10)) { // Convert to percentage units
                position = candidate;
                positions.push(position);
            }
            attempts++;
        }
        
        if (position) {
            createStar(container, position, colors[currentIndex % colors.length], currentIndex);
            currentIndex++;
        }
    }
    
    return currentIndex;
}

function generateMarginPosition(side, starIndex, totalStars, zoneHeight) {
    let x, y;
    
    // More even vertical distribution with guided randomness
    const baseY = (starIndex / (totalStars - 1)) * 90; // Spread evenly from 0-90%
    const randomOffset = (Math.random() - 0.5) * 20; // Random variation of ±10%
    y = Math.max(5, Math.min(95, baseY + randomOffset)); // Keep within 5-95% bounds
    
    // Set x position based on side with varied depth
    if (side === 'left') {
        // Vary distance from left edge for visual interest
        const depth = Math.random();
        if (depth < 0.3) {
            x = Math.random() * 8; // Close to edge (0-8%)
        } else if (depth < 0.7) {
            x = 8 + Math.random() * 6; // Middle distance (8-14%)
        } else {
            x = 14 + Math.random() * 4; // Further in (14-18%)
        }
    } else {
        // Same for right side, mirrored
        const depth = Math.random();
        if (depth < 0.3) {
            x = 92 + Math.random() * 8; // Close to edge (92-100%)
        } else if (depth < 0.7) {
            x = 86 + Math.random() * 6; // Middle distance (86-92%)
        } else {
            x = 82 + Math.random() * 4; // Further in (82-86%)
        }
    }
    
    return { x, y };
}

function generateStarsInArea(containerId, count, colors, minDistance, bounds, startIndex = 0) {
    const container = document.querySelector(`.${containerId}`);
    if (!container) return startIndex;
    
    // Clear existing stars
    container.innerHTML = '';
    
    const positions = [];
    const maxAttempts = 100;
    let currentIndex = startIndex;
    
    for (let i = 0; i < count; i++) {
        let position = null;
        let attempts = 0;
        
        while (!position && attempts < maxAttempts) {
            const candidate = generateRandomPosition(bounds, containerId === 'header-stars');
            
            if (isValidPosition(candidate, positions, minDistance)) {
                position = candidate;
                positions.push(position);
            }
            attempts++;
        }
        
        if (position) {
            createStar(container, position, colors[i % colors.length], currentIndex);
            currentIndex++;
        }
    }
    
    return currentIndex;
}

function generateRandomPosition(bounds, isHeader) {
    let x, y;
    
    // Always keep stars in left and right margins only
    const side = Math.random() < 0.5 ? 'left' : 'right';
    
    if (side === 'left') {
        // Left margin (0-20% of viewport width)
        x = Math.random() * 20;
    } else {
        // Right margin (80-100% of viewport width)
        x = 80 + Math.random() * 20;
    }
    
    if (isHeader) {
        // For header area, stay in top portion
        y = Math.random() * 50;
    } else {
        // For main content, spread across entire height
        y = Math.random() * 100;
    }
    
    return { x, y };
}

function isValidPosition(candidate, existingPositions, minDistance) {
    for (const existing of existingPositions) {
        const distance = Math.sqrt(
            Math.pow(candidate.x - existing.x, 2) + 
            Math.pow(candidate.y - existing.y, 2)
        );
        
        if (distance < minDistance / 10) { // Convert to percentage units
            return false;
        }
    }
    return true;
}

function createStar(container, position, color, index) {
    const star = document.createElement('div');
    star.className = `decoration generated-star star-${index}`;
    star.innerHTML = `
        <svg viewBox="0 0 24 24">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" 
                  fill="${color}" stroke="#000" stroke-width="1.5"/>
        </svg>
    `;
    
    // Set position (fixed to viewport)
    star.style.position = 'fixed';
    star.style.left = position.x + 'vw';
    star.style.top = position.y + 'vh';
    star.style.width = '40px';
    star.style.height = '40px';
    star.style.opacity = '0.8';
    star.style.pointerEvents = 'none';
    star.style.zIndex = '-10';
    star.style.transition = 'transform 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
    
    // Store physics properties
    star.physics = {
        originalX: position.x,
        originalY: position.y,
        velocityX: 0,
        velocityY: 0,
        isDisplaced: false,
        returnSpeed: 0.08,
        damping: 0.95
    };
    
    // Add random animation (reduced on mobile for performance)
    const isMobile = window.innerWidth <= 768;
    const floatDuration = isMobile ? (8 + Math.random() * 4) : (5 + Math.random() * 4); // Slower on mobile
    const rotateDuration = isMobile ? (15 + Math.random() * 10) : (8 + Math.random() * 12); // Slower on mobile
    const rotateDirection = Math.random() > 0.5 ? 1 : -1; // Random direction
    
    // Create unique rotation keyframes for this star
    const rotationKeyframes = `
        @keyframes rotate-${index} {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(${360 * rotateDirection}deg); }
        }
    `;
    
    // Add the keyframes to the document
    const styleSheet = document.createElement('style');
    styleSheet.textContent = rotationKeyframes;
    document.head.appendChild(styleSheet);
    
    star.style.animation = `float ${floatDuration}s ease-in-out infinite, rotate-${index} ${rotateDuration}s linear infinite`;
    star.style.animationDelay = '0s';
    
    container.appendChild(star);
    
    // Add to global stars array for mouse interaction
    if (!window.interactiveStars) {
        window.interactiveStars = [];
    }
    window.interactiveStars.push(star);
}

// Mouse interaction system
let mouseX = 0;
let mouseY = 0;
let animationId = null;

// Initialize mouse interaction
function initMouseInteraction() {
    // Only add mouse interactions on non-touch devices to improve performance
    if (!('ontouchstart' in window)) {
        document.addEventListener('mousemove', handleMouseMove);
    }
    startPhysicsLoop();
}

function handleMouseMove(e) {
    mouseX = e.clientX;
    mouseY = e.clientY;
    
    if (window.interactiveStars) {
        window.interactiveStars.forEach(star => {
            const rect = star.getBoundingClientRect();
            const starCenterX = rect.left + rect.width / 2;
            const starCenterY = rect.top + rect.height / 2;
            
            const distance = Math.sqrt(
                Math.pow(mouseX - starCenterX, 2) + 
                Math.pow(mouseY - starCenterY, 2)
            );
            
            // Interaction radius - much smaller for closer interaction
            const interactionRadius = 30;
            
            if (distance < interactionRadius) {
                // Calculate force direction (away from mouse)
                const forceX = (starCenterX - mouseX) / distance;
                const forceY = (starCenterY - mouseY) / distance;
                
                // Apply force based on proximity (closer = stronger) - reduced magnitude
                const forceMagnitude = (interactionRadius - distance) / interactionRadius * 0.5;
                
                star.physics.velocityX += forceX * forceMagnitude;
                star.physics.velocityY += forceY * forceMagnitude;
                star.physics.isDisplaced = true;
            }
        });
    }
}

function startPhysicsLoop() {
    function updatePhysics() {
        if (window.interactiveStars) {
            window.interactiveStars.forEach(star => {
                if (star.physics.isDisplaced) {
                    // Apply damping to velocity
                    star.physics.velocityX *= star.physics.damping;
                    star.physics.velocityY *= star.physics.damping;
                    
                    // Get current position (convert from vw/vh back to percentage)
                    const currentLeft = parseFloat(star.style.left) || star.physics.originalX;
                    const currentTop = parseFloat(star.style.top) || star.physics.originalY;
                    
                    // Calculate new position
                    const newLeft = currentLeft + star.physics.velocityX;
                    const newTop = currentTop + star.physics.velocityY;
                    
                    // Apply spring force to return to original position
                    const returnForceX = (star.physics.originalX - newLeft) * star.physics.returnSpeed;
                    const returnForceY = (star.physics.originalY - newTop) * star.physics.returnSpeed;
                    
                    star.physics.velocityX += returnForceX;
                    star.physics.velocityY += returnForceY;
                    
                    // Update position using viewport units
                    star.style.left = newLeft + 'vw';
                    star.style.top = newTop + 'vh';
                    
                    // Check if star has returned close to original position
                    const distanceFromOrigin = Math.sqrt(
                        Math.pow(newLeft - star.physics.originalX, 2) + 
                        Math.pow(newTop - star.physics.originalY, 2)
                    );
                    
                    if (distanceFromOrigin < 0.5 && 
                        Math.abs(star.physics.velocityX) < 0.01 && 
                        Math.abs(star.physics.velocityY) < 0.01) {
                        // Reset to original position
                        star.style.left = star.physics.originalX + 'vw';
                        star.style.top = star.physics.originalY + 'vh';
                        star.physics.velocityX = 0;
                        star.physics.velocityY = 0;
                        star.physics.isDisplaced = false;
                    }
                }
            });
        }
        
        animationId = requestAnimationFrame(updatePhysics);
    }
    
    updatePhysics();
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Small delay to ensure stars are created first
    setTimeout(initMouseInteraction, 100);
});