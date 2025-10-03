/**
 * 3D Carousel Component
 * Converted from React to vanilla JavaScript
 */

class ThreeDCarousel {
    constructor(element, options = {}) {
        this.container = element;
        this.options = {
            autoRotate: true,
            rotateInterval: 3000,
            touchThreshold: 50,
            centerActive: true,
            ...options
        };

        this.currentIndex = 0;
        this.isRotating = this.options.autoRotate;
        this.rotationInterval = null;
        this.touchStartX = 0;
        this.touchEndX = 0;
        this.isVisible = false;
        this.isDragging = false;

        // Sample data - in real implementation, this would be passed as parameter
        this.carouselData = [
            {
                id: 1,
                brand: "PORTFOLIO",
                imageTitle: "Personal Brand",
                title: "Creative Portfolio Website",
                subtitle: "Full-Stack Development",
                description: "A modern, responsive portfolio showcasing my development skills and creative projects with interactive animations and smooth user experience.",
                tags: ["Api", "Native-HTML", "CSS3", "JavaScript"],
                status: "Active",
                link: "https://www.alejokenthcabanero.dev/"
            },
            {
                id: 2,
                brand: "Library system",
                imageTitle: "Librows",
                title: "Library Management System",
                subtitle: "web application",
                description: "This is a web application that helps manage library resources efficiently and let the user to reserve the book online.",
                tags: ["Springboot Framework", "Mysql", "Java", "HTML", "CSS", "javaScript"],
                status: "In Progress",
                link: "https://github.com/keen1234/FinalProject"
            },
            {
                id: 3,
                brand: "MOBILE",
                imageTitle: "Mobile App",
                title: "Wallet App",
                subtitle: "Budgeting App",
                description: "This is a mobile application that helps users manage their personal finances by tracking income, expenses, and savings goals in an intuitive and user-friendly interface.",
                tags: ["Android Studio", "Java", "Kotlin", "XML"],
                status: "In Progress",
                link: "https://github.com/keen1234/WalletApp"
            },
        ];

        this.init();
    }

    init() {
        this.setupElements();
        this.createCards();
        this.createIndicators();
        this.setupEventListeners();
        this.setupIntersectionObserver();
        this.updateCarousel();
        
        if (this.options.autoRotate) {
            this.startAutoRotate();
        }
    }

    setupElements() {
        this.track = this.container.querySelector('.carousel-track');
        this.prevBtn = this.container.querySelector('.prev-btn');
        this.nextBtn = this.container.querySelector('.next-btn');
        this.indicatorContainer = this.container.querySelector('.carousel-indicators');
        this.wrapper = this.container.querySelector('.carousel-wrapper');
    }

    createCards() {
        this.track.innerHTML = '';
        
        this.carouselData.forEach((item, index) => {
            const card = document.createElement('div');
            card.className = 'carousel-card';
            card.innerHTML = `
                <div class="card-image" style="background-image: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
                    <div class="card-status-badge status-${item.status.toLowerCase().replace(' ', '-')}">
                        <span class="status-text">${item.status}</span>
                    </div>
                    <div class="card-image-content">
                        <div class="card-brand">${item.brand}</div>
                        <div class="card-brand-divider"></div>
                        <div class="card-image-title">${item.imageTitle}</div>
                    </div>
                </div>
                <div class="card-content">
                    <h3 class="card-title">${item.title}</h3>
                    <p class="card-subtitle">${item.subtitle}</p>
                    <p class="card-description">${item.description}</p>
                    <div class="card-tags">
                        ${item.tags.map(tag => `<span class="card-tag">${tag}</span>`).join('')}
                    </div>
                    <a href="${item.link}" class="card-link">
                        <span class="card-link-text">View Project</span>
                        <svg class="card-link-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M7 17L17 7"></path>
                            <path d="M7 7h10v10"></path>
                        </svg>
                        <div class="card-link-underline"></div>
                    </a>
                </div>
            `;
            this.track.appendChild(card);
        });

        this.cards = this.track.querySelectorAll('.carousel-card');
    }

    createIndicators() {
        this.indicatorContainer.innerHTML = '';
        
        this.carouselData.forEach((_, index) => {
            const indicator = document.createElement('button');
            indicator.className = 'carousel-indicator';
            indicator.setAttribute('aria-label', `Go to slide ${index + 1}`);
            indicator.addEventListener('click', () => this.goToSlide(index));
            this.indicatorContainer.appendChild(indicator);
        });

        this.indicators = this.indicatorContainer.querySelectorAll('.carousel-indicator');
    }

    setupEventListeners() {
        // Navigation buttons
        this.prevBtn?.addEventListener('click', () => this.previous());
        this.nextBtn?.addEventListener('click', () => this.next());

        // Touch events
        this.wrapper.addEventListener('touchstart', this.handleTouchStart.bind(this), { passive: true });
        this.wrapper.addEventListener('touchmove', this.handleTouchMove.bind(this), { passive: false });
        this.wrapper.addEventListener('touchend', this.handleTouchEnd.bind(this), { passive: true });

        // Mouse events for desktop dragging
        this.wrapper.addEventListener('mousedown', this.handleMouseDown.bind(this));
        this.wrapper.addEventListener('mousemove', this.handleMouseMove.bind(this));
        this.wrapper.addEventListener('mouseup', this.handleMouseUp.bind(this));
        this.wrapper.addEventListener('mouseleave', this.handleMouseUp.bind(this));

        // Keyboard navigation
        this.container.addEventListener('keydown', this.handleKeyDown.bind(this));

        // Pause on hover
        this.wrapper.addEventListener('mouseenter', () => this.pauseAutoRotate());
        this.wrapper.addEventListener('mouseleave', () => this.resumeAutoRotate());

        // Visibility change
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.pauseAutoRotate();
            } else if (this.isVisible) {
                this.resumeAutoRotate();
            }
        });
    }

    setupIntersectionObserver() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                this.isVisible = entry.isIntersecting;
                if (entry.isIntersecting && this.options.autoRotate) {
                    this.startAutoRotate();
                } else {
                    this.stopAutoRotate();
                }
            });
        }, {
            threshold: 0.5
        });

        observer.observe(this.container);
    }

    // Touch event handlers
    handleTouchStart(e) {
        this.touchStartX = e.touches[0].clientX;
        this.isDragging = true;
        this.wrapper.classList.add('swiping');
        this.pauseAutoRotate();
    }

    handleTouchMove(e) {
        if (!this.isDragging) return;
        
        this.touchEndX = e.touches[0].clientX;
        const deltaX = this.touchStartX - this.touchEndX;
        
        // Prevent scrolling when swiping horizontally
        if (Math.abs(deltaX) > 10) {
            e.preventDefault();
        }
    }

    handleTouchEnd(e) {
        if (!this.isDragging) return;
        
        this.isDragging = false;
        this.wrapper.classList.remove('swiping');
        
        const deltaX = this.touchStartX - this.touchEndX;
        
        if (Math.abs(deltaX) > this.options.touchThreshold) {
            if (deltaX > 0) {
                this.next();
            } else {
                this.previous();
            }
        }
        
        this.resumeAutoRotate();
    }

    // Mouse event handlers for desktop dragging
    handleMouseDown(e) {
        this.touchStartX = e.clientX;
        this.isDragging = true;
        this.wrapper.classList.add('swiping');
        this.pauseAutoRotate();
        e.preventDefault();
    }

    handleMouseMove(e) {
        if (!this.isDragging) return;
        this.touchEndX = e.clientX;
    }

    handleMouseUp(e) {
        if (!this.isDragging) return;
        
        this.isDragging = false;
        this.wrapper.classList.remove('swiping');
        
        const deltaX = this.touchStartX - this.touchEndX;
        
        if (Math.abs(deltaX) > this.options.touchThreshold) {
            if (deltaX > 0) {
                this.next();
            } else {
                this.previous();
            }
        }
        
        this.resumeAutoRotate();
    }

    // Keyboard navigation
    handleKeyDown(e) {
        switch (e.key) {
            case 'ArrowLeft':
                e.preventDefault();
                this.previous();
                break;
            case 'ArrowRight':
                e.preventDefault();
                this.next();
                break;
            case ' ':
                e.preventDefault();
                this.toggleAutoRotate();
                break;
        }
    }

    // Navigation methods
    next() {
        this.currentIndex = (this.currentIndex + 1) % this.carouselData.length;
        this.updateCarousel();
    }

    previous() {
        this.currentIndex = this.currentIndex === 0 ? this.carouselData.length - 1 : this.currentIndex - 1;
        this.updateCarousel();
    }

    goToSlide(index) {
        if (index >= 0 && index < this.carouselData.length) {
            this.currentIndex = index;
            this.updateCarousel();
        }
    }

    updateCarousel() {
        const totalCards = this.cards.length;
        
        this.cards.forEach((card, index) => {
            card.classList.remove('active', 'next', 'prev', 'hidden');
            
            if (index === this.currentIndex) {
                card.classList.add('active');
            } else if (index === (this.currentIndex + 1) % totalCards) {
                card.classList.add('next');
            } else if (index === (this.currentIndex - 1 + totalCards) % totalCards) {
                card.classList.add('prev');
            } else {
                card.classList.add('hidden');
            }
        });

        // Update indicators
        this.indicators.forEach((indicator, index) => {
            indicator.classList.toggle('active', index === this.currentIndex);
        });

        // Update ARIA attributes
        this.cards.forEach((card, index) => {
            card.setAttribute('aria-hidden', index !== this.currentIndex);
        });
    }

    // Auto-rotation methods
    startAutoRotate() {
        if (!this.options.autoRotate || !this.isVisible) return;
        
        this.stopAutoRotate();
        this.isRotating = true;
        this.rotationInterval = setInterval(() => {
            if (this.isRotating && this.isVisible && !this.isDragging) {
                this.next();
            }
        }, this.options.rotateInterval);
        
        this.wrapper.classList.remove('paused');
    }

    stopAutoRotate() {
        if (this.rotationInterval) {
            clearInterval(this.rotationInterval);
            this.rotationInterval = null;
        }
        this.isRotating = false;
    }

    pauseAutoRotate() {
        this.isRotating = false;
        this.wrapper.classList.add('paused');
    }

    resumeAutoRotate() {
        if (this.options.autoRotate && this.isVisible) {
            this.isRotating = true;
            this.wrapper.classList.remove('paused');
            if (!this.rotationInterval) {
                this.startAutoRotate();
            }
        }
    }

    toggleAutoRotate() {
        if (this.options.autoRotate) {
            if (this.isRotating) {
                this.pauseAutoRotate();
            } else {
                this.resumeAutoRotate();
            }
        }
    }

    // Public API methods
    getCurrentIndex() {
        return this.currentIndex;
    }

    getTotalSlides() {
        return this.carouselData.length;
    }

    setData(newData) {
        this.carouselData = newData;
        this.currentIndex = 0;
        this.createCards();
        this.createIndicators();
        this.updateCarousel();
    }

    destroy() {
        this.stopAutoRotate();
        this.container.removeEventListener('keydown', this.handleKeyDown);
        this.wrapper.removeEventListener('touchstart', this.handleTouchStart);
        this.wrapper.removeEventListener('touchmove', this.handleTouchMove);
        this.wrapper.removeEventListener('touchend', this.handleTouchEnd);
        this.wrapper.removeEventListener('mousedown', this.handleMouseDown);
        this.wrapper.removeEventListener('mousemove', this.handleMouseMove);
        this.wrapper.removeEventListener('mouseup', this.handleMouseUp);
        this.wrapper.removeEventListener('mouseleave', this.handleMouseUp);
        this.wrapper.removeEventListener('mouseenter', this.pauseAutoRotate);
        this.wrapper.removeEventListener('mouseleave', this.resumeAutoRotate);
    }
}

// Initialize carousel when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    const carouselElement = document.querySelector('.threed-carousel-container');
    if (carouselElement) {
        window.carousel = new ThreeDCarousel(carouselElement, {
            autoRotate: true,
            rotateInterval: 4000,
            touchThreshold: 50,
            centerActive: true
        });
    }
});

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ThreeDCarousel;
}