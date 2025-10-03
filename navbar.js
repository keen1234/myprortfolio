const menuToggle = document.getElementById("menu-toggle");
const navLinks = document.getElementById("nav-links");

// Toggle mobile menu
menuToggle.addEventListener("click", () => {
    navLinks.classList.toggle("active");
    menuToggle.classList.toggle("open");
});

// Close mobile menu when clicking on a link and handle smooth scrolling
navLinks.addEventListener("click", (e) => {
    if (e.target.tagName === "A") {
        navLinks.classList.remove("active");
        menuToggle.classList.remove("open");
        
        // Handle smooth scrolling for anchor links
        if (e.target.href.includes('#')) {
            e.preventDefault();
            const targetId = e.target.getAttribute('href').substring(1);
            const targetSection = document.getElementById(targetId);
            
            if (targetSection) {
                targetSection.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
                
                // Update active states
                updateActiveNavLink(e.target);
            }
        }
    }
});

// Close mobile menu when clicking outside
document.addEventListener("click", (e) => {
    if (!menuToggle.contains(e.target) && !navLinks.contains(e.target)) {
        navLinks.classList.remove("active");
        menuToggle.classList.remove("open");
    }
});

// Close mobile menu on window resize if screen becomes larger
window.addEventListener("resize", () => {
    if (window.innerWidth > 768) {
        navLinks.classList.remove("active");
        menuToggle.classList.remove("open");
    }
});

// Blur navbar on scroll
window.addEventListener('scroll', function() {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 10) {
        navbar.classList.add('blurred');
    } else {
        navbar.classList.remove('blurred');
    }
});

// Page load transition
window.addEventListener('DOMContentLoaded', function() {
    document.body.style.opacity = '0';
    document.body.style.transform = 'translateY(20px)';
    
    setTimeout(() => {
        document.body.style.opacity = '1';
        document.body.style.transform = 'translateY(0)';
        document.body.style.transition = 'all 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
    }, 50);
});

// Prevent FOUC (Flash of Unstyled Content)
document.documentElement.style.opacity = '0';
window.addEventListener('load', function() {
    setTimeout(() => {
        document.documentElement.style.opacity = '1';
        document.documentElement.style.transition = 'opacity 0.3s ease-in-out';
    }, 100);
});

// Function to update active nav link with sparkle integration
function updateActiveNavLink(activeLink) {
    // Remove active class from all nav links and list items
    const allLinks = document.querySelectorAll('.nav-links a');
    const allListItems = document.querySelectorAll('.nav-links li');
    
    allLinks.forEach(link => {
        link.classList.remove('active', 'sparkle-active');
    });
    allListItems.forEach(li => {
        li.classList.remove('active');
    });
    
    // Add active class to clicked link and its parent li
    activeLink.classList.add('active', 'sparkle-active');
    activeLink.parentElement.classList.add('active');
    
    // Update sparkle navbar if it exists
    if (window.sparkleNav && window.sparkleNav.buttons) {
        const linkIndex = Array.from(window.sparkleNav.buttons).indexOf(activeLink);
        if (linkIndex !== -1 && linkIndex !== window.sparkleNav.activeIndex) {
            window.sparkleNav.setActiveIndex(linkIndex);
        }
    }
    
    // Update lightning navbar if it exists
    if (window.lightningNavbar) {
        const links = Array.from(document.querySelectorAll('.nav-links a'));
        const newIndex = links.indexOf(activeLink);
        if (newIndex !== -1 && newIndex !== window.lightningNavbar.activeIndex) {
            window.lightningNavbar.handleClick(newIndex);
        }
    }
}

// Enhanced Intersection Observer for automatic nav highlighting
const observerOptions = {
    root: null,
    rootMargin: '-10% 0px -70% 0px', // More responsive trigger area
    threshold: [0, 0.1, 0.5]
};

const observer = new IntersectionObserver((entries) => {
    // Find the most visible section
    let mostVisible = null;
    let maxRatio = 0;
    
    entries.forEach(entry => {
        if (entry.isIntersecting && entry.intersectionRatio > maxRatio) {
            maxRatio = entry.intersectionRatio;
            mostVisible = entry.target;
        }
    });
    
    // Update active nav item based on most visible section
    if (mostVisible) {
        const sectionId = mostVisible.id;
        const correspondingLink = document.querySelector(`.nav-links a[href="#${sectionId}"]`);
        if (correspondingLink) {
            updateActiveNavLink(correspondingLink);
        }
    }
}, observerOptions);

// Scroll-based section detection as fallback
let scrollTimeout;
function handleScrollNavigation() {
    clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(() => {
        const sections = document.querySelectorAll('section[id]');
        const scrollPos = window.scrollY + window.innerHeight / 3;
        
        let activeSection = null;
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionBottom = sectionTop + section.offsetHeight;
            
            if (scrollPos >= sectionTop && scrollPos <= sectionBottom) {
                activeSection = section;
            }
        });
        
        if (activeSection) {
            const correspondingLink = document.querySelector(`.nav-links a[href="#${activeSection.id}"]`);
            if (correspondingLink && !correspondingLink.classList.contains('active')) {
                updateActiveNavLink(correspondingLink);
            }
        }
    }, 100);
}

// Enhanced scroll listener for sticky navbar
window.addEventListener('scroll', function() {
    const navbar = document.querySelector('.navbar');
    
    // Debug: Check if navbar is sticking
    if (window.scrollY === 0) {
        console.log('At top - navbar should be in normal position');
    } else if (window.scrollY > 0) {
        console.log('Scrolled down - navbar should be sticky', {
            scrollY: window.scrollY,
            navbarTop: navbar.getBoundingClientRect().top,
            navbarPosition: getComputedStyle(navbar).position
        });
    }
    
    // Blur effect when scrolling
    if (window.scrollY > 10) {
        navbar.classList.add('blurred');
    } else {
        navbar.classList.remove('blurred');
    }
    
    // Navigation following
    handleScrollNavigation();
}, { passive: true });

// Simple function to test if sticky is working
function testStickyNavbar() {
    const navbar = document.querySelector('.navbar');
    if (navbar) {
        console.log('Navbar found. Computed style position:', getComputedStyle(navbar).position);
        console.log('Navbar rect:', navbar.getBoundingClientRect());
    }
}

// Initialize observers and set initial active state
document.addEventListener('DOMContentLoaded', () => {
    const sections = document.querySelectorAll('section[id]');
    
    // Test sticky navbar
    testStickyNavbar();
    
    // Observe sections for scroll tracking
    sections.forEach(section => observer.observe(section));
    
    // Set initial active state based on current scroll position
    setTimeout(() => {
        handleScrollNavigation();
    }, 500);
});

// Simple load event
window.addEventListener('load', testStickyNavbar);
