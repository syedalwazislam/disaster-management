document.addEventListener("DOMContentLoaded", () => {
    const themeToggle = document.getElementById("theme-toggle");
    const body = document.body;
    const burgerMenu = document.querySelector(".burger-menu");
    const mobileMenu = document.querySelector(".mobile-menu");
    const authButtons = document.querySelector(".auth-buttons"); // Login/Signup Buttons

    // Theme Toggle with Smooth Transition
    themeToggle.addEventListener("click", () => {
        body.classList.toggle("dark-theme");
        themeToggle.innerHTML = body.classList.contains("dark-theme")
            ? '<i class="fas fa-sun"></i>'
            : '<i class="fas fa-moon"></i>';

        // Store theme preference
        localStorage.setItem("dark-theme", body.classList.contains("dark-theme") ? "enabled" : "disabled");
    });

    // Burger Menu Toggle (For Mobile)
    burgerMenu.addEventListener("click", () => {
        mobileMenu.classList.toggle("active");
        burgerMenu.classList.toggle("open");
        burgerMenu.classList.toggle('toggle');
    });

    // Close menu when clicking a link inside mobile menu
    document.querySelectorAll(".mobile-menu a").forEach(link => {
        link.addEventListener("click", () => {
            mobileMenu.classList.remove("active");
            burgerMenu.classList.remove("open");
        });
    });

    // Ensure navbar adjusts correctly on resize
    window.addEventListener("resize", () => {
        if (window.innerWidth >= 769) {
            mobileMenu.classList.remove("active");
            burgerMenu.classList.remove("open");
            authButtons.style.display = "flex"; // Show login/signup buttons
        } else {
            authButtons.style.display = "none"; // Hide on mobile (inside burger menu)
        }
    });

    // Initialize visibility based on screen size
    if (window.innerWidth >= 769) {
        authButtons.style.display = "flex";
        mobileMenu.classList.remove("active"); // Ensure menu is hidden on desktop
    } else {
        authButtons.style.display = "none";
    }

    // Smooth Scroll for Internal Links
    document.querySelectorAll("a[href^='#']").forEach(anchor => {
        anchor.addEventListener("click", (e) => {
            e.preventDefault();
            const target = document.querySelector(anchor.getAttribute("href"));
            if (target) {
                window.scrollTo({
                    top: target.offsetTop - 70,
                    behavior: "smooth"
                });
            }
        });
    });

    // Dark Theme Persistence
    if (localStorage.getItem("dark-theme") === "enabled") {
        body.classList.add("dark-theme");
        themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
    }
});


document.addEventListener("DOMContentLoaded", () => {
    const loginBtn = document.getElementById("open-login");
    const signupBtn = document.getElementById("open-signup");
    const loginBtnMobile = document.getElementById("open-login-mobile");
    const signupBtnMobile = document.getElementById("open-signup-mobile");
    const modal = document.getElementById("auth-modal");
    const closeModal = document.querySelector(".close");
    const switchToSignup = document.getElementById("switch-to-signup");
    const switchToLogin = document.getElementById("switch-to-login");
    const loginForm = document.getElementById("login-form");
    const signupForm = document.getElementById("signup-form");
    const authButtons = document.querySelector(".auth-buttons");
    const userMenu = document.querySelector(".user-menu");
    const userIcon = document.querySelector(".user-icon");
    const logoutBtn = document.getElementById("logout");
    const countrySelect = document.getElementById("country");
    const citySelect = document.getElementById("city");

    // Open Modal
    function openModal() {
        modal.classList.add("active");
    }

    loginBtn?.addEventListener("click", openModal);
    signupBtn?.addEventListener("click", openModal);

    // Close Modal
    closeModal?.addEventListener("click", () => {
        modal.classList.remove("active");
    });

    // Handle Mobile Buttons
    loginBtnMobile?.addEventListener("click", function () {
        loginForm.style.display = "block";
        signupForm.style.display = "none";
        openModal();
    });

    signupBtnMobile?.addEventListener("click", function () {
        loginForm.style.display = "none";
        signupForm.style.display = "block";
        openModal();
    });

    // Close modal when clicking outside
    window.addEventListener("click", (e) => {
        if (e.target === modal) {
            modal.classList.remove("active");
        }
    });

    // Switch Between Login/Signup
    switchToSignup?.addEventListener("click", (e) => {
        e.preventDefault();
        loginForm.style.display = "none";
        signupForm.style.display = "block";
    });

    switchToLogin?.addEventListener("click", (e) => {
        e.preventDefault();
        signupForm.style.display = "none";
        loginForm.style.display = "block";
    });

    // Simulated Login
    document.querySelector("#login-form button")?.addEventListener("click", (e) => {
        e.preventDefault();
        modal.classList.remove("active");
        authButtons.style.display = "none";
        userMenu.style.display = "block";
    });

    // Toggle User Menu Dropdown
    userIcon?.addEventListener("click", (e) => {
        e.stopPropagation(); // Prevent event from reaching document click
        userMenu.classList.toggle("open");
    });

    // Close dropdown if clicking outside
    document.addEventListener("click", (e) => {
        if (!userMenu.contains(e.target) && !userIcon.contains(e.target)) {
            userMenu.classList.remove("open");
        }
    });

    // Logout
    logoutBtn?.addEventListener("click", () => {
        authButtons.style.display = "flex";
        userMenu.style.display = "none";
    });

    $(document).ready(function () {
        // Initialize select elements
        const $countrySelect = $('#country');
        const $citySelect = $('#city');

        // Format country display with flag
        function formatCountry(country) {
            if (!country.id) return country.text;
            const flagUrl = $(country.element).data('flag');
            return $('<span><img class="country-flag" src="' + flagUrl + '"/> ' + country.text + '</span>');
        }

        // Fetch and populate countries
        fetch("https://restcountries.com/v3.1/all")
            .then(response => response.json())
            .then(data => {
                const countries = data.map(country => ({
                    name: country.name.common,
                    code: country.cca2,
                    flag: country.flags?.svg || ""
                })).sort((a, b) => a.name.localeCompare(b.name));

                // Populate country dropdown
                $countrySelect.append('<option value="">Select Country</option>');
                countries.forEach(country => {
                    $countrySelect.append(
                        $('<option></option>')
                            .val(country.name)
                            .text(country.name)
                            .data('code', country.code)
                            .data('flag', country.flag)
                    );
                });

                // Initialize Select2 for countries
                $countrySelect.select2({
                    placeholder: "Select Country",
                    allowClear: true,
                    templateResult: formatCountry,
                    templateSelection: formatCountry
                });

                // Handle country change event
                $countrySelect.on('change', function () {
                    const selectedCountry = $(this).val();

                    // Reset city dropdown
                    $citySelect.empty().prop('disabled', true);

                    if (selectedCountry) {
                        $citySelect.append('<option value="">Loading cities...</option>');

                        // Fetch cities for selected country
                        fetch('https://countriesnow.space/api/v0.1/countries/cities', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({
                                country: selectedCountry
                            })
                        })
                            .then(response => response.json())
                            .then(data => {
                                if (data.error) throw new Error(data.msg);

                                // Sort and populate cities
                                const cities = data.data.sort();
                                $citySelect.empty().append('<option value="">Select City</option>');
                                cities.forEach(city => {
                                    $citySelect.append($('<option></option>').val(city).text(city));
                                });
                                $citySelect.prop('disabled', false).select2({
                                    placeholder: "Select City",
                                    allowClear: true
                                });
                            })
                            .catch(error => {
                                console.error("Error loading cities:", error);
                                $citySelect.empty().append('<option value="">Failed to load cities</option>');
                            });
                    } else {
                        $citySelect.append('<option value="">-- Select a country first --</option>');
                    }
                });
            })
            .catch(error => {
                console.error("Error loading countries:", error);
                $countrySelect.append('<option value="">Failed to load countries</option>');
            });
    });


});

// script.js
document.addEventListener('DOMContentLoaded', function () {
    // Toggle full story visibility
    const storyToggle = document.getElementById('storyToggle');
    const fullStory = document.getElementById('fullStory');

    if (storyToggle && fullStory) {
        storyToggle.addEventListener('click', function () {
            const isHidden = fullStory.classList.contains('hidden');

            fullStory.classList.toggle('hidden', !isHidden);
            this.textContent = isHidden ? 'Show Less ↑' : 'Read More ↓';
        });
    }

    // Animate mission cards on scroll
    const missionCards = document.querySelectorAll('.mission-card');

    const animateOnScroll = () => {
        missionCards.forEach((card, index) => {
            const cardPosition = card.getBoundingClientRect().top;
            const screenPosition = window.innerHeight / 1.3;

            if (cardPosition < screenPosition) {
                setTimeout(() => {
                    card.style.opacity = '1';
                    card.style.transform = 'translateY(0)';
                }, index * 100);
            }
        });
    };

    // Set initial state for animation
    missionCards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        card.style.transition = `all 0.5s ease ${index * 0.1}s`;
    });

    // Run on load and scroll
    animateOnScroll();
    window.addEventListener('scroll', animateOnScroll);
});

// Initialize Interactive Disaster Map
document.addEventListener('DOMContentLoaded', function () {
    // Create map instance
    const map = L.map('disaster-map').setView([20, 0], 2);

    // Add tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 18,
        minZoom: 2
    }).addTo(map);

    // Sample disaster data (in production, fetch from API)
    const disasters = [
        {
            type: 'earthquake',
            name: 'Turkey Earthquake',
            location: [37.2, 38.1],
            date: '2023-02-06',
            severity: '7.8 Magnitude',
            casualties: 50000,
            response: {
                teams: 12,
                volunteers: 450,
                progress: 65
            }
        },
        {
            type: 'flood',
            name: 'Pakistan Floods',
            location: [30.4, 69.3],
            date: '2022-08-01',
            severity: 'Extreme',
            affected: '33 Million',
            response: {
                teams: 8,
                volunteers: 320,
                progress: 82
            }
        },
        {
            type: 'wildfire',
            name: 'Canadian Wildfires',
            location: [56.1, -110.2],
            date: '2023-05-01',
            severity: '18.4M Acres',
            response: {
                teams: 5,
                volunteers: 180,
                progress: 45
            }
        }
    ];

    // Create icon based on disaster type
    function getDisasterIcon(type) {
        const iconColors = {
            earthquake: '#ef4444',
            flood: '#3b82f6',
            wildfire: '#f59e0b',
            hurricane: '#8b5cf6'
        };

        return L.divIcon({
            className: `disaster-marker ${type}`,
            html: `
          <svg viewBox="0 0 24 24" width="24" height="24">
            <path fill="${iconColors[type] || '#64748b'}" d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
          </svg>
        `,
            iconSize: [24, 24],
            iconAnchor: [12, 24],
            popupAnchor: [0, -24]
        });
    }

    // Create marker layer group
    const markerLayer = L.layerGroup().addTo(map);

    // Create heatmap layer
    const heatLayer = L.heatLayer([], {
        radius: 25,
        blur: 15,
        maxZoom: 9,
        gradient: { 0.4: 'blue', 0.6: 'lime', 0.8: 'yellow', 1.0: 'red' }
    });

    // Add markers to map
    disasters.forEach(disaster => {
        const marker = L.marker(disaster.location, {
            icon: getDisasterIcon(disaster.type)
        }).addTo(markerLayer);

        // Create popup content
        const popupContent = `
        <div class="disaster-popup">
          <h3>${disaster.name}</h3>
          <p><strong>Type:</strong> ${disaster.type.charAt(0).toUpperCase() + disaster.type.slice(1)}</p>
          <p><strong>Date:</strong> ${disaster.date}</p>
          <p><strong>Severity:</strong> ${disaster.severity}</p>
          
          ${disaster.casualties ? `<p><strong>Casualties:</strong> ${disaster.casualties.toLocaleString()}</p>` : ''}
          ${disaster.affected ? `<p><strong>Affected:</strong> ${disaster.affected}</p>` : ''}
          
          <div class="response-progress">
            <p><strong>Response Progress:</strong></p>
            <div class="progress-bar">
              <div class="progress-fill" style="width: ${disaster.response.progress}%"></div>
            </div>
          </div>
          
          <p><strong>Teams:</strong> ${disaster.response.teams}</p>
          <p><strong>Volunteers:</strong> ${disaster.response.volunteers}</p>
        </div>
      `;

        marker.bindPopup(popupContent);

        // Add to heatmap layer
        const intensity = disaster.type === 'earthquake' ? 0.8 :
            disaster.type === 'flood' ? 0.6 : 0.5;
        heatLayer.addLatLng(disaster.location[0], disaster.location[1], intensity);
    });

    // Toggle between markers and heatmap
    document.getElementById('toggle-markers').addEventListener('click', function () {
        this.classList.add('active');
        document.getElementById('toggle-heatmap').classList.remove('active');
        map.addLayer(markerLayer);
        map.removeLayer(heatLayer);
    });

    document.getElementById('toggle-heatmap').addEventListener('click', function () {
        this.classList.add('active');
        document.getElementById('toggle-markers').classList.remove('active');
        map.addLayer(heatLayer);
        map.removeLayer(markerLayer);
    });



});

document.addEventListener('DOMContentLoaded', function () {
    // Initialize the map with responsive view
    const map = L.map('disasterMap', {
        preferCanvas: true, // Better performance
        zoomSnap: 0.5, // Smoother zooming
        wheelPxPerZoomLevel: 60 // Better scroll zoom
    }).setView([20, 0], 2);

    // Add tile layer with retina support for high-DPI displays
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        detectRetina: true,
        maxZoom: 19,
        minZoom: 2
    }).addTo(map);

    // Sample disaster data
    const disasters = [
        {
            location: [37.2, 38.1],
            type: 'earthquake',
            name: 'Turkey Earthquake',
            date: '2023-02-06',
            severity: '7.8 Magnitude',
            casualties: 50000,
            response: {
                teams: 20,
                volunteers: 280,
                progress: 65
            }
        },
        {
            location: [30.4, 69.3],
            type: 'flood',
            name: 'Pakistan Floods',
            date: '2022-08-01',
            severity: 'Extreme',
            affected: '33 Million',
            response: {
                teams: 28,
                volunteers: 390,
                progress: 82
            }
        }
    ];

    // Create responsive marker icons
    function createMarkerIcon(type) {
        const colors = {
            earthquake: '#ef4444',
            flood: '#3b82f6',
            wildfire: '#f59e0b',
            hurricane: '#8b5cf6'
        };

        return L.divIcon({
            className: `disaster-marker ${type}-marker`,
            html: `
              <svg viewBox="0 0 24 24" width="24" height="24">
                <path fill="${colors[type] || '#64748b'}" d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
              </svg>
            `,
            iconSize: [30, 30],
            iconAnchor: [15, 30],
            popupAnchor: [0, -30]
        });
    }

    // Create tooltip element
    const tooltip = document.createElement('div');
    tooltip.id = 'mapTooltip';
    tooltip.className = 'map-tooltip';
    document.getElementById('disasterMapContainer').appendChild(tooltip);

    // Handle responsive positioning
    function positionTooltip(markerPoint, tooltipElement) {
        const mapContainer = document.getElementById('disasterMapContainer');
        const mapRect = mapContainer.getBoundingClientRect();
        const margin = 15;

        // Default position (right side)
        let left = markerPoint.x + margin;
        let top = markerPoint.y - tooltipElement.offsetHeight / 2;
        let placementClass = 'tooltip-right';

        // Check if tooltip would go offscreen right
        if (left + tooltipElement.offsetWidth > mapRect.width) {
            left = markerPoint.x - margin - tooltipElement.offsetWidth;
            placementClass = 'tooltip-left';
        }

        // Check if tooltip would go offscreen bottom
        if (top + tooltipElement.offsetHeight > mapRect.height) {
            top = markerPoint.y - tooltipElement.offsetHeight - margin;
            placementClass = 'tooltip-top';
        }

        // Check if tooltip would go offscreen top
        if (top < 0) {
            top = markerPoint.y + margin;
            placementClass = 'tooltip-bottom';
        }

        // Apply positioning
        tooltipElement.style.left = `${left}px`;
        tooltipElement.style.top = `${top}px`;
        tooltipElement.className = `map-tooltip ${placementClass}`;
    }

    // Add markers with responsive hover effects
    disasters.forEach(disaster => {
        const marker = L.marker(disaster.location, {
            icon: createMarkerIcon(disaster.type),
            riseOnHover: true,
            riseOffset: 250 // Pixels marker rises on hover
        }).addTo(map);

        // Create tooltip content
        const tooltipContent = `
            <div class="tooltip-content">
              <h4>${disaster.name}</h4>
              <p><strong>Type:</strong> ${disaster.type.charAt(0).toUpperCase() + disaster.type.slice(1)}</p>
              <p><strong>Date:</strong> ${disaster.date}</p>
              <p><strong>Severity:</strong> ${disaster.severity}</p>
              ${disaster.casualties ? `<p><strong>Casualties:</strong> ${disaster.casualties.toLocaleString()}</p>` : ''}
              ${disaster.affected ? `<p><strong>Affected:</strong> ${disaster.affected}</p>` : ''}
              <p><strong>Response Teams:</strong> ${disaster.response.teams}</p>
              <p><strong>Volunteers:</strong> ${disaster.response.volunteers}</p>
            </div>
          `;

        // Mouse events
        marker.on('mouseover', function (e) {
            tooltip.innerHTML = tooltipContent;
            const markerPoint = map.latLngToContainerPoint(e.latlng);
            positionTooltip(markerPoint, tooltip);
            tooltip.style.opacity = '1';
            tooltip.style.zIndex = '1000';
        });

        marker.on('mouseout', function () {
            tooltip.style.opacity = '0';
            tooltip.style.zIndex = '-1';
        });

        // Handle map movement
        marker.on('move', function (e) {
            if (tooltip.style.opacity === '1') {
                const markerPoint = map.latLngToContainerPoint(e.latlng);
                positionTooltip(markerPoint, tooltip);
            }
        });
    });

    // Handle window resize
    window.addEventListener('resize', function () {
        map.invalidateSize(); // Fixes map display on resize
    });
});

document.addEventListener('DOMContentLoaded', function() {
    const animateElements = document.querySelectorAll('.animate');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = 1;
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, { threshold: 0.1 });
    
    animateElements.forEach(el => {
        el.style.opacity = 0;
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
    
    // Form submission
    const contactForm = document.querySelector('.contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            alert('Thank you for your message! Our team will respond shortly.');
            this.reset();
        });
    }
    
});