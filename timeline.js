// ===== SCROLL TIMELINE COMPONENT =====

class ScrollTimeline {
    constructor(options = {}) {
        // Configuration with defaults
        this.config = {
            events: options.events || this.getDefaultEvents(),
            title: options.title || "About Me",
            subtitle: options.subtitle || "Scroll to explore me",
            animationOrder: options.animationOrder || "sequential", // sequential, staggered, simultaneous
            cardAlignment: options.cardAlignment || "alternating", // alternating, left, right
            lineColor: options.lineColor || "rgba(255, 255, 255, 0.2)",
            activeColor: options.activeColor || "#6366f1",
            progressIndicator: options.progressIndicator !== false,
            cardVariant: options.cardVariant || "default", // default, elevated, outlined, filled
            cardEffect: options.cardEffect || "none", // none, glow, shadow, bounce
            parallaxIntensity: options.parallaxIntensity || 0.2,
            progressLineWidth: options.progressLineWidth || 2,
            progressLineCap: options.progressLineCap || "round",
            dateFormat: options.dateFormat || "badge", // text, badge
            revealAnimation: options.revealAnimation || "fade", // fade, slide, scale, flip, none
            connectorStyle: options.connectorStyle || "line", // dots, line, dashed
            perspective: options.perspective || false,
            darkMode: options.darkMode || false,
            smoothScroll: options.smoothScroll !== false
        };

        // DOM elements
        this.container = document.querySelector('.timeline-section');
        this.wrapper = document.querySelector('.timeline-wrapper');
        this.eventsContainer = document.querySelector('#timeline-events');
        this.progressLine = document.querySelector('.timeline-progress');
        this.glowElement = document.querySelector('.timeline-glow');
        
        // State
        this.activeIndex = -1;
        this.eventElements = [];
        this.dotElements = [];
        this.scrollProgress = 0;
        
        // Initialize
        this.init();
    }

    getDefaultEvents() {
        return [
            {
                id: "2024",
                year: "2024",
                title: "Portfolio Development",
                subtitle: "Personal Project",
                description: "Created an interactive portfolio with advanced animations, scroll effects, and responsive design.",
                icon: "💻",
                color: "#6366f1"
            },
            {
                id: "2023",
                year: "2023",
                title: "Frontend Specialization",
                subtitle: "Skill Development",
                description: "Focused on modern frontend technologies including React, Vue, and advanced CSS animations.",
                icon: "🎨",
                color: "#a855f7"
            },
            {
                id: "2022",
                year: "2022",
                title: "JavaScript Mastery",
                subtitle: "Technical Growth",
                description: "Deepened understanding of JavaScript ES6+, async programming, and modern development practices.",
                icon: "⚡",
                color: "#22d3ee"
            },
            {
                id: "2021",
                year: "2021",
                title: "Web Development Journey",
                subtitle: "Career Start",
                description: "Began the journey into web development, learning HTML, CSS, and fundamental programming concepts.",
                icon: "🚀",
                color: "#f59e0b"
            }
        ];
    }

    init() {
        if (!this.container || !this.eventsContainer) {
            console.log('Timeline elements not found');
            return;
        }

        this.setupTimeline();
        this.createEvents();
        this.setupScrollListener();
        this.setupIntersectionObserver();
        
        // Apply configuration
        this.applyConfiguration();
        
        console.log('ScrollTimeline initialized');
    }

    setupTimeline() {
        // Set title and subtitle
        const titleElement = document.querySelector('.timeline-title');
        const subtitleElement = document.querySelector('.timeline-subtitle');
        
        if (titleElement) titleElement.textContent = this.config.title;
        if (subtitleElement) subtitleElement.textContent = this.config.subtitle;
    }

    createEvents() {
        this.eventsContainer.innerHTML = '';
        
        this.config.events.forEach((event, index) => {
            const eventElement = this.createEventElement(event, index);
            this.eventsContainer.appendChild(eventElement);
            this.eventElements.push(eventElement);
            
            const dotElement = eventElement.querySelector('.timeline-dot');
            this.dotElements.push(dotElement);
        });
    }

    createEventElement(event, index) {
        const eventDiv = document.createElement('div');
        eventDiv.className = 'timeline-event';
        eventDiv.dataset.index = index;
        
        // Apply animation delay based on order
        const delay = this.getAnimationDelay(index);
        eventDiv.style.animationDelay = `${delay}s`;
        
        // Create card alignment classes
        const alignmentClass = this.getCardAlignment(index);
        
        eventDiv.innerHTML = `
            <div class="timeline-dot" data-index="${index}"></div>
            <div class="timeline-card ${this.config.cardVariant} ${this.config.cardEffect} ${alignmentClass}">
                ${this.createCardContent(event)}
            </div>
        `;
        
        return eventDiv;
    }

    createCardContent(event) {
        const iconHtml = event.icon && event.icon !== 'undefined' ? `<span class="timeline-icon">${event.icon}</span>` : '';
        const title = event.title && event.title !== 'undefined' ? event.title : '';
        const subtitle = event.subtitle && event.subtitle !== 'undefined' ? event.subtitle : '';
        const description = event.description && event.description !== 'undefined' ? event.description : '';

        return `
            ${iconHtml ? `<div class="timeline-icon-wrapper">${iconHtml}</div>` : ''}
            ${title ? `<h3 class="timeline-title-text">${title}</h3>` : ''}
            ${subtitle ? `<p class="timeline-subtitle-text">${subtitle}</p>` : ''}
            ${description ? `<p class="timeline-description">${description}</p>` : ''}
        `;
    }

    getAnimationDelay(index) {
        switch (this.config.animationOrder) {
            case 'simultaneous':
                return 0;
            case 'staggered':
                return index * 0.2;
            case 'sequential':
            default:
                return index * 0.3;
        }
    }

    getCardAlignment(index) {
        if (this.config.cardAlignment === 'alternating') {
            return ''; // Default alternating handled by CSS
        } else if (this.config.cardAlignment === 'left') {
            return 'align-left';
        } else if (this.config.cardAlignment === 'right') {
            return 'align-right';
        }
        return '';
    }

    setupScrollListener() {
        let ticking = false;
        
        const handleScroll = () => {
            if (!ticking) {
                requestAnimationFrame(() => {
                    this.updateProgress();
                    this.updateActiveElements();
                    ticking = false;
                });
                ticking = true;
            }
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        
        // Initial update
        this.updateProgress();
        this.updateActiveElements();
    }

    updateProgress() {
        if (!this.wrapper || !this.progressLine) return;

        const rect = this.wrapper.getBoundingClientRect();
        const windowHeight = window.innerHeight;
        const wrapperHeight = rect.height;
        
        // Calculate progress based on wrapper position
        const startPoint = rect.top + window.scrollY - windowHeight * 0.5;
        const endPoint = startPoint + wrapperHeight;
        const currentScroll = window.scrollY + windowHeight * 0.5;
        
        let progress = (currentScroll - startPoint) / (endPoint - startPoint);
        progress = Math.max(0, Math.min(1, progress));
        
        this.scrollProgress = progress;
        
        // Update progress line height
        this.progressLine.style.height = `${progress * 100}%`;
        
        // Update glow position
        if (this.glowElement) {
            const glowPosition = progress * 100;
            this.glowElement.style.top = `${glowPosition}%`;
            
            if (progress > 0 && progress < 1) {
                this.glowElement.classList.add('active');
            } else {
                this.glowElement.classList.remove('active');
            }
        }
    }

    updateActiveElements() {
        const newIndex = Math.floor(this.scrollProgress * this.config.events.length);
        const clampedIndex = Math.max(0, Math.min(this.config.events.length - 1, newIndex));
        
        if (clampedIndex !== this.activeIndex) {
            this.setActiveIndex(clampedIndex);
        }
    }

    setActiveIndex(index) {
        // Remove previous active states
        this.dotElements.forEach((dot, i) => {
            if (i <= index) {
                dot.classList.add('active');
            } else {
                dot.classList.remove('active');
            }
        });
        
        this.activeIndex = index;
    }

    setupIntersectionObserver() {
        const observerOptions = {
            root: null,
            rootMargin: '-20% 0px -20% 0px',
            threshold: 0.1
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    this.applyRevealAnimation(entry.target);
                }
            });
        }, observerOptions);

        this.eventElements.forEach(element => {
            observer.observe(element);
        });
    }

    applyRevealAnimation(element) {
        const index = parseInt(element.dataset.index);
        
        switch (this.config.revealAnimation) {
            case 'slide':
                if (index % 2 === 0) {
                    element.classList.add('slide-left');
                } else {
                    element.classList.add('slide-right');
                }
                break;
            case 'scale':
                element.classList.add('scale-in');
                break;
            case 'fade':
            default:
                element.classList.add('fade-in');
                break;
        }
    }

    applyConfiguration() {
        // Apply dark mode
        if (this.config.darkMode) {
            this.container.classList.add('dark-mode');
        }
        
        // Apply smooth scroll
        if (this.config.smoothScroll) {
            this.container.classList.add('smooth-scroll');
        }
        
        // Apply perspective effect
        if (this.config.perspective) {
            this.eventElements.forEach(element => {
                const card = element.querySelector('.timeline-card');
                if (card) {
                    card.classList.add('perspective');
                }
            });
        }
        
        // Apply line color
        const timelineLine = document.querySelector('.timeline-line');
        if (timelineLine) {
            timelineLine.style.background = this.config.lineColor;
        }
        
        // Apply progress line width
        if (this.progressLine) {
            this.progressLine.style.width = `${this.config.progressLineWidth}px`;
        }
    }

    // Public methods for external control
    scrollToEvent(index) {
        if (index >= 0 && index < this.eventElements.length) {
            this.eventElements[index].scrollIntoView({
                behavior: 'smooth',
                block: 'center'
            });
        }
    }

    updateEvents(newEvents) {
        this.config.events = newEvents;
        this.createEvents();
        this.setupIntersectionObserver();
    }

    setActiveColor(color) {
        this.config.activeColor = color;
        // Update CSS custom properties if needed
        document.documentElement.style.setProperty('--timeline-active-color', color);
    }

    destroy() {
        // Clean up event listeners and observers
        window.removeEventListener('scroll', this.handleScroll);
        // Add more cleanup as needed
    }
}

// Auto-initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Check if timeline section exists
    if (document.querySelector('.timeline-section')) {
        window.scrollTimeline = new ScrollTimeline({
            // Custom configuration can be passed here
            events: [
                {
                    id: "2024",
                    title: "Basic information",
                    subtitle: "About me",
                    description: "Hi, i'm Kenth, an Inforamtion Technology student with a passion for web and application development. I love creating interactive and visually appealing web experiences that engage users.",
                    icon: "⚡",
                    color: "#6366f1"
                },
                {
                    id: "2023",
                    year: "2023",
                    title: "School",
                    subtitle: "STI - Dasmarinas",
                    description: "Im current studying Information Technology at STI College Dasmarinas, where I'm honing my skills in web and application development.",
                    icon: "🎨",
                    color: "#a855f7"
                },
                {
                    id: "2022",
                    year: "2022",
                    title: "Language Proficiency",
                    subtitle: "",
                    description: "The language I currently know is html, css, javascript, and java",
                    icon: "💻",
                    color: "#22d3ee"
                },
            ],
            animationOrder: "staggered",
            cardEffect: "glow",
            revealAnimation: "slide",
            progressIndicator: true,
            parallaxIntensity: 0.1,
            perspective: true
        });
        
        console.log('ScrollTimeline initialized globally');
    }
});