// Star generation system
function generateRandomStars() {
    const colors = ['#FFD700', '#4ECDC4', '#FF6B6B', '#95E1D3'];
    const headerStars = 4;
    const mainStars = 12;
    const minDistance = 100; // Minimum distance between stars to prevent clustering
    let globalStarIndex = 0;
    
    // Generate header stars
    globalStarIndex = generateStarsInArea('header-stars', headerStars, colors, minDistance, {
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        excludeCenter: true // Avoid placing stars over the title
    }, globalStarIndex);
    
    // Generate main content stars
    generateStarsInArea('floating-decorations', mainStars, colors, minDistance, {
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        excludeCenter: false
    }, globalStarIndex);
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
    
    if (isHeader) {
        // For header stars, avoid the center area where title is
        do {
            x = Math.random() * 100;
            y = Math.random() * 100;
        } while (x > 25 && x < 75 && y > 30 && y < 70); // Exclude center area
    } else {
        // For main content stars, prefer edges and corners
        const edge = Math.random();
        if (edge < 0.5) {
            // Top or bottom edge
            x = Math.random() * 100;
            y = Math.random() < 0.5 ? Math.random() * 20 : 80 + Math.random() * 20;
        } else {
            // Left or right edge
            x = Math.random() < 0.5 ? Math.random() * 20 : 80 + Math.random() * 20;
            y = Math.random() * 100;
        }
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
    
    // Set position
    star.style.position = 'absolute';
    star.style.left = position.x + '%';
    star.style.top = position.y + '%';
    star.style.width = '40px';
    star.style.height = '40px';
    star.style.opacity = '0.8';
    star.style.pointerEvents = 'none';
    star.style.zIndex = '-10';
    
    // Add random animation
    const floatDuration = 5 + Math.random() * 4; // 5-9 seconds
    const rotateDuration = 8 + Math.random() * 12; // 8-20 seconds
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
}