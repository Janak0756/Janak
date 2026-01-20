// User data
let currentUser = null;
let currentRole = 'student';
let joinedClubs = [];
let skillContext = 'student'; // or 'faculty'

// DOM Elements
const loginBtn = document.getElementById('submitLogin');
const logoutBtn = document.getElementById('logoutBtn');
const roleBtns = document.querySelectorAll('.role-btn');
const navLinks = document.querySelectorAll('.nav-link');
const pages = document.querySelectorAll('.page');
const mainHeader = document.getElementById('main-header');
const mainFooter = document.getElementById('main-footer');

// Demo accounts
const demoAccounts = {
    student: {
        email: 'student@skillconnect.edu',
        password: 'password',
        name: 'Shastri Namita',
        title: 'Computer Science Student'
    },
    faculty: {
        email: 'faculty@skillconnect.edu',
        password: 'password',
        name: 'Ms. Prachi Rajput',
        title: 'Platform Administrator'
    }
};

// Track currently editing skill
let editingSkill = null;

// LinkedIn state management
let linkedinProfiles = {
    student: {
        connected: false,
        profileUrl: null,
        connections: 0,
        followers: 0,
        profileData: null
    },
    faculty: {
        connected: false,
        profileUrl: null,
        connections: 0,
        followers: 0,
        profileData: null
    }
};

// In-memory store for projects
let pc_projects = [];
let pc_requests = [];

// ROLE CONFIGURATION
const ROLE_CONFIG = {
    student: {
        dashboardId: 'student-dashboard',
        nameId: 'studentName',
        titleId: 'studentTitle',
        skillListId: 'studentSkillsList',
        skillCountId: 'studentSkills',
        addSkillBtnId: 'addStudentSkillBtn',
        aiBtnId: 'enhanceSkillBtn',
        modalAddTitle: 'Add New Skill',
        modalAddBtn: 'Add Skill',
        defaultCategory: 'programming'
    },
    faculty: {
        dashboardId: 'faculty-dashboard',
        nameId: 'facultyName',
        titleId: 'facultyTitle',
        skillListId: 'facultyResearchAreas',
        skillCountId: null,
        addSkillBtnId: 'addResearchAreaBtn',
        aiBtnId: 'analyzeResearchBtn',
        modalAddTitle: 'Add Research Area',
        modalAddBtn: 'Add Research Area',
        defaultCategory: 'research'
    }
};

/* =========================================================
   MODAL CREATION FUNCTIONS
========================================================= */
function createSkillModal() {
    const modalHTML = `
        <div class="modal-overlay" id="skillModal" style="display: none;">
            <div class="modal-content">
                <div class="modal-header">
                    <h3 id="modalTitle">Add New Skill</h3>
                    <button class="modal-close" id="closeSkillModal">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="form-group">
                        <label for="skillName">Skill Name</label>
                        <input type="text" class="form-control" id="skillName" placeholder="Enter skill name">
                    </div>
                    <div class="form-group">
                        <label for="skillLevel">Proficiency Level</label>
                        <select class="form-control" id="skillLevel">
                            <option value="beginner">Beginner</option>
                            <option value="intermediate">Intermediate</option>
                            <option value="advanced">Advanced</option>
                            <option value="expert">Expert</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="skillCategory">Category</label>
                        <select class="form-control" id="skillCategory">
                            <option value="programming">Programming</option>
                            <option value="design">Design</option>
                            <option value="data">Data Science</option>
                            <option value="soft-skills">Soft Skills</option>
                            <option value="other">Other</option>
                        </select>
                    </div>
                    <div class="skills-preview">
                        <h4>Preview:</h4>
                        <div class="preview-skill-tag">
                            <span id="previewSkillName">Skill Name</span>
                            <span class="skill-level-badge" id="previewSkillLevel">Beginner</span>
                        </div>
                    </div>
                    <div class="delete-section" id="deleteSection" style="display: none;">
                        <hr>
                        <button class="btn btn-danger" id="deleteSkillBtn" style="width: 100%;">
                            <i class="fas fa-trash"></i> Delete Skill
                        </button>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-outline" id="cancelSkillBtn">Cancel</button>
                    <button class="btn btn-primary" id="saveSkillBtn">Add Skill</button>
                </div>
            </div>
        </div>
    `;

    if (!document.getElementById('skillModal')) {
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        document.getElementById('closeSkillModal').addEventListener('click', closeSkillModal);
        document.getElementById('cancelSkillBtn').addEventListener('click', closeSkillModal);
        document.getElementById('saveSkillBtn').addEventListener('click', saveSkill);
        document.getElementById('deleteSkillBtn').addEventListener('click', deleteSkill);
        document.getElementById('skillName').addEventListener('input', updateSkillPreview);
        document.getElementById('skillLevel').addEventListener('change', updateSkillPreview);
    }
}

function createEnhanceModal() {
    const modalHTML = `
        <div class="modal-overlay" id="enhanceModal" style="display: none;">
            <div class="modal-content">
                <div class="modal-header">
                    <h3>AI Skill Enhancement Suggestions</h3>
                    <button class="modal-close" id="closeEnhanceModal">&times;</button>
                </div>
                <div class="modal-body" id="enhanceContent">
                    <p style="color: var(--gray);">Analyzing your skills...</p>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-outline" id="closeEnhanceBtn">Close</button>
                </div>
            </div>
        </div>
    `;
    
    if (!document.getElementById('enhanceModal')) {
        document.body.insertAdjacentHTML("beforeend", modalHTML);
        document.getElementById("closeEnhanceModal").addEventListener("click", closeEnhanceModal);
        document.getElementById("closeEnhanceBtn").addEventListener("click", closeEnhanceModal);
    }
}

/* =========================================================
   SKILL MODAL FUNCTIONS
========================================================= */
function closeSkillModal() {
    const skillModal = document.getElementById('skillModal');
    if (skillModal) skillModal.style.display = 'none';
    editingSkill = null;
}

function updateSkillPreview() {
    const skillName = document.getElementById('skillName').value || 'Skill Name';
    const skillLevel = document.getElementById('skillLevel').value;
    document.getElementById('previewSkillName').textContent = skillName;
    document.getElementById('previewSkillLevel').textContent =
        skillLevel.charAt(0).toUpperCase() + skillLevel.slice(1);
}

function openEditSkillModal(skillElement) {
    editingSkill = skillElement;
    document.getElementById('modalTitle').textContent = 'Edit Skill';
    document.getElementById('saveSkillBtn').textContent = 'Update Skill';
    document.getElementById('deleteSection').style.display = 'block';

    const name = skillElement.childNodes[0].textContent.trim();
    const level = skillElement.querySelector('.skill-level-badge').textContent.toLowerCase();
    const category = skillElement.getAttribute('data-category');

    document.getElementById('skillName').value = name;
    document.getElementById('skillLevel').value = level;
    document.getElementById('skillCategory').value = category;

    updateSkillPreview();
    document.getElementById('skillModal').style.display = 'flex';
}

function openSkillModal() {
    const cfg = ROLE_CONFIG[currentRole];
    const modalTitle = document.getElementById('modalTitle');
    const saveSkillBtn = document.getElementById('saveSkillBtn');
    const deleteSection = document.getElementById('deleteSection');
    const skillName = document.getElementById('skillName');
    const skillLevel = document.getElementById('skillLevel');
    const skillCategory = document.getElementById('skillCategory');
    const skillModal = document.getElementById('skillModal');

    if (!skillModal) {
        createSkillModal();
        setTimeout(() => openSkillModal(), 100);
        return;
    }

    editingSkill = null;
    modalTitle.textContent = cfg.modalAddTitle;
    saveSkillBtn.textContent = cfg.modalAddBtn;
    deleteSection.style.display = 'none';
    skillName.value = '';
    skillLevel.value = 'intermediate';
    skillCategory.value = cfg.defaultCategory;

    updateSkillPreview();
    skillModal.style.display = 'flex';
}

function saveSkill() {
    const cfg = ROLE_CONFIG[currentRole];
    const skillName = document.getElementById('skillName');
    const skillLevel = document.getElementById('skillLevel');
    const skillCategory = document.getElementById('skillCategory');

    const name = skillName.value.trim();
    const level = skillLevel.value;
    const category = skillCategory.value;

    if (!name) return alert('Enter a skill name');

    if (editingSkill) {
        editingSkill.innerHTML = `
            ${name}
            <span class="skill-level-badge">${level.charAt(0).toUpperCase() + level.slice(1)}</span>
        `;
        editingSkill.dataset.level = level;
        editingSkill.dataset.category = category;
        showNotification('Skill updated!', 'success');
    } else {
        const skill = document.createElement('span');
        skill.className = 'skill-tag';
        skill.dataset.level = level;
        skill.dataset.category = category;
        skill.innerHTML = `
            ${name}
            <span class="skill-level-badge">${level.charAt(0).toUpperCase() + level.slice(1)}</span>
        `;

        document.getElementById(cfg.skillListId).appendChild(skill);

        if (cfg.skillCountId) {
            const count = document.getElementById(cfg.skillCountId);
            count.textContent = parseInt(count.textContent) + 1;
        }

        showNotification('Skill added!', 'success');
    }

    closeSkillModal();
    initializeSkills();
}

function deleteSkill() {
    if (!editingSkill) return;
    if (confirm('Delete this skill?')) {
        editingSkill.remove();
        const count = document.getElementById('studentSkills');
        if (count) {
            count.textContent = parseInt(count.textContent) - 1;
        }
        showNotification('Skill deleted!', 'success');
        closeSkillModal();
    }
}

function initializeExistingSkills() {
    const lists = [
        document.getElementById('studentSkillsList'),
        document.getElementById('facultyResearchAreas')
    ];

    lists.forEach(list => {
        if (!list) return;
        list.querySelectorAll('.skill-tag').forEach(skill => {
            if (!skill.hasAttribute('data-edit-init')) {
                skill.setAttribute('data-edit-init', 'true');
                skill.addEventListener('click', (e) => {
                    e.stopPropagation();
                    openEditSkillModal(skill);
                });
            }
        });
    });
}

function initializeSkills() {
    const cfg = ROLE_CONFIG[currentRole];
    const list = document.getElementById(cfg.skillListId);
    if (!list) return;

    list.querySelectorAll('.skill-tag').forEach(skill => {
        if (!skill.dataset.bound) {
            skill.dataset.bound = "true";
            skill.addEventListener('click', e => {
                e.stopPropagation();
                openEditSkillModal(skill);
            });
        }
    });
}

/* =========================================================
   NOTIFICATION SYSTEM
========================================================= */
function showNotification(msg, type = 'info') {
    const box = document.createElement('div');
    box.className = `notification ${type}`;
    box.textContent = msg;
    document.body.appendChild(box);

    setTimeout(() => box.classList.add('show'), 30);
    setTimeout(() => {
        box.classList.remove('show');
        setTimeout(() => box.remove(), 250);
    }, 2600);
}

/* =========================================================
   NETWORK PAGE FUNCTIONS
========================================================= */
function initializeNetworkFilters() {
    const departmentFilter = document.getElementById('departmentFilter');
    const skillsFilter = document.getElementById('skillsFilter');
    const roleFilter = document.getElementById('roleFilter');
    const yearFilter = document.getElementById('yearFilter');
    const applyFiltersBtn = document.getElementById('applyFiltersBtn');
    const resetFiltersBtn = document.getElementById('resetFiltersBtn');
    const profileCards = document.querySelectorAll('#network-page .profile-card');

    let activeFilters = {
        department: "",
 
        skills: "",
        role: "",
        year: ""
    };

    function applyFilters() {
        const dep = departmentFilter.value.toLowerCase();
        const skillsVal = skillsFilter.value.toLowerCase();
        const roleVal = roleFilter.value;
        const yearVal = yearFilter.value;

        activeFilters = {
            department: dep,
            skills: skillsVal,
            role: roleVal,
            year: yearVal
        };

        let count = 0;
        profileCards.forEach(card => {
            let show = true;
            const cardDept = card.getAttribute('data-department');
            const cardRole = card.getAttribute('data-role');
            const cardYear = card.getAttribute('data-year');
            const cardSkills = card.getAttribute('data-skills');

            if (dep && cardDept !== dep) show = false;
            if (skillsVal && !cardSkills.includes(skillsVal)) show = false;
            if (roleVal && cardRole !== roleVal) show = false;
            if (yearVal && cardYear !== yearVal) show = false;

            card.style.display = show ? 'block' : 'none';
            if (show) count++;
        });

        document.getElementById('resultsCount').textContent =
            `${count} profile${count !== 1 ? 's' : ''}`;
    }

    resetFiltersBtn.addEventListener('click', () => {
        departmentFilter.value = "";
        skillsFilter.value = "";
        roleFilter.value = "";
        yearFilter.value = "";
        applyFilters();
    });

    applyFiltersBtn.addEventListener('click', applyFilters);
    applyFilters();
}

function initializeConnectButtons() {
    const buttons = document.querySelectorAll('#network-page .btn-primary');
    buttons.forEach(button => {
        if (!button.hasAttribute('data-init')) {
            button.setAttribute('data-init', 'true');
            button.addEventListener('click', function () {
                const profileCard = this.closest('.profile-card');
                const name = profileCard.querySelector('.profile-name').textContent;
                this.innerHTML = '<i class="fas fa-check"></i> Request Sent';
                this.classList.remove('btn-primary');
                this.classList.add('btn-outline');
                this.disabled = true;
                showNotification(`Connection request sent to ${name}`, 'success');
            });
        }
    });
}

function initializeMentorshipButtons() {
    const mentorBtns = document.querySelectorAll('.mentorship-list .btn');
    mentorBtns.forEach(btn => {
        if (!btn.hasAttribute('data-init')) {
            btn.setAttribute('data-init', 'true');
            btn.addEventListener('click', function () {
                const name = this.closest('.mentor-item')
                    .querySelector('.post-user').textContent;
                this.innerHTML = '<i class="fas fa-check"></i> Requested';
                this.classList.remove('btn-outline');
                this.classList.add('btn-primary');
                this.disabled = true;
                showNotification(`Request sent to ${name}`, 'success');
            });
        }
    });

    const groupBtns = document.querySelectorAll('.groups-list .btn');
    groupBtns.forEach(btn => {
        if (!btn.hasAttribute('data-init')) {
            btn.setAttribute('data-init', 'true');
            btn.addEventListener('click', function () {
                const name = this.closest('.group-item')
                    .querySelector('.post-user').textContent;
                this.innerHTML = '<i class="fas fa-check"></i> Joined';
                this.classList.remove('btn-outline');
                this.classList.add('btn-primary');
                this.disabled = true;
                showNotification(`Joined ${name}`, 'success');
            });
        }
    });
}

function initializeNetworkPage() {
    initializeNetworkFilters();
    initializeConnectButtons();
    initializeMentorshipButtons();
}

/* =========================================================
   CLUBS PAGE FUNCTIONS
========================================================= */
function initializeJoinClubButtons() {
    const buttons = document.querySelectorAll('#allClubsList .btn-outline');
    buttons.forEach(btn => {
        if (!btn.hasAttribute("data-joined-init")) {
            btn.setAttribute("data-joined-init", "true");
            btn.addEventListener('click', function () {
                const clubName = this.closest('.club-card-custom')
                    .querySelector('strong').textContent;
                if (!joinedClubs.includes(clubName)) {
                    joinedClubs.push(clubName);
                    updateMyClubsUI();
                    showNotification(`Joined ${clubName}`, 'success');
                }
                this.textContent = "Joined ✔";
                this.classList.remove("btn-outline");
                this.classList.add("btn-primary");
                this.disabled = true;
            });
        }
    });
}

function updateMyClubsUI() {
    const myClubsList = document.getElementById("myClubsList");
    const dashboardClubs = document.getElementById("studentClubs");

    if (myClubsList) myClubsList.innerHTML = "";
    if (dashboardClubs) dashboardClubs.innerHTML = "";

    if (joinedClubs.length === 0) {
        if (myClubsList) myClubsList.innerHTML =
            `<div style="color: var(--gray); padding: 10px 0;">You haven't joined any clubs yet.</div>`;
        if (dashboardClubs) dashboardClubs.innerHTML =
            `<div class="event-card">
                <div class="event-date">
                    <div class="event-day">--</div>
                </div>
                <div class="event-details">
                    <div class="event-title">No Clubs Joined</div>
                </div>
            </div>`;
        return;
    }

    joinedClubs.forEach(club => {
        if (myClubsList) {
            myClubsList.innerHTML += `
                <div class="club-card-custom">
                    <strong>${club}</strong>
                    <p style="color: var(--gray); font-size: 0.9rem;">Member</p>
                    <button class="btn btn-outline leave-btn" 
                            style="margin-top: 8px;" 
                            data-club="${club}">
                        Leave Club
                    </button>
                </div>
            `;
        }

        if (dashboardClubs) {
            dashboardClubs.innerHTML += `
                <div class="event-card">
                    <div class="event-date">
                        <div class="event-day">${club.substring(0, 2).toUpperCase()}</div>
                    </div>
                    <div class="event-details">
                        <div class="event-title">${club}</div>
                        <div class="event-time">Member</div>
                    </div>
                </div>
            `;
        }
    });

    initializeLeaveButtons();
    updateAllClubsButtons();
}

function initializeLeaveButtons() {
    const leaveButtons = document.querySelectorAll(".leave-btn");
    leaveButtons.forEach(btn => {
        if (!btn.hasAttribute('data-leave-init')) {
            btn.setAttribute('data-leave-init', 'true');
            btn.addEventListener("click", function () {
                const clubName = this.getAttribute("data-club");
                joinedClubs = joinedClubs.filter(c => c !== clubName);
                showNotification(`Left ${clubName}`, "error");
                updateMyClubsUI();
                updateAllClubsButtons();
            });
        }
    });
}

function updateAllClubsButtons() {
    const clubCards = document.querySelectorAll("#allClubsList .club-card-custom");
    clubCards.forEach(card => {
        const clubName = card.querySelector("strong").textContent;
        const btn = card.querySelector(".btn");
        if (joinedClubs.includes(clubName)) {
            btn.textContent = "Joined ✔";
            btn.classList.remove("btn-outline");
            btn.classList.add("btn-primary");
            btn.disabled = true;
        } else {
            btn.textContent = "Join Club";
            btn.classList.add("btn-outline");
            btn.classList.remove("btn-primary");
            btn.disabled = false;
        }
    });
}

/* =========================================================
   PROJECT COLLABORATION FUNCTIONS - UPDATED WITH INLINE FORM
========================================================= */
function pc_initializeDemoContent() {
    if (pc_projects.length) return;
    
    pc_projects = [
        {
            id: "demo_1",
            owner: "Jasmeet Khanwani",
            title: "Smart Timetable Optimizer",
            description: "Optimize student timetables using ML and constraints.",
            github: "https://github.com/jasmeet/timetable-optimizer",
            skills: ["Python", "Machine Learning", "OR-Tools"],
            roles: "ML Engineer, Backend Developer",
            team: ["Rohan Verma"],
            timeCommitment: "medium"
        },
        {
            id: "demo_2",
            owner: "Aditi Dube",
            title: "Campus Events Portal",
            description: "Events listing & registration platform for university events.",
            github: "https://github.com/aditi/campus-events",
            skills: ["React", "Node.js", "MongoDB"],
            roles: "Frontend Developer, Backend Developer",
            team: ["Namita Shastri"],
            timeCommitment: "high"
        },
        {
            id: "demo_3",
            owner: "Yug Patel",
            title: "AI-Powered Study Assistant",
            description: "Chatbot that helps students with course material using NLP.",
            github: "https://github.com/yug/study-assistant",
            skills: ["Python", "NLP", "FastAPI"],
            roles: "AI Engineer, Full Stack Developer",
            team: [],
            timeCommitment: "medium"
        },
        {
            id: "demo_4",
            owner: "Siddhesh Mohite",
            title: "Smart Attendance System",
            description: "Facial recognition based attendance system for classrooms.",
            github: "https://github.com/siddhesh/attendance-system",
            skills: ["Python", "OpenCV", "React Native"],
            roles: "Computer Vision Engineer, Mobile Developer",
            team: ["Daksh Patel"],
            timeCommitment: "high"
        }
    ];
    
    pc_requests = [
        {
            id: "demo_req_1",
            projectId: "demo_2",
            applicantName: "Namita Shastri",
            github: "https://github.com/namita/react-projects",
            comment: "I have 2 years of React experience and would love to contribute to the frontend.",
            skills: ["React", "JavaScript", "CSS", "UI/UX"]
        },
        {
            id: "demo_req_2",
            projectId: "demo_3",
            applicantName: "Janak Parmar",
            github: "https://github.com/janak/python-ml",
            comment: "I've worked on similar NLP projects before and can help with model training.",
            skills: ["Python", "TensorFlow", "NLP", "ML"]
        }
    ];
}

function pc_addTestRequests() {
    const myName = currentUser ? currentUser.name : "You";
    
    // Add a test project owned by current user
    const testProj = {
        id: "proj_test_" + Date.now(),
        owner: myName,
        title: "AI Chatbot for College FAQs",
        description: "AI chatbot to answer college FAQs using natural language processing.",
        github: "https://github.com/college/chatbot",
        skills: ["Python", "NLP", "FastAPI", "React"],
        roles: "ML Engineer, Frontend Developer",
        team: [],
        timeCommitment: "medium"
    };
    
    if (!pc_projects.find(p => p.owner === myName)) {
        pc_projects.unshift(testProj);
    }
    
    // Add test requests to user's project
    const userProject = pc_projects.find(p => p.owner === myName);
    if (userProject) {
        const r1 = {
            id: "req_test_01_" + Date.now(),
            projectId: userProject.id,
            applicantName: "Saksham Dubey",
            github: "https://github.com/saksham/ai-projects",
            comment: "I have ML experience and want to contribute to the NLP part.",
            skills: ["Python", "TensorFlow", "NLP"]
        };
        
        const r2 = {
            id: "req_test_02_" + Date.now(),
            projectId: userProject.id,
            applicantName: "Garvi Shah",
            github: "https://github.com/garvi/react-dashboard",
            comment: "I can help with frontend UI and design system.",
            skills: ["React", "UI/UX", "JavaScript"]
        };
        
        if (!pc_requests.find(r => r.applicantName === "Saksham Dubey")) pc_requests.push(r1);
        if (!pc_requests.find(r => r.applicantName === "Garvi Shah")) pc_requests.push(r2);
    }
}

function pc_renderProjectFeed() {
    const container = document.getElementById('projectFeedList');
    if (!container) return;
    
    container.innerHTML = "";
    const myName = currentUser ? currentUser.name : "You";
    
    const others = pc_projects.filter(p => p.owner !== myName);
    
    if (others.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; padding: 60px 20px; color: var(--gray);">
                <i class="fas fa-project-diagram" style="font-size: 3rem; margin-bottom: 15px; opacity: 0.3;"></i>
                <h4 style="margin-bottom: 10px; color: var(--dark);">No projects available</h4>
                <p>Be the first to post a project and start collaborating!</p>
                <button class="btn btn-primary" style="margin-top: 20px;" onclick="document.getElementById('pc_projTitle').focus()">
                    <i class="fas fa-plus"></i> Create First Project
                </button>
            </div>
        `;
        return;
    }
    
    others.forEach(p => {
        const skills = p.skills.map(skill => 
            `<span class="skill-tag-small">${skill}</span>`
        ).join("");
        
        const timeCommitment = p.timeCommitment || 'medium';
        const commitmentText = {
            'low': '1-5 hrs/week',
            'medium': '5-10 hrs/week',
            'high': '10+ hrs/week'
        }[timeCommitment];
        
        container.innerHTML += `
            <div class="project-card-custom" data-project-id="${p.id}">
                <div class="project-owner">
                    <div class="avatar">${p.owner.charAt(0)}</div>
                    <div class="owner-info">
                        <div class="owner-name">${p.owner}</div>
                        <div class="owner-role">Project Owner</div>
                    </div>
                    <button class="btn btn-primary pc-apply-btn" 
                            data-project-id="${p.id}"
                            onclick="showApplyForm('${p.id}', '${p.title.replace(/'/g, "\\'")}')"
                            ${p.team.includes(currentUser?.name) ? 'disabled' : ''}>
                        ${p.team.includes(currentUser?.name) ? 'Already Applied ✓' : 'Apply to Join'}
                    </button>
                </div>
                
                <h4>${p.title}</h4>
                
                <div class="project-desc">${p.description}</div>
                
                <div class="project-meta-info">
                    <span><i class="fas fa-users"></i> ${p.team.length} team member(s)</span>
                    <span><i class="fas fa-clock"></i> ${commitmentText}</span>
                    <span><i class="fas fa-tasks"></i> ${p.roles.split(',').length} roles needed</span>
                </div>
                
                <div class="skills-container">
                    <div class="skills-label">Required Skills:</div>
                    <div style="display: flex; flex-wrap: wrap; gap: 8px; margin-top: 5px;">
                        ${skills}
                    </div>
                </div>
                
                <div class="roles-container" style="margin-top: 10px;">
                    <div style="font-weight: 600; color: var(--dark); font-size: 0.9rem; margin-bottom: 5px;">
                        Roles Needed:
                    </div>
                    <div style="color: var(--gray); font-size: 0.85rem;">
                        ${p.roles}
                    </div>
                </div>
                
                ${p.github ? `
                    <div style="margin-top: 15px;">
                        <a href="${p.github}" target="_blank" class="btn btn-outline btn-small">
                            <i class="fab fa-github"></i> View Repository
                        </a>
                    </div>
                ` : ''}
            </div>
        `;
    });
}

function pc_renderIncomingRequests() {
    const container = document.getElementById('incomingRequestsList');
    if (!container) return;
    
    container.innerHTML = "";
    
    const myName = currentUser ? currentUser.name : "You";
    
    const mine = pc_requests.filter(r => {
        const proj = pc_projects.find(p => p.id === r.projectId);
        return proj && proj.owner === myName;
    });
    
    if (mine.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; padding: 40px 20px; color: var(--gray);">
                <i class="fas fa-user-plus" style="font-size: 2.5rem; margin-bottom: 15px; opacity: 0.3;"></i>
                <h4 style="margin-bottom: 10px;">No requests yet</h4>
                <p>When people apply to join your projects, they'll appear here.</p>
            </div>
        `;
        return;
    }
    
    mine.forEach(r => {
        const proj = pc_projects.find(p => p.id === r.projectId);
        const skills = r.skills.map(s => `<span class="skill-tag-small">${s}</span>`).join("");
        
        container.innerHTML += `
            <div class="request-card" data-request-id="${r.id}">
                <div class="req-top">
                    <div>
                        <div class="req-name">${r.applicantName}</div>
                        <div class="req-project">applied for <strong>${proj.title}</strong></div>
                    </div>
                    
                    <button class="btn btn-outline btn-small pc-analyse-btn" data-request-id="${r.id}">
                        <i class="fas fa-chart-bar"></i> Analyse
                    </button>
                </div>
                
                <div class="req-comment">
                    <i class="fas fa-comment-dots"></i> ${r.comment || "No additional comment provided"}
                </div>
                
                <div class="req-skills-text">
                    <strong>Skills:</strong>
                    <div style="display: flex; flex-wrap: wrap; gap: 5px; margin-top: 5px;">
                        ${skills}
                    </div>
                </div>
                
                ${r.github ? `
                    <a href="${r.github}" target="_blank" class="btn btn-outline btn-small req-github-btn">
                        <i class="fab fa-github"></i> View GitHub Profile
                    </a>
                ` : ''}
                
                <div class="req-actions">
                    <button class="btn btn-primary btn-small pc-accept-btn" data-request-id="${r.id}">
                        <i class="fas fa-check"></i> Accept
                    </button>
                    <button class="btn btn-danger btn-small pc-decline-btn" data-request-id="${r.id}">
                        <i class="fas fa-times"></i> Decline
                    </button>
                </div>
            </div>
        `;
    });
}

function pc_renderMyProjects() {
    const container = document.getElementById('myProjectsList');
    if (!container) return;
    
    container.innerHTML = "";
    const myName = currentUser ? currentUser.name : "You";
    
    const mine = pc_projects.filter(p => p.owner === myName);
    
    if (mine.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; padding: 20px; color: var(--gray); font-style: italic;">
                You haven't created any projects yet. Use the form on the right to get started!
            </div>
        `;
        return;
    }
    
    mine.forEach(p => {
        const skills = p.skills.map(s => `<span class="skill-tag-small">${s}</span>`).join("");
        const team = p.team.map(m => `<span class="skill-tag-small" style="background: rgba(40, 167, 69, 0.1); color: #28a745;">${m}</span>`).join("");
        const timeCommitment = p.timeCommitment || 'medium';
        const commitmentText = {
            'low': '1-5 hrs/week',
            'medium': '5-10 hrs/week',
            'high': '10+ hrs/week'
        }[timeCommitment];
        
        container.innerHTML += `
            <div class="project-card-custom">
                <strong>${p.title}</strong>
                <div style="color: var(--gray); font-size: 0.9rem; margin: 8px 0;">
                    ${p.description}
                </div>
                
                <div style="margin: 10px 0; display: flex; gap: 15px; font-size: 0.85rem; color: var(--gray);">
                    <span><i class="fas fa-clock"></i> ${commitmentText}</span>
                    <span><i class="fas fa-users"></i> ${p.team.length} team members</span>
                </div>
                
                <div style="margin: 10px 0;">
                    <div style="font-weight: 600; font-size: 0.85rem; color: var(--dark); margin-bottom: 5px;">
                        Required Skills:
                    </div>
                    <div style="display: flex; flex-wrap: wrap; gap: 5px;">
                        ${skills}
                    </div>
                </div>
                
                <div style="margin: 10px 0;">
                    <div style="font-weight: 600; font-size: 0.85rem; color: var(--dark); margin-bottom: 5px;">
                        Roles Needed:
                    </div>
                    <div style="color: var(--gray); font-size: 0.85rem;">
                        ${p.roles}
                    </div>
                </div>
                
                ${p.team.length > 0 ? `
                    <div style="margin: 10px 0;">
                        <div style="font-weight: 600; font-size: 0.85rem; color: var(--dark); margin-bottom: 5px;">
                            Team Members (${p.team.length}):
                        </div>
                        <div style="display: flex; flex-wrap: wrap; gap: 5px;">
                            ${team}
                        </div>
                    </div>
                ` : `
                    <div style="color: var(--gray); font-size: 0.85rem; margin: 10px 0;">
                        <i class="fas fa-users"></i> No team members yet
                    </div>
                `}
                
                ${p.github ? `
                    <a href="${p.github}" target="_blank" class="btn btn-outline btn-small" style="margin-top: 10px;">
                        <i class="fab fa-github"></i> GitHub
                    </a>
                ` : ''}
            </div>
        `;
    });
}

function pc_onProjectsPageShow() {
    pc_initializeDemoContent();
    pc_addTestRequests();
    
    pc_renderMyProjects();
    pc_renderProjectFeed();
    pc_renderIncomingRequests();
    
    // Enable scroll only for project feed
    setTimeout(() => {
        const projectFeed = document.getElementById('projectFeedList');
        if (projectFeed) {
            projectFeed.style.overflowY = 'auto';
        }
        
        // Initialize refresh button
        const refreshBtn = document.getElementById('refreshProjectFeedBtn');
        if (refreshBtn) {
            refreshBtn.innerHTML = '<i class="fas fa-sync-alt"></i> Refresh';
            refreshBtn.disabled = false;
        }
    }, 100);
}

/* =========================================================
   INLINE APPLICATION FORM FUNCTIONS
========================================================= */
function showApplyForm(projectId, projectTitle) {
    // Remove any existing forms
    const existingForm = document.querySelector('.apply-form');
    if (existingForm) {
        existingForm.remove();
        // Show the button again for the previous project
        const prevBtn = document.querySelector('.pc-apply-btn[data-form-open="true"]');
        if (prevBtn) {
            prevBtn.style.display = 'inline-flex';
            prevBtn.removeAttribute('data-form-open');
        }
    }
    
    // Find the project card and apply button
    const projectCard = document.querySelector(`.project-card-custom[data-project-id="${projectId}"]`);
    const applyBtn = projectCard.querySelector('.pc-apply-btn');
    
    if (!projectCard || !applyBtn) return;
    
    // Hide the apply button
    applyBtn.style.display = 'none';
    applyBtn.setAttribute('data-form-open', 'true');
    
    // Create the inline form
    const formHtml = `
        <div class="apply-form" data-project-id="${projectId}">
            <div class="apply-form-header">
                <div class="apply-form-title">Apply to Join: ${projectTitle}</div>
                <button class="clear-apply-form" onclick="cancelApplication('${projectId}')">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="form-group">
                <label for="applySkills_${projectId}">Relevant Skills <small style="color: var(--gray);">(comma separated)</small></label>
                <input type="text" id="applySkills_${projectId}" class="form-control" 
                       placeholder="e.g., React, Node.js, UI/UX Design" required>
            </div>
            <div class="form-group">
                <label for="applyExperience_${projectId}">Previous Experience</label>
                <textarea id="applyExperience_${projectId}" class="form-control" rows="3" 
                          placeholder="Briefly describe your relevant experience..." required></textarea>
            </div>
            <div class="form-group">
                <label for="applyRole_${projectId}">Preferred Role</label>
                <input type="text" id="applyRole_${projectId}" class="form-control" 
                       placeholder="e.g., Frontend Developer, Designer" required>
            </div>
            <div class="form-group">
                <label for="applyTime_${projectId}">Hours per Week Available</label>
                <input type="number" id="applyTime_${projectId}" class="form-control" 
                       placeholder="e.g., 10" min="1" max="40" required>
            </div>
            <div class="form-group">
                <label for="applyGithub_${projectId}">GitHub Profile URL <small style="color: var(--gray);">(optional)</small></label>
                <input type="url" id="applyGithub_${projectId}" class="form-control" 
                       placeholder="https://github.com/yourusername">
            </div>
            <div class="form-actions">
                <button type="button" class="btn btn-primary" onclick="submitApplication('${projectId}')">
                    <i class="fas fa-paper-plane"></i> Submit Application
                </button>
                <button type="button" class="btn btn-outline" onclick="cancelApplication('${projectId}')">
                    <i class="fas fa-times"></i> Cancel
                </button>
            </div>
        </div>
    `;
    
    // Insert the form after the project card
    projectCard.insertAdjacentHTML('afterend', formHtml);
    
    // Focus on first input
    setTimeout(() => {
        document.getElementById(`applySkills_${projectId}`)?.focus();
    }, 100);
}

function cancelApplication(projectId) {
    // Remove the form
    const form = document.querySelector(`.apply-form[data-project-id="${projectId}"]`);
    if (form) {
        form.remove();
    }
    
    // Show the apply button again
    const projectCard = document.querySelector(`.project-card-custom[data-project-id="${projectId}"]`);
    const applyBtn = projectCard?.querySelector('.pc-apply-btn[data-form-open="true"]');
    if (applyBtn) {
        applyBtn.style.display = 'inline-flex';
        applyBtn.removeAttribute('data-form-open');
    }
}

function submitApplication(projectId) {
    const projectCard = document.querySelector(`.project-card-custom[data-project-id="${projectId}"]`);
    const projectTitle = projectCard?.querySelector('h4')?.textContent || 'Project';
    
    const skillsInput = document.getElementById(`applySkills_${projectId}`);
    const experienceInput = document.getElementById(`applyExperience_${projectId}`);
    const roleInput = document.getElementById(`applyRole_${projectId}`);
    const timeInput = document.getElementById(`applyTime_${projectId}`);
    const githubInput = document.getElementById(`applyGithub_${projectId}`);
    
    if (!skillsInput || !experienceInput || !roleInput || !timeInput) return;
    
    const skills = skillsInput.value.trim();
    const experience = experienceInput.value.trim();
    const role = roleInput.value.trim();
    const time = timeInput.value;
    const github = githubInput?.value.trim() || '';
    
    if (!skills || !experience || !role || !time) {
        showNotification('Please fill in all required fields', 'error');
        return;
    }
    
    if (isNaN(time) || time < 1 || time > 40) {
        showNotification('Please enter valid hours (1-40)', 'error');
        return;
    }
    
    // Submit application logic
    const applicationData = {
        projectId,
        projectTitle,
        skills: skills.split(',').map(s => s.trim()).filter(Boolean),
        experience,
        role,
        time: `${time} hours/week`,
        github,
        timestamp: new Date().toISOString(),
        applicantName: currentUser ? currentUser.name : 'Anonymous'
    };
    
    console.log('Application submitted:', applicationData);
    
    // Add to requests
    const request = {
        id: "req_" + Date.now(),
        projectId: projectId,
        applicantName: applicationData.applicantName,
        github: github,
        comment: experience,
        skills: applicationData.skills,
        role: role,
        timeCommitment: time + ' hours/week'
    };
    
    pc_requests.unshift(request);
    
    // Remove the form
    cancelApplication(projectId);
    
    // Update button to show "Applied"
    const applyBtn = projectCard.querySelector('.pc-apply-btn');
    if (applyBtn) {
        applyBtn.innerHTML = '<i class="fas fa-check"></i> Applied';
        applyBtn.classList.remove('btn-primary');
        applyBtn.classList.add('applied-state');
        applyBtn.disabled = true;
        applyBtn.onclick = null;
    }
    
    // Update the incoming requests display
    pc_renderIncomingRequests();
    
    showNotification('Application submitted successfully!', 'success');
}

function cleanupApplicationForms() {
    const forms = document.querySelectorAll('.apply-form');
    forms.forEach(form => {
        const projectId = form.getAttribute('data-project-id');
        cancelApplication(projectId);
    });
}

/* =========================================================
   LINKEDIN FUNCTIONS
========================================================= */
function initializeLinkedInButtons() {
    // Student LinkedIn buttons
    const studentConnectBtn = document.getElementById('connectStudentLinkedinBtn');
    const studentViewBtn = document.getElementById('viewStudentLinkedinBtn');
    
    if (studentConnectBtn) {
        studentConnectBtn.addEventListener('click', () => {
            connectLinkedIn('student');
        });
    }
    
    if (studentViewBtn) {
        studentViewBtn.addEventListener('click', () => {
            viewLinkedInProfile('student');
        });
    }
    
    // Faculty LinkedIn buttons
    const facultyConnectBtn = document.getElementById('connectFacultyLinkedinBtn');
    const facultyViewBtn = document.getElementById('viewFacultyLinkedinBtn');
    
    if (facultyConnectBtn) {
        facultyConnectBtn.addEventListener('click', () => {
            connectLinkedIn('faculty');
        });
    }
    
    if (facultyViewBtn) {
        facultyViewBtn.addEventListener('click', () => {
            viewLinkedInProfile('faculty');
        });
    }
    
    updateLinkedInUI('student');
    updateLinkedInUI('faculty');
}

function connectLinkedIn(role) {
    const profileName = role === 'student' 
        ? currentUser?.name || 'Student User' 
        : currentUser?.name || 'Faculty Member';
    
    const linkedinUrl = prompt(
        `Enter your LinkedIn profile URL for ${profileName}:\n\nExample: https://www.linkedin.com/in/yourusername`,
        `https://www.linkedin.com/in/${profileName.toLowerCase().replace(/\s+/g, '-')}`
    );
    
    if (linkedinUrl && linkedinUrl.includes('linkedin.com/in/')) {
        linkedinProfiles[role] = {
            connected: true,
            profileUrl: linkedinUrl,
            connections: Math.floor(Math.random() * 500) + 100,
            followers: Math.floor(Math.random() * 1000) + 50,
            profileData: {
                headline: role === 'student' ? 'Computer Science Student' : 'AI Research Faculty',
                location: 'University Campus',
                joinedDate: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
            }
        };
        
        updateLinkedInUI(role);
        showNotification(`${role.charAt(0).toUpperCase() + role.slice(1)} LinkedIn profile connected!`, 'success');
    } else if (linkedinUrl) {
        alert('Please enter a valid LinkedIn profile URL (should contain linkedin.com/in/)');
    }
}

function viewLinkedInProfile(role) {
    const profile = linkedinProfiles[role];
    
    if (profile.connected && profile.profileUrl) {
        const profileName = role === 'student' 
            ? currentUser?.name || 'Student User' 
            : currentUser?.name || 'Faculty Member';
        
        const modalContent = `
            <div style="text-align: left;">
                <h3 style="color: #0077B5; margin-bottom: 15px;">
                    <i class="fab fa-linkedin"></i> LinkedIn Profile
                </h3>
                
                <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin-bottom: 15px;">
                    <div style="font-weight: 600; font-size: 1.1rem; color: #0077B5; margin-bottom: 5px;">
                        ${profileName}
                    </div>
                    <div style="color: var(--gray); margin-bottom: 10px;">
                        ${profile.profileData.headline}
                    </div>
                    <div style="font-size: 0.9rem; color: #666;">
                        <i class="fas fa-map-marker-alt"></i> ${profile.profileData.location}
                    </div>
                </div>
                
                <div class="linkedin-stats">
                    <div class="linkedin-stat">
                        <div class="linkedin-stat-value">${profile.connections}+</div>
                        <div class="linkedin-stat-label">Connections</div>
                    </div>
                    <div class="linkedin-stat">
                        <div class="linkedin-stat-value">${profile.followers}</div>
                        <div class="linkedin-stat-label">Followers</div>
                    </div>
                </div>
                
                <div style="margin-top: 20px; font-size: 0.9rem;">
                    <strong>Profile URL:</strong>
                    <div class="profile-url" style="word-break: break-all; margin-top: 5px;">
                        <a href="${profile.profileUrl}" target="_blank">${profile.profileUrl}</a>
                    </div>
                </div>
            </div>
        `;
        
        if (confirm(`Open LinkedIn profile for ${profileName}?\n\nURL: ${profile.profileUrl}\n\nClick OK to see profile details`)) {
            const modal = document.createElement('div');
            modal.className = 'modal-overlay';
            modal.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0,0,0,0.5);
                display: flex;
                justify-content: center;
                align-items: center;
                z-index: 10000;
            `;
            
            modal.innerHTML = `
                <div style="background: white; padding: 25px; border-radius: 15px; max-width: 500px; width: 90%; max-height: 80vh; overflow-y: auto;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                        <h3 style="margin: 0; color: #0077B5;">LinkedIn Profile Preview</h3>
                        <button onclick="this.closest('.modal-overlay').remove()" style="background: none; border: none; font-size: 1.5rem; cursor: pointer; color: var(--gray);">&times;</button>
                    </div>
                    ${modalContent}
                    <div style="margin-top: 20px; text-align: right;">
                        <button onclick="window.open('${profile.profileUrl}', '_blank'); this.closest('.modal-overlay').remove();" style="background: #0077B5; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer; margin-right: 10px;">
                            Open in New Tab
                        </button>
                        <button onclick="this.closest('.modal-overlay').remove()" style="background: var(--gray); color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer;">
                            Close
                        </button>
                    </div>
                </div>
            `;
            
            document.body.appendChild(modal);
            
            modal.addEventListener('click', function(e) {
                if (e.target === this) {
                    this.remove();
                }
            });
        }
    } else {
        showNotification('LinkedIn profile not connected yet', 'error');
    }
}

function updateLinkedInUI(role) {
    const profile = linkedinProfiles[role];
    const statusElement = document.getElementById(`${role}LinkedinStatus`);
    const connectBtn = document.getElementById(`connect${role.charAt(0).toUpperCase() + role.slice(1)}LinkedinBtn`);
    const viewBtn = document.getElementById(`view${role.charAt(0).toUpperCase() + role.slice(1)}LinkedinBtn`);
    
    if (!statusElement || !connectBtn) return;
    
    if (profile.connected) {
        statusElement.innerHTML = `
            <span class="linkedin-connected">
                <i class="fas fa-check-circle"></i> Connected
            </span>
            <br>
            <small style="color: var(--gray);">Last synced: Just now</small>
        `;
        connectBtn.style.display = 'none';
        if (viewBtn) {
            viewBtn.style.display = 'block';
        }
    } else {
        statusElement.innerHTML = `
            <span class="linkedin-disconnected">
                <i class="fas fa-unlink"></i> Not connected
            </span>
            <br>
            <small style="color: var(--gray);">Connect to share your profile</small>
        `;
        connectBtn.style.display = 'block';
        if (viewBtn) {
            viewBtn.style.display = 'none';
        }
    }
}

function initializeLinkedInOnDashboardLoad() {
    if (currentRole) {
        updateLinkedInUI(currentRole);
    }
}

/* =========================================================
   AI ENHANCE FUNCTIONS
========================================================= */
async function runAIAnalysis() {
    const cfg = ROLE_CONFIG[currentRole];
    const enhanceModal = document.getElementById('enhanceModal');
    const enhanceContent = document.getElementById('enhanceContent');
    
    if (!enhanceModal) {
        createEnhanceModal();
        setTimeout(() => runAIAnalysis(), 100);
        return;
    }
    
    enhanceModal.style.display = 'flex';
    enhanceContent.innerHTML = `<p style="color:var(--gray)">Analyzing...</p>`;

    const items = [];
    document.querySelectorAll(`#${cfg.skillListId} .skill-tag`).forEach(tag => {
        items.push({
            name: tag.childNodes[0].textContent.trim(),
            level: tag.dataset.level || 'intermediate'
        });
    });

    const aiOutput = await getGeminiSkillSuggestions(items);
    enhanceContent.innerHTML = `
        <h4>AI Insights</h4>
        <div style="line-height:1.6; margin-top:8px;">
            ${fixAISuggestions(aiOutput)}
        </div>
    `;
}

async function getGeminiSkillSuggestions(skills) {
    try {
        const res = await fetch("http://localhost:3000/ai/skills", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ skills })
        });
        const data = await res.json();
        if (data.success) {
            return data.suggestions;
        } else {
            return "AI backend error.";
        }
    } catch (err) {
        console.error("Gemini call error:", err);
        return "Unable to reach AI backend.";
    }
}

function fixAISuggestions(text) {
    if (!text) return "";
    text = text.replace(/\r\n/g, "\n");
    let lines = text.split("\n");
    let html = "";
    let inList = false;

    lines.forEach(line => {
        let trimmed = line.trim();
        if (/^[\*\-\•\‣\·]\s+/.test(trimmed)) {
            if (!inList) {
                html += "<ul>";
                inList = true;
            }
            let withoutBullet = trimmed.replace(/^[\*\-\•\‣\·]\s+/, "");
            withoutBullet = withoutBullet.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
            withoutBullet = withoutBullet.replace(/_(.*?)_/g, "<em>$1</em>");
            withoutBullet = withoutBullet.replace(/\*(.*?)\*/g, "<em>$1</em>");
            html += `<li>${withoutBullet}</li>`;
        }
        else if (trimmed === "") {
            if (inList) {
                html += "</ul>";
                inList = false;
            }
            html += "<br>";
        }
        else {
            if (inList) {
                html += "</ul>";
                inList = false;
            }
            let clean = trimmed;
            clean = clean.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
            clean = clean.replace(/_(.*?)_/g, "<em>$1</em>");
            clean = clean.replace(/\*(.*?)\*/g, "<em>$1</em>");
            html += `<p>${clean}</p>`;
        }
    });

    if (inList) html += "</ul>";
    return html;
}

function closeEnhanceModal() {
    const modal = document.getElementById("enhanceModal");
    if (modal) modal.style.display = "none";
}

/* =========================================================
   PAGE NAVIGATION
========================================================= */
function showPage(pageId) {
    // Clean up any open application forms
    cleanupApplicationForms();
    
    pages.forEach(page => page.classList.remove('active'));

    if (pageId === 'dashboard') {
        if (currentRole === 'student') {
            document.getElementById('student-dashboard')?.classList.add('active');
            setTimeout(initializeExistingSkills, 100);
        } else {
            document.getElementById('faculty-dashboard')?.classList.add('active');
        }
        return;
    }

    if (pageId === 'skill-summary') {
        document.getElementById('skill-summary-page')?.classList.add('active');
        return;
    }

    const pageEl = document.getElementById(`${pageId}-page`);
    if (pageEl) {
        pageEl.classList.add('active');
    }

    if (pageId === 'network') {
        setTimeout(initializeNetworkPage, 100);
    }

    if (pageId === 'clubs') {
        setTimeout(() => {
            initializeJoinClubButtons();
            updateMyClubsUI();
        }, 100);
    }

    if (pageId === 'projects') {
        setTimeout(pc_onProjectsPageShow, 150);
    }

    if (pageId === 'events') {
        setTimeout(initializeEventsPage, 100);
    }
}

function applyRoleBasedUI(role) {
    // Hide Clubs for faculty
    document.querySelectorAll('.nav-link[data-page="clubs"]').forEach(el => {
        el.style.display = role === 'faculty' ? 'none' : '';
    });

    // Hide Skill Summary for students
    document.querySelectorAll('.nav-link[data-page="skill-summary"]').forEach(el => {
        el.style.display = role === 'student' ? 'none' : '';
    });

    // Hide Skill Summary in footer for students
    document.querySelectorAll('footer .nav-link[data-page="skill-summary"]').forEach(el => {
        el.parentElement.style.display = role === 'student' ? 'none' : '';
    });

    const exploreBtn = document.getElementById('exploreClubsBtn');
    if (exploreBtn) {
        exploreBtn.style.display = role === 'faculty' ? 'none' : '';
    }

    if (role === 'faculty') {
        const clubsPage = document.getElementById('clubs-page');
        if (clubsPage) clubsPage.classList.remove('active');
    }
}

/* =========================================================
   LOGIN/LOGOUT
========================================================= */
function handleLogin() {
    const email = document.getElementById('loginEmail').value;
    const pass = document.getElementById('loginPassword').value;

    if (!email || !pass) return alert('Please fill in all fields');

    if (email === demoAccounts[currentRole].email &&
        pass === demoAccounts[currentRole].password) {

        currentUser = demoAccounts[currentRole];
        showDashboard();
        showNotification(`Welcome ${currentUser.name}!`, 'success');
    } else {
        alert('Invalid email or password.');
    }
}

function showDashboard() {
    mainHeader.classList.remove('hidden');
    mainFooter.classList.remove('hidden');
    applyRoleBasedUI(currentRole);
    
    // If student is on skill-summary page, redirect to dashboard
    if (currentRole === 'student' && document.getElementById('skill-summary-page').classList.contains('active')) {
        pages.forEach(p => p.classList.remove('active'));
        document.getElementById('student-dashboard').classList.add('active');
    } else {
        pages.forEach(p => p.classList.remove('active'));
        document.getElementById('login-page').classList.remove('active');
    }

    const cfg = ROLE_CONFIG[currentRole];
    document.getElementById(cfg.dashboardId).classList.add('active');
    document.getElementById(cfg.nameId).textContent = currentUser.name;
    document.getElementById(cfg.titleId).textContent = currentUser.title;

    navLinks.forEach(n => n.classList.remove('active'));
    document.querySelector('[data-page="dashboard"]').classList.add('active');

    setTimeout(initializeSkills, 100);
    initializeLinkedInButtons();
    setTimeout(initializeLinkedInOnDashboardLoad, 150);
}

function handleLogout() {
    currentUser = null;
    mainHeader.classList.add('hidden');
    mainFooter.classList.add('hidden');
    pages.forEach(p => p.classList.remove('active'));
    document.getElementById('login-page').classList.add('active');
    document.getElementById('loginEmail').value = '';
    document.getElementById('loginPassword').value = '';
    applyRoleBasedUI('student');
}

/* =========================================================
   EVENT LISTENERS
========================================================= */
// Login/Logout
loginBtn.addEventListener('click', handleLogin);
logoutBtn.addEventListener('click', handleLogout);

// Role selection
roleBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        roleBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentRole = btn.getAttribute('data-role');
    });
});

// Navigation
navLinks.forEach(link => {
    link.addEventListener('click', e => {
        e.preventDefault();
        const page = e.target.getAttribute('data-page');
        
        // Prevent students from accessing skill-summary
        if (page === 'skill-summary' && currentRole === 'student') {
            showNotification('Skill Summary is not available for students', 'error');
            showPage('dashboard');
            navLinks.forEach(nav => nav.classList.remove('active'));
            document.querySelector('[data-page="dashboard"]').classList.add('active');
            return;
        }
        
        showPage(page);
        navLinks.forEach(nav => nav.classList.remove('active'));
        e.target.classList.add('active');
    });
});

// Skill buttons
Object.values(ROLE_CONFIG).forEach(cfg => {
    document.getElementById(cfg.addSkillBtnId)?.addEventListener('click', openSkillModal);
    document.getElementById(cfg.aiBtnId)?.addEventListener('click', runAIAnalysis);
});

// Profile edit buttons
document.getElementById('editStudentProfileBtn')?.addEventListener('click', () => {
    if (!currentUser) {
        showNotification('Please login first', 'error');
        return;
    }
    const name = prompt('Enter your name:', currentUser.name);
    if (name) {
        currentUser.name = name;
        document.getElementById('studentName').textContent = name;
    }
    const title = prompt('Enter your title:', currentUser.title);
    if (title) {
        currentUser.title = title;
        document.getElementById('studentTitle').textContent = title;
    }
});

document.getElementById('editFacultyProfileBtn')?.addEventListener('click', function () {
    if (!currentUser) {
        showNotification('Please login first', 'error');
        return;
    }

    const name = prompt('Enter your name:', currentUser.name);
    if (name) {
        currentUser.name = name;
        document.getElementById('facultyName').textContent = name;
    }

    const title = prompt('Enter your title:', currentUser.title);
    if (title) {
        currentUser.title = title;
        document.getElementById('facultyTitle').textContent = title;
    }
});

// Connect GitHub
document.getElementById('connectStudentGithubBtn')?.addEventListener('click', () => {
    alert('GitHub integration would be implemented here. For demo purposes, sample data is shown.');
});

// Explore Clubs
document.getElementById('exploreClubsBtn')?.addEventListener('click', () => {
    showPage('clubs');
    navLinks.forEach(nav => nav.classList.remove('active'));
    document.querySelector('[data-page="clubs"]').classList.add('active');
});

// Network request functions
function acceptRequest(button) {
    const requestItem = button.closest('.request-item');
    const name = requestItem.querySelector('.post-user').textContent;
    requestItem.style.opacity = "0";
    setTimeout(() => requestItem.remove(), 300);
    showNotification(`You are now connected with ${name}`, 'success');
}

function declineRequest(button) {
    const requestItem = button.closest('.request-item');
    const name = requestItem.querySelector('.post-user').textContent;
    requestItem.style.opacity = "0";
    setTimeout(() => requestItem.remove(), 300);
    showNotification(`You declined ${name}'s request`, 'error');
}

// Project creation
document.getElementById('pc_postProjectBtn')?.addEventListener('click', () => {
    const title = document.getElementById('pc_projTitle').value.trim();
    const desc = document.getElementById('pc_projDesc').value.trim();
    const repo = document.getElementById('pc_projGithub').value.trim();
    const skills = document.getElementById('pc_projSkills').value.trim().split(",").map(s => s.trim()).filter(Boolean);
    const roles = document.getElementById('pc_projRoles').value.trim();
    const timeCommitment = document.getElementById('pc_projTimeCommitment').value;

    if (!title || !desc) {
        showNotification("Please enter project title and description", "error");
        return;
    }

    const newProj = {
        id: "proj_" + Date.now(),
        owner: currentUser ? currentUser.name : "You",
        title,
        description: desc,
        github: repo,
        skills,
        roles,
        team: [],
        timeCommitment: timeCommitment || 'medium'
    };

    pc_projects.unshift(newProj);
    pc_renderProjectFeed();
    pc_renderMyProjects();
    pc_renderIncomingRequests();
    showNotification("Project posted!", "success");

    document.getElementById('pc_projTitle').value = "";
    document.getElementById('pc_projDesc').value = "";
    document.getElementById('pc_projGithub').value = "";
    document.getElementById('pc_projSkills').value = "";
    document.getElementById('pc_projRoles').value = "";
    document.getElementById('pc_projTimeCommitment').value = "";
});

// Apply to project event delegation - UPDATED FOR INLINE FORM
document.addEventListener('click', function(e) {
    // Accept request
    if (e.target.closest('.pc-accept-btn')) {
        const id = e.target.getAttribute('data-request-id');
        const req = pc_requests.find(r => r.id === id);
        const proj = pc_projects.find(p => p.id === req.projectId);

        proj.team.push(req.applicantName);
        pc_requests = pc_requests.filter(r => r.id !== id);

        pc_renderMyProjects();
        pc_renderIncomingRequests();
        pc_renderProjectFeed();

        showNotification(`${req.applicantName} added to team!`, "success");
    }

    // Decline request
    if (e.target.closest('.pc-decline-btn')) {
        const id = e.target.getAttribute('data-request-id');
        pc_requests = pc_requests.filter(r => r.id !== id);
        pc_renderMyProjects();
        pc_renderIncomingRequests();
        showNotification("Request declined", "error");
    }
    
    // Analyse request
    if (e.target.closest('.pc-analyse-btn')) {
        const id = e.target.closest('.pc-analyse-btn').getAttribute('data-request-id');
        const req = pc_requests.find(r => r.id === id);
        if (!req) return;
        pc_openAnalyseModal(req);
    }
});

// Faculty action buttons
document.addEventListener('click', function (e) {
    // Project approval
    if (e.target.closest('.approve-project-btn')) {
        const projectId = e.target.closest('.approve-project-btn').getAttribute('data-project-id');
        const projectCard = e.target.closest('.project-card-custom');

        projectCard.querySelector('.project-status').textContent = 'Approved';
        projectCard.querySelector('.project-status').className = 'project-status status-approved';

        const actionButtons = projectCard.querySelector('.action-buttons');
        actionButtons.innerHTML = `
            <button class="btn btn-primary btn-small view-project-btn" data-project-id="${projectId}">
                <i class="fas fa-eye"></i> View Details
            </button>
            <button class="btn btn-outline btn-small message-student-btn" data-student="Student Name">
                <i class="fas fa-comment"></i> Message
            </button>
        `;

        showNotification('Project approved successfully!', 'success');
    }

    // Project rejection
    if (e.target.closest('.reject-project-btn')) {
        const projectId = e.target.closest('.reject-project-btn').getAttribute('data-project-id');
        const projectCard = e.target.closest('.project-card-custom');

        projectCard.querySelector('.project-status').textContent = 'Rejected';
        projectCard.querySelector('.project-status').className = 'project-status status-rejected';

        const actionButtons = projectCard.querySelector('.action-buttons');
        actionButtons.innerHTML = `
            <button class="btn btn-primary btn-small view-project-btn" data-project-id="${projectId}">
                <i class="fas fa-eye"></i> View Details
            </button>
        `;

        showNotification('Project rejected', 'error');
    }

    // Collaboration request acceptance
    if (e.target.closest('.accept-collab-btn')) {
        const requestId = e.target.closest('.accept-collab-btn').getAttribute('data-request-id');
        const requestCard = e.target.closest('.collaboration-request');

        requestCard.style.borderLeftColor = '#28a745';
        requestCard.querySelector('.action-buttons').innerHTML = `
            <span style="color: var(--success); font-weight: 600;">
                <i class="fas fa-check"></i> Collaboration Accepted
            </span>
        `;

        showNotification('Collaboration request accepted!', 'success');
    }

    // Collaboration request decline
    if (e.target.closest('.decline-collab-btn')) {
        const requestId = e.target.closest('.decline-collab-btn').getAttribute('data-request-id');
        const requestCard = e.target.closest('.collaboration-request');

        requestCard.style.opacity = '0.5';
        setTimeout(() => {
            requestCard.remove();
        }, 500);

        showNotification('Collaboration request declined', 'error');
    }

    // View project details
    if (e.target.closest('.view-project-btn')) {
        const projectId = e.target.closest('.view-project-btn').getAttribute('data-project-id');
        alert(`Viewing details for project ID: ${projectId}`);
    }
});

// Analyse modal
document.getElementById('pc_closeAnalyseModal')?.addEventListener('click', () => {
    document.getElementById('pc_analyseModal').style.display = 'none';
});
document.getElementById('pc_closeAnalyseBtn')?.addEventListener('click', () => {
    document.getElementById('pc_analyseModal').style.display = 'none';
});

function pc_openAnalyseModal(req) {
    const modal = document.getElementById('pc_analyseModal');
    const content = document.getElementById('pc_analyseContent');
    modal.style.display = "flex";

    content.innerHTML = `<p style="color:var(--gray);">Analyzing ${req.applicantName}...</p>`;

    fetch("http://localhost:3000/ai/analyse-collab", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            applicantGithub: req.github,
            requiredSkills: req.skills,
            applicantName: req.applicantName
        })
    })
        .then(r => r.json())
        .then(data => {
            content.innerHTML = `
            <strong>Match Score:</strong> ${data.matchScore}<br>
            <strong>Repo Quality:</strong> ${data.repoQuality}<br>
            <strong>Recommendation:</strong> ${data.recommendation}<br><br>

            <strong>Strengths:</strong>
            <ul>${data.strengths.map(s => `<li>${s}</li>`).join("")}</ul>

            <strong>Weaknesses:</strong>
            <ul>${data.weaknesses.map(s => `<li>${s}</li>`).join("")}</ul>

            <strong>Details:</strong>
            <div style="margin-top:6px;">${data.details}</div>
            `;

            content.innerHTML += `
<br>
<strong>Conclusion:</strong>
<p style="margin-top:6px;">${data.conclusion}</p>
`;

        })
        .catch(() => {
            content.innerHTML = `<p style="color:red;">Unable to reach backend.</p>`;
    });
}

// Initialize events page
function initializeEventsPage() {
    const scrollableElements = document.querySelectorAll('.scrollable-content');
    scrollableElements.forEach(el => {
        if (el.scrollHeight > el.clientHeight) {
            el.style.overflowY = 'auto';
        }
    });
}

// Refresh project feed button
document.getElementById('refreshProjectFeedBtn')?.addEventListener('click', function() {
    this.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Refreshing...';
    this.disabled = true;
    
    // Simulate loading
    setTimeout(() => {
        pc_renderProjectFeed();
        this.innerHTML = '<i class="fas fa-sync-alt"></i> Refresh';
        this.disabled = false;
        showNotification('Project feed refreshed!', 'success');
    }, 800);
});

/* =========================================================
   INITIALIZATION
========================================================= */
window.addEventListener('load', () => {
    if (!document.getElementById("skillModal")) {
        createSkillModal();
    }

    if (!document.getElementById("enhanceModal")) {
        createEnhanceModal();
    }

    initializeExistingSkills();
    initializeLinkedInButtons();
    
    document.addEventListener('click', function(e) {
        if (e.target.closest('.nav-link[data-page="dashboard"]')) {
            setTimeout(initializeLinkedInOnDashboardLoad, 100);
        }
    });
    
    if (document.querySelector('#student-dashboard.active') || document.querySelector('#faculty-dashboard.active')) {
        setTimeout(initializeLinkedInOnDashboardLoad, 100);
    }
    
    // Click outside modals to close
    document.addEventListener('click', (e) => {
        const skillModal = document.getElementById('skillModal');
        if (skillModal && e.target === skillModal) closeSkillModal();
        
        const enhanceModal = document.getElementById('enhanceModal');
        if (enhanceModal && e.target === enhanceModal) closeEnhanceModal();
    });
});
