// ==========================================
// SkillGap Analyzer 
// ==========================================

document.addEventListener("DOMContentLoaded", function () {

    // =====================================================
    // GLOBAL UTILITIES
    // =====================================================

    function exists(selector) {
        return document.querySelector(selector) !== null;
    }

    function safeQuery(selector) {
        return document.querySelector(selector);
    }


    // =====================================================
    // NAVIGATION MENU (Landing Page)
    // =====================================================

    if (exists("#navMenu")) {
        window.toggleMenu = function () {
            safeQuery("#navMenu").classList.toggle("active");
        };
    }


    // =====================================================
    // MODALS (Landing Page)
    // =====================================================

    if (exists("#loginModal") || exists("#signupModal")) {

        window.showLoginModal = function () {
            safeQuery("#loginModal").style.display = "flex";
        };

        window.showSignupModal = function () {
            safeQuery("#signupModal").style.display = "flex";
        };

        window.closeModal = function (modalId) {
            safeQuery("#" + modalId).style.display = "none";
        };

        window.switchModal = function () {
            const login = safeQuery("#loginModal");
            const signup = safeQuery("#signupModal");

            if (login.style.display === "flex") {
                login.style.display = "none";
                signup.style.display = "flex";
            } else {
                signup.style.display = "none";
                login.style.display = "flex";
            }
        };

        window.addEventListener("click", function (e) {
            const login = safeQuery("#loginModal");
            const signup = safeQuery("#signupModal");

            if (e.target === login) login.style.display = "none";
            if (e.target === signup) signup.style.display = "none";
        });
    }


    // =====================================================
    // AUTH HANDLING (Demo Mode)
    // =====================================================

    if (exists("#loginEmail")) {

        window.handleLogin = function (event) {
            event.preventDefault();

            const email = safeQuery("#loginEmail").value;
            const password = safeQuery("#loginPassword").value;

            if (email && password) {
                localStorage.setItem("user", JSON.stringify({
                    firstName: "Ashish",
                    email: email
                }));

                alert("Login successful");
                window.location.href = "dashboard.html";
            }
        };
    }

    if (exists("#signupEmail")) {

        window.handleSignup = function (event) {
            event.preventDefault();

            const firstName = safeQuery("#firstName").value;
            const email = safeQuery("#signupEmail").value;

            localStorage.setItem("user", JSON.stringify({
                firstName: firstName,
                email: email
            }));

            alert("Account created successfully");
            window.location.href = "dashboard.html";
        };
    }


    // =====================================================
    // HERO BUTTONS
    // =====================================================

    if (exists("#home")) {
        window.startAssessment = function () {
            window.location.href = "dash.html";
        };

        window.watchDemo = function () {
            alert("Demo video coming soon!");
        };
    }


    // =====================================================
    // SMOOTH SCROLL (Landing Page)
    // =====================================================

    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener("click", function (e) {
            const target = document.querySelector(this.getAttribute("href"));
            if (target) {
                e.preventDefault();
                target.scrollIntoView({ behavior: "smooth" });
            }
        });
    });


    // =====================================================
    // HERO MINI CHART (Landing Page)
    // =====================================================

    if (exists("#heroChart")) {
        const canvas = safeQuery("#heroChart");
        const ctx = canvas.getContext("2d");

        const values = [65, 75, 50, 85, 60,70];
        const barWidth = 40;
        const gap = 30;
        const baseY = 180;

        values.forEach((value, index) => {
            const x = index * (barWidth + gap) + 30;
            ctx.fillStyle = "#667eea";
            ctx.fillRect(x, baseY - value, barWidth, value);
        });
    }


    // =====================================================
    // DASHBOARD LOGIC
    // =====================================================

    if (exists("#skillProgressChart") && typeof Chart !== "undefined") {

        new Chart(safeQuery("#skillProgressChart"), {
            type: "line",
            data: {
                labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
                datasets: [{
                    label: "Skill Progress %",
                    data: [45, 55, 60, 70, 75, 78],
                    borderColor: "#667eea",
                    backgroundColor: "rgba(102,126,234,0.2)",
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: { beginAtZero: true, max: 100 }
                }
            }
        });
    }


    if (exists("#gapAnalysisChart") && typeof Chart !== "undefined") {

        new Chart(safeQuery("#gapAnalysisChart"), {
            type: "doughnut",
            data: {
                labels: ["Programming", "Data Science", "ML", "Soft Skills"],
                datasets: [{
                    data: [30, 25, 20, 25],
                    backgroundColor: [
                        "#667eea",
                        "#f093fb",
                        "#4facfe",
                        "#43e97b"
                    ]
                }]
            },
            options: {
                responsive: true
            }
        });
    }


    // =====================================================
    // DASHBOARD DROPDOWN
    // =====================================================

    if (exists(".user-dropdown")) {
        const dropdown = safeQuery(".dropdown-menu");

        safeQuery(".user-dropdown").addEventListener("click", function (e) {
            e.stopPropagation();
            dropdown.classList.toggle("show");
        });

        document.addEventListener("click", function () {
            dropdown.classList.remove("show");
        });
    }

    // =====================================================
    // LOGOUT
    // =====================================================

    const logoutLink = document.querySelector(".fa-sign-out-alt")?.closest("a");

    if (logoutLink) {
        logoutLink.addEventListener("click", function (e) {
            e.preventDefault();
            localStorage.removeItem("user");
            window.location.href = "index.html";
        });
    }


    // =====================================================
    // LOAD USER INTO DASHBOARD
    // =====================================================

const savedUser = JSON.parse(localStorage.getItem("user"));

if (savedUser && exists(".dashboard-header h1")) {
    safeQuery(".dashboard-header h1").textContent =
            `Welcome back, ${savedUser.firstName}!`;

    safeQuery(".nav-user span").textContent =
            savedUser.firstName;
}

});


