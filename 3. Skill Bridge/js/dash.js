const roleSkills = {
    java: ["java", "sql", "spring", "git"],
    frontend: ["html", "css", "javascript", "react", "git"],
    fullstack: ["java", "sql", "spring", "html", "css", "javascript", "git"]
};

function analyzeSkills() {

    const input = document.getElementById("skillsInput").value.toLowerCase();
    const selectedRole = document.getElementById("roleSelect").value;

    const userSkills = input.split(",").map(skill => skill.trim());
    const requiredSkills = roleSkills[selectedRole];

    const matched = [];
    const missing = [];

    requiredSkills.forEach(skill => {
        if (userSkills.includes(skill)) {
            matched.push(skill);
        } else {
            missing.push(skill);
        }
    });

    const matchPercentage = Math.round((matched.length / requiredSkills.length) * 100);

    updateUI(matched, missing, matchPercentage);
}

function updateUI(matched, missing, percentage) {

    const matchedList = document.getElementById("matchedSkills");
    const missingList = document.getElementById("missingSkills");
    const recommendationsList = document.getElementById("recommendationsList");
    const progressFill = document.getElementById("progressFill");

    matchedList.innerHTML = "";
    missingList.innerHTML = "";
    recommendationsList.innerHTML = "";

    matched.forEach(skill => {
        matchedList.innerHTML += `
<li>
    <span class="icon success">✔</span>
    ${skill.toUpperCase()}
</li>`;

    });

    missing.forEach(skill => {
        missingList.innerHTML += `
<li>
    <span class="icon error">✖</span>
    ${skill.toUpperCase()}
</li>`;
        recommendationsList.innerHTML += `<li>Learn ${skill.toUpperCase()}</li>`;
    });

    progressFill.style.width = percentage + "%";
    progressFill.textContent = percentage + "%";
}
