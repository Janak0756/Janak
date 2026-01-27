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

/* =========================================================
   UNIFIED ROLE CONFIGURATION
========================================================= */
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

// In-memory store for projects collaboration
let pc_projects = [];
let pc_requests = [];
let currentApplyProject = null;

/* =========================================================
   ENHANCED PROFILE EDIT MODAL SYSTEM
========================================================= */
function createProfileEditModal() {
    const modalHTML = `
        <div class="modal-overlay" id="profileEditModal" style="display: none;">
            <div class="modal-content">
                <div class="modal-header">
                    <h3 id="profileEditTitle">Edit Profile</h3>
                    <button class="modal-close" id="closeProfileEditModal">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="form-group">
                        <label for="profileName">Full Name</label>
                        <input type="text" class="form-control" id="profileName" 
                               placeholder="Enter your full name">
                    </div>
                    <div class="form-group">
                        <label for="profileTitle">Title/Role</label>
                        <input type="text" class="form-control" id="profileTitle" 
                               placeholder="e.g., Computer Science Student">
                    </div>
                    <div class="form-group">
                        <label for="profileEmail">Email Address</label>
                        <input type="email" class="form-control" id="profileEmail" 
                               placeholder="Enter your email">
                    </div>
                    <div class="form-group">
                        <label for="profileBio">Bio/Description</label>
                        <textarea class="form-control" id="profileBio" rows="3" 
                                  placeholder="Tell us about yourself..."></textarea>
                    </div>
                    <div class="profile-preview">
                        <h4>Preview:</h4>
                        <div class="preview-profile-card" style="padding: 15px; border-radius: 10px; background: var(--light); margin-top: 10px;">
                            <div class="preview-avatar" style="width: 60px; height: 60px; border-radius: 50%; background: linear-gradient(135deg, var(--primary), var(--accent)); display: flex; align-items: center; justify-content: center; color: white; font-size: 1.5rem; margin-bottom: 10px;">${currentUser?.name?.charAt(0) || 'U'}</div>
                            <div class="preview-name" id="previewName" style="font-weight: 600; margin-bottom: 5px;"></div>
                            <div class="preview-title" id="previewTitle" style="color: var(--gray); font-size: 0.9rem;"></div>
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-outline" id="cancelProfileEditBtn">Cancel</button>
                    <button class="btn btn-primary" id="saveProfileBtn">Save Changes</button>
                </div>
            </div>
        </div>
    `;

    if (!document.getElementById('profileEditModal')) {
        document.body.insertAdjacentHTML('beforeend', modalHTML);

        // Add event listeners
        document.getElementById('closeProfileEditModal').addEventListener('click', closeProfileEditModal);
        document.getElementById('cancelProfileEditBtn').addEventListener('click', closeProfileEditModal);
        document.getElementById('saveProfileBtn').addEventListener('click', saveProfileChanges);
        
        // Add real-time preview updates
        document.getElementById('profileName').addEventListener('input', updateProfilePreview);
        document.getElementById('profileTitle').addEventListener('input', updateProfilePreview);
        
        // Add ripple effects
        ['closeProfileEditModal', 'cancelProfileEditBtn', 'saveProfileBtn'].forEach(id => {
            const btn = document.getElementById(id);
            if (btn) {
                btn.addEventListener('click', function(e) {
                    createRipple(this, e);
                });
            }
        });
    }
}

function openProfileEditModal(role) {
    createProfileEditModal();
    
    const modal = document.getElementById('profileEditModal');
    const nameField = document.getElementById('profileName');
    const titleField = document.getElementById('profileTitle');
    const emailField = document.getElementById('profileEmail');
    const bioField = document.getElementById('profileBio');
    const modalTitle = document.getElementById('profileEditTitle');
    
    // Set modal title
    modalTitle.textContent = `Edit ${role.charAt(0).toUpperCase() + role.slice(1)} Profile`;
    
    // Populate with current data
    if (currentUser) {
        nameField.value = currentUser.name || '';
        titleField.value = currentUser.title || '';
        emailField.value = currentUser.email || demoAccounts[role]?.email || '';
        bioField.value = currentUser.bio || 'Passionate about technology and innovation.';
    }
    
    // Update preview
    updateProfilePreview();
    
    // Show modal with animation
    modal.style.display = 'flex';
    
    const modalContent = modal.querySelector('.modal-content');
    modal.classList.remove('closing');
    modalContent.classList.remove('closing');
    
    void modal.offsetWidth;
    
    setTimeout(() => {
        modalContent.classList.add('bounce-in');
    }, 10);
    
    // Store current role for saving
    modal.dataset.role = role;
}

function closeProfileEditModal() {
    const modal = document.getElementById('profileEditModal');
    const modalContent = modal?.querySelector('.modal-content');
    
    if (!modal) return;
    
    modalContent?.classList.add('closing');
    modal.classList.add('closing');
    
    setTimeout(() => {
        modal.style.display = 'none';
        modal.classList.remove('closing');
        modalContent?.classList.remove('closing');
    }, 300);
}

function updateProfilePreview() {
    const name = document.getElementById('profileName')?.value || 'Your Name';
    const title = document.getElementById('profileTitle')?.value || 'Your Title';
    
    const previewName = document.getElementById('previewName');
    const previewTitle = document.getElementById('previewTitle');
    const previewAvatar = document.querySelector('.preview-avatar');
    
    if (previewName) previewName.textContent = name;
    if (previewTitle) previewTitle.textContent = title;
    if (previewAvatar) previewAvatar.textContent = name.charAt(0).toUpperCase();
}

function saveProfileChanges() {
    const modal = document.getElementById('profileEditModal');
    const role = modal?.dataset.role || currentRole;
    
    const name = document.getElementById('profileName')?.value.trim();
    const title = document.getElementById('profileTitle')?.value.trim();
    const email = document.getElementById('profileEmail')?.value.trim();
    const bio = document.getElementById('profileBio')?.value.trim();
    
    if (!name || !title) {
        // Animate validation errors
        const inputs = [document.getElementById('profileName'), document.getElementById('profileTitle')];
        inputs.forEach(input => {
            if (!input.value.trim()) {
                input.classList.add('shake');
                input.style.borderColor = 'var(--danger)';
                setTimeout(() => {
                    input.classList.remove('shake');
                    input.style.borderColor = '';
                }, 500);
            }
        });
        showEnhancedNotification('Name and title are required', 'error');
        return;
    }
    
    // Update user data
    if (currentUser) {
        currentUser.name = name;
        currentUser.title = title;
        currentUser.email = email;
        if (bio) currentUser.bio = bio;
        
        // Update demo accounts for future logins
        if (demoAccounts[role]) {
            demoAccounts[role].name = name;
            demoAccounts[role].title = title;
        }
    }
    
    // Update UI elements
    const cfg = ROLE_CONFIG[role];
    if (cfg) {
        const nameElement = document.getElementById(cfg.nameId);
        const titleElement = document.getElementById(cfg.titleId);
        
        if (nameElement) {
            // Animate name change
            nameElement.style.transform = 'scale(1.1)';
            nameElement.style.color = 'var(--success)';
            setTimeout(() => {
                nameElement.textContent = name;
                nameElement.style.transform = '';
                nameElement.style.color = '';
            }, 300);
        }
        
        if (titleElement) {
            // Animate title change
            titleElement.style.opacity = '0.5';
            setTimeout(() => {
                titleElement.textContent = title;
                titleElement.style.opacity = '';
                titleElement.classList.add('pulse');
                setTimeout(() => titleElement.classList.remove('pulse'), 1000);
            }, 150);
        }
    }
    
    // Show success animation and close modal
    showSuccessAnimation();
    setTimeout(() => {
        closeProfileEditModal();
        showEnhancedNotification('Profile updated successfully!', 'success');
    }, 800);
}

/* =========================================================
   SKILL MODAL SYSTEM - ENHANCED
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
                            <option value="intermediate" selected>Intermediate</option>
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
                            <span class="skill-level-badge" id="previewSkillLevel">Intermediate</span>
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
        document.getElementById('skillCategory').addEventListener('change', updateSkillPreview);
        
        // Add ripple effect to modal buttons
        ['closeSkillModal', 'cancelSkillBtn', 'saveSkillBtn', 'deleteSkillBtn'].forEach(id => {
            const btn = document.getElementById(id);
            if (btn) {
                btn.addEventListener('click', function(e) {
                    createRipple(this, e);
                });
            }
        });
    }
}

function closeSkillModal() {
    const skillModal = document.getElementById('skillModal');
    if (!skillModal) return;
    
    const modalContent = skillModal.querySelector('.modal-content');
    
    // Add closing animation
    modalContent.classList.add('closing');
    skillModal.classList.add('closing');
    
    setTimeout(() => {
        skillModal.style.display = 'none';
        skillModal.classList.remove('closing');
        modalContent.classList.remove('closing');
        editingSkill = null;
    }, 300);
}

function updateSkillPreview() {
    const skillName = document.getElementById('skillName').value || 'Skill Name';
    const skillLevel = document.getElementById('skillLevel').value;
    const skillCategory = document.getElementById('skillCategory').value;

    document.getElementById('previewSkillName').textContent = skillName;
    document.getElementById('previewSkillLevel').textContent =
        skillLevel.charAt(0).toUpperCase() + skillLevel.slice(1);
    
    // Update preview background based on category
    const previewTag = document.querySelector('.preview-skill-tag');
    if (previewTag) {
        const categoryColors = {
            'programming': 'linear-gradient(135deg, #4A6FA5, #4A90E2)',
            'design': 'linear-gradient(135deg, #FF9E9E, #FF6B6B)',
            'data': 'linear-gradient(135deg, #6C4AB6, #8B5FBF)',
            'soft-skills': 'linear-gradient(135deg, #4CAF50, #66BB6A)',
            'other': 'linear-gradient(135deg, #FFBD35, #FF9800)'
        };
        previewTag.style.background = categoryColors[skillCategory] || categoryColors.programming;
    }
}

function openEditSkillModal(skillElement) {
    editingSkill = skillElement;

    document.getElementById('modalTitle').textContent = 'Edit Skill';
    document.getElementById('saveSkillBtn').textContent = 'Update Skill';
    document.getElementById('deleteSection').style.display = 'block';

    const name = skillElement.childNodes[0].textContent.trim();
    const level = skillElement.querySelector('.skill-level-badge').textContent.toLowerCase();
    const category = skillElement.getAttribute('data-category') || 'programming';

    document.getElementById('skillName').value = name;
    document.getElementById('skillLevel').value = level;
    document.getElementById('skillCategory').value = category;

    updateSkillPreview();
    
    const skillModal = document.getElementById('skillModal');
    skillModal.style.display = 'flex';
    
    // Reset any existing animations
    const modalContent = skillModal.querySelector('.modal-content');
    skillModal.classList.remove('closing');
    modalContent.classList.remove('closing');
    
    // Trigger reflow
    void skillModal.offsetWidth;
    
    // Add opening animation
    setTimeout(() => {
        modalContent.classList.add('bounce-in');
    }, 10);
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
                
                // Add hover animation
                skill.addEventListener('mouseenter', () => {
                    skill.classList.add('pulse');
                });
                skill.addEventListener('mouseleave', () => {
                    setTimeout(() => skill.classList.remove('pulse'), 300);
                });
            }
        });
    });
}

function deleteSkill() {
    if (!editingSkill) return;

    if (confirm('Delete this skill?')) {
        // Animation for deletion
        editingSkill.style.transform = 'scale(0.8)';
        editingSkill.style.opacity = '0';
        
        setTimeout(() => {
            editingSkill.remove();

            const count = document.getElementById('studentSkills');
            if (count) {
                count.textContent = parseInt(count.textContent) - 1;
                
                // Animate count change
                count.style.transform = 'scale(0.8)';
                setTimeout(() => {
                    count.style.transform = '';
                }, 300);
            }

            showEnhancedNotification('Skill deleted!', 'success');
            closeSkillModal();
        }, 300);
    }
}

/* =========================================================
   ENHANCED NOTIFICATIONS
========================================================= */
function showEnhancedNotification(msg, type = 'info') {
    const box = document.createElement('div');
    box.className = `notification ${type}`;
    box.innerHTML = `
        <div style="display: flex; align-items: center; gap: 10px;">
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
            <span>${msg}</span>
        </div>
    `;

    document.body.appendChild(box);

    setTimeout(() => box.classList.add('show'), 30);
    setTimeout(() => {
        box.classList.remove('show');
        setTimeout(() => box.remove(), 300);
    }, 2600);
}

// Keep original function for backward compatibility
function showNotification(msg, type = 'info') {
    showEnhancedNotification(msg, type);
}

/* =========================================================
   SKILL INITIALIZER
========================================================= */
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
            
            // Add hover animation
            skill.addEventListener('mouseenter', () => {
                skill.classList.add('pulse');
            });
            skill.addEventListener('mouseleave', () => {
                setTimeout(() => skill.classList.remove('pulse'), 300);
            });
        }
    });
}

/* =========================================================
   ROLE-AWARE SKILL MODAL - ENHANCED
========================================================= */
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
    
    // Reset any existing animations
    const modalContent = skillModal.querySelector('.modal-content');
    skillModal.classList.remove('closing');
    modalContent.classList.remove('closing');
    
    // Trigger reflow
    void skillModal.offsetWidth;
    
    // Add opening animation
    setTimeout(() => {
        modalContent.classList.add('bounce-in');
    }, 10);
}

/* =========================================================
   ROLE-AWARE SAVE SKILL - ENHANCED
========================================================= */
function saveSkill() {
    const cfg = ROLE_CONFIG[currentRole];
    const skillName = document.getElementById('skillName');
    const skillLevel = document.getElementById('skillLevel');
    const skillCategory = document.getElementById('skillCategory');

    const name = skillName.value.trim();
    const level = skillLevel.value;
    const category = skillCategory.value;

    if (!name) {
        // Animate the input field
        skillName.classList.add('shake');
        skillName.focus();
        setTimeout(() => skillName.classList.remove('shake'), 500);
        return;
    }

    if (editingSkill) {
        // Animation for editing
        editingSkill.style.transform = 'scale(0.9)';
        editingSkill.style.opacity = '0.5';
        
        setTimeout(() => {
            editingSkill.innerHTML = `
                ${name}
                <span class="skill-level-badge">${level.charAt(0).toUpperCase() + level.slice(1)}</span>
            `;
            editingSkill.dataset.level = level;
            editingSkill.dataset.category = category;
            
            editingSkill.style.transform = '';
            editingSkill.style.opacity = '';
            editingSkill.classList.add('pulse');
            
            setTimeout(() => {
                editingSkill.classList.remove('pulse');
            }, 1000);
        }, 200);
        
        showEnhancedNotification('Skill updated successfully!', 'success');
    } else {
        const skill = document.createElement('span');
        skill.className = 'skill-tag';
        skill.dataset.level = level;
        skill.dataset.category = category;
        skill.innerHTML = `
            ${name}
            <span class="skill-level-badge">${level.charAt(0).toUpperCase() + level.slice(1)}</span>
        `;
        
        // Set background based on category
        const categoryColors = {
            'programming': 'linear-gradient(135deg, var(--button-primary), var(--student-primary))',
            'design': 'linear-gradient(135deg, var(--accent), #FF6B6B)',
            'data': 'linear-gradient(135deg, var(--faculty-primary), var(--primary))',
            'soft-skills': 'linear-gradient(135deg, #4CAF50, #66BB6A)',
            'other': 'linear-gradient(135deg, var(--warning), #FF9800)'
        };
        skill.style.background = categoryColors[category] || categoryColors.programming;
        
        // Animation for new skill
        skill.style.opacity = '0';
        skill.style.transform = 'translateY(20px)';
        
        document.getElementById(cfg.skillListId).appendChild(skill);
        
        // Animate in
        setTimeout(() => {
            skill.style.transition = 'all 0.3s ease-out';
            skill.style.opacity = '1';
            skill.style.transform = 'translateY(0)';
        }, 10);
        
        skill.classList.add('pulse');
        setTimeout(() => {
            skill.classList.remove('pulse');
        }, 1500);

        if (cfg.skillCountId) {
            const count = document.getElementById(cfg.skillCountId);
            const currentCount = parseInt(count.textContent);
            count.textContent = currentCount + 1;
            
            // Animate count change
            count.style.transform = 'scale(1.2)';
            count.style.color = 'var(--success)';
            setTimeout(() => {
                count.style.transform = '';
                count.style.color = '';
            }, 600);
        }

        showEnhancedNotification('New skill added!', 'success');
        
        // Show confetti for first few skills
        if (document.querySelectorAll(`#${cfg.skillListId} .skill-tag`).length <= 3) {
            showSuccessAnimation();
        }
    }

    closeSkillModal();
    initializeSkills();
}

/* =========================================================
   GITHUB ANALYSIS - Move to Right Panel in Student Dashboard
========================================================= */
function moveGitHubAnalysisToRightPanel() {
    const studentDashboard = document.getElementById('student-dashboard');
    if (!studentDashboard) return;
    
    const githubSection = document.querySelector('#student-dashboard .github-analysis');
    if (!githubSection) return;
    
    const rightSidebar = document.querySelector('#student-dashboard .right-sidebar');
    if (!rightSidebar) return;
    
    // Create a container in right sidebar
    const githubRightContainer = document.createElement('div');
    githubRightContainer.className = 'github-analysis-right';
    githubRightContainer.innerHTML = `
        <div class="card">
            <div class="card-header">
                <div class="card-title">
                    <i class="fas fa-code-branch"></i> GitHub Analysis
                </div>
                <button class="btn btn-outline btn-small" id="refreshGithubBtn">
                    <i class="fas fa-sync-alt"></i>
                </button>
            </div>
            <div class="scrollable-content">
                ${githubSection.innerHTML}
            </div>
        </div>
    `;
    
    // Add to right sidebar
    rightSidebar.appendChild(githubRightContainer);
    
    // Remove original section
    githubSection.remove();
    
    // Add refresh button functionality with animation
    document.getElementById('refreshGithubBtn')?.addEventListener('click', function() {
        this.classList.add('spin');
        setTimeout(() => {
            this.classList.remove('spin');
            showEnhancedNotification('GitHub data refreshed', 'success');
        }, 1000);
    });
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

            if (show) {
                card.style.display = 'block';
                card.classList.add('fade-in');
                count++;
            } else {
                card.style.display = 'none';
                card.classList.remove('fade-in');
            }
        });

        document.getElementById('resultsCount').textContent =
            `${count} profile${count !== 1 ? 's' : ''}`;
            
        // Animate count change
        const countElement = document.getElementById('resultsCount');
        if (countElement) {
            countElement.style.transform = 'scale(1.1)';
            setTimeout(() => {
                countElement.style.transform = '';
            }, 300);
        }
    }

    resetFiltersBtn.addEventListener('click', () => {
        departmentFilter.value = "";
        skillsFilter.value = "";
        roleFilter.value = "";
        yearFilter.value = "";
        applyFilters();
        showEnhancedNotification('Filters reset', 'info');
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

                // Animation
                this.style.transform = 'scale(0.95)';
                this.style.opacity = '0.8';
                
                setTimeout(() => {
                    this.innerHTML = '<i class="fas fa-check"></i> Request Sent';
                    this.classList.remove('btn-primary');
                    this.classList.add('btn-outline');
                    this.disabled = true;
                    
                    this.style.transform = '';
                    this.style.opacity = '';
                    this.classList.add('pulse');
                    
                    setTimeout(() => {
                        this.classList.remove('pulse');
                    }, 1000);
                }, 200);

                showEnhancedNotification(`Connection request sent to ${name}`, 'success');
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

                // Animation
                this.style.transform = 'scale(0.95)';
                
                setTimeout(() => {
                    this.innerHTML = '<i class="fas fa-check"></i> Requested';
                    this.classList.remove('btn-outline');
                    this.classList.add('btn-primary');
                    this.disabled = true;
                    
                    this.style.transform = '';
                    this.classList.add('pulse');
                    
                    setTimeout(() => {
                        this.classList.remove('pulse');
                    }, 1000);
                }, 200);

                showEnhancedNotification(`Request sent to ${name}`, 'success');
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

                // Animation
                this.style.transform = 'scale(0.95)';
                
                setTimeout(() => {
                    this.innerHTML = '<i class="fas fa-check"></i> Joined';
                    this.classList.remove('btn-outline');
                    this.classList.add('btn-primary');
                    this.disabled = true;
                    
                    this.style.transform = '';
                    this.classList.add('pulse');
                    
                    setTimeout(() => {
                        this.classList.remove('pulse');
                    }, 1000);
                }, 200);

                showEnhancedNotification(`Joined ${name}`, 'success');
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
   CLUBS MANAGEMENT - ENHANCED
========================================================= */
function initializeJoinClubButtons() {
    const buttons = document.querySelectorAll('#allClubsList .btn-outline');

    buttons.forEach(btn => {
        if (!btn.hasAttribute("data-joined-init")) {
            btn.setAttribute("data-joined-init", "true");

            btn.addEventListener('click', function () {
                const clubCard = this.closest('.club-card-custom');
                const clubName = clubCard.querySelector('strong').textContent;

                if (!joinedClubs.includes(clubName)) {
                    joinedClubs.push(clubName);
                    
                    // Animation for joining
                    clubCard.style.transform = 'scale(0.98)';
                    clubCard.style.boxShadow = '0 0 20px rgba(74, 111, 165, 0.3)';
                    
                    setTimeout(() => {
                        clubCard.style.transform = '';
                        clubCard.style.boxShadow = '';
                        updateMyClubsUI();
                        showEnhancedNotification(`Joined ${clubName}`, 'success');
                    }, 300);
                }

                this.style.transform = 'scale(0.95)';
                setTimeout(() => {
                    this.textContent = "Joined ✔";
                    this.classList.remove("btn-outline");
                    this.classList.add("btn-primary");
                    this.disabled = true;
                    this.style.transform = '';
                    this.classList.add('pulse');
                    
                    setTimeout(() => {
                        this.classList.remove('pulse');
                    }, 1000);
                }, 200);
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
            `<div style="color: var(--gray); padding: 10px 0; text-align: center; animation: fadeIn 0.5s;">
                You haven't joined any clubs yet.
            </div>`;
        if (dashboardClubs) dashboardClubs.innerHTML =
            `<div class="event-card" style="animation: fadeIn 0.5s;">
                <div class="event-date">
                    <div class="event-day">--</div>
                </div>
                <div class="event-details">
                    <div class="event-title">No Clubs Joined</div>
                </div>
            </div>`;
        return;
    }

    joinedClubs.forEach((club, index) => {
        if (myClubsList) {
            myClubsList.innerHTML += `
                <div class="club-card-custom" style="animation: fadeIn 0.5s ${index * 0.1}s both;">
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
                <div class="event-card" style="animation: fadeIn 0.5s ${index * 0.1}s both;">
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
                const clubCard = this.closest('.club-card-custom');
                const clubName = this.getAttribute("data-club");
                
                // Animation for leaving
                clubCard.style.transform = 'translateX(-100%)';
                clubCard.style.opacity = '0';
                
                setTimeout(() => {
                    joinedClubs = joinedClubs.filter(c => c !== clubName);
                    showEnhancedNotification(`Left ${clubName}`, "error");
                    updateMyClubsUI();
                    updateAllClubsButtons();
                }, 300);
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
   AI ENHANCEMENT FUNCTIONS - ENHANCED
========================================================= */
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
                html += "<ul style='margin-left: 20px;'>";
                inList = true;
            }
            let withoutBullet = trimmed.replace(/^[\*\-\•\‣\·]\s+/, "");
            withoutBullet = withoutBullet.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
            withoutBullet = withoutBullet.replace(/_(.*?)_/g, "<em>$1</em>");
            withoutBullet = withoutBullet.replace(/\*(.*?)\*/g, "<em>$1</em>");
            html += `<li style="margin-bottom: 5px; animation: fadeIn 0.5s;">${withoutBullet}</li>`;
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
            clean = clean.replace(/\*\*(.*?)\*\*/g, "<strong style='color: var(--primary)'>$1</strong>");
            clean = clean.replace(/_(.*?)_/g, "<em>$1</em>");
            clean = clean.replace(/\*(.*?)\*/g, "<em>$1</em>");
            html += `<p style="margin-bottom: 10px; animation: fadeIn 0.5s;">${clean}</p>`;
        }
    });

    if (inList) html += "</ul>";
    return html;
}

function createEnhanceModal() {
    const modalHTML = `
        <div class="modal-overlay" id="enhanceModal" style="display: none;">
            <div class="modal-content">
                <div class="modal-header">
                    <h3>🎯 AI Skill Enhancement Suggestions</h3>
                    <button class="modal-close" id="closeEnhanceModal">&times;</button>
                </div>
                <div class="modal-body" id="enhanceContent">
                    <div style="text-align: center; padding: 40px 0;">
                        <div class="spinner"></div>
                        <p style="margin-top: 20px; color: var(--gray); animation: pulse 2s infinite;">Analyzing your skills with AI...</p>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-outline" id="closeEnhanceBtn">Close</button>
                    <button class="btn btn-primary" id="applySuggestionsBtn" style="display: none;">
                        <i class="fas fa-magic"></i> Apply Suggestions
                    </button>
                </div>
            </div>
        </div>
    `;
    
    if (!document.getElementById('enhanceModal')) {
        document.body.insertAdjacentHTML("beforeend", modalHTML);
        document.getElementById("closeEnhanceModal").addEventListener("click", closeEnhanceModal);
        document.getElementById("closeEnhanceBtn").addEventListener("click", closeEnhanceModal);
        document.getElementById("applySuggestionsBtn")?.addEventListener("click", applyAISuggestions);
    }
}

function closeEnhanceModal() {
    const modal = document.getElementById("enhanceModal");
    const modalContent = modal?.querySelector('.modal-content');
    
    if (!modal) return;
    
    modalContent?.classList.add('closing');
    modal.classList.add('closing');
    
    setTimeout(() => {
        modal.style.display = "none";
        modal.classList.remove('closing');
        modalContent?.classList.remove('closing');
    }, 300);
}

/* =========================================================
   UNIFIED AI ANALYSIS (STUDENT + FACULTY) - ENHANCED
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
    
    // Reset any existing animations
    const modalContent = enhanceModal.querySelector('.modal-content');
    enhanceModal.classList.remove('closing');
    modalContent.classList.remove('closing');
    
    // Trigger reflow
    void enhanceModal.offsetWidth;
    
    // Add opening animation
    setTimeout(() => {
        modalContent.classList.add('bounce-in');
    }, 10);
    
    enhanceContent.innerHTML = `
        <div style="text-align: center; padding: 40px 0;">
            <div class="spinner"></div>
            <p style="margin-top: 20px; color: var(--gray);">Analyzing your skills with AI...</p>
        </div>
    `;

    const items = [];
    document.querySelectorAll(`#${cfg.skillListId} .skill-tag`).forEach(tag => {
        items.push({
            name: tag.childNodes[0].textContent.trim(),
            level: tag.dataset.level || 'intermediate'
        });
    });

    // Simulate AI processing delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const aiOutput = await getGeminiSkillSuggestions(items);
    enhanceContent.innerHTML = `
        <div style="animation: fadeIn 0.8s;">
            <h4 style="color: var(--primary); margin-bottom: 20px;">
                <i class="fas fa-robot"></i> AI Insights
            </h4>
            <div style="line-height:1.6; margin-top:8px; max-height: 300px; overflow-y: auto; padding-right: 10px;">
                ${fixAISuggestions(aiOutput)}
            </div>
            <div style="margin-top: 20px; padding: 15px; background: var(--light); border-radius: 10px; border-left: 4px solid var(--success);">
                <strong>💡 Tip:</strong> Consider focusing on 1-2 suggestions to implement first for maximum impact.
            </div>
        </div>
    `;
    
    // Show apply button
    const applyBtn = document.getElementById('applySuggestionsBtn');
    if (applyBtn) {
        applyBtn.style.display = 'inline-flex';
        applyBtn.classList.add('pulse');
    }
}

function applyAISuggestions() {
    showEnhancedNotification('AI suggestions applied! Check your skills list.', 'success');
    showSuccessAnimation();
    closeEnhanceModal();
}

/* =========================================================
   PROJECT COLLABORATION - APPLY MODAL - ENHANCED
========================================================= */
function createApplyModal() {
    const modalHTML = `
        <div class="apply-modal-overlay" id="applyModal">
            <div class="apply-modal-content">
                <div class="apply-modal-header">
                    <h3>Apply to Join Project</h3>
                    <button class="apply-modal-close" id="closeApplyModal">&times;</button>
                </div>
                <div class="apply-modal-body">
                    <div class="form-group">
                        <label for="applyName">Your Name</label>
                        <input type="text" class="form-control" id="applyName" 
                               value="${currentUser?.name || ''}" 
                               placeholder="Enter your name">
                    </div>
                    <div class="form-group">
                        <label for="applyGithub">GitHub Profile URL</label>
                        <input type="url" class="form-control" id="applyGithub" 
                               placeholder="https://github.com/yourusername">
                    </div>
                    <div class="form-group">
                        <label for="applySkills">Your Skills (comma separated)</label>
                        <input type="text" class="form-control" id="applySkills" 
                               placeholder="React, Node.js, Python">
                    </div>
                    <div class="form-group">
                        <label for="applyComment">How will you contribute?</label>
                        <textarea class="form-control" id="applyComment" rows="3" 
                                  placeholder="Describe your experience and how you can contribute to this project..."></textarea>
                    </div>
                    <div class="form-group">
                        <div id="applyProjectInfo" style="background: var(--light); padding: 12px; border-radius: 8px; font-size: 0.9rem; animation: pulse 2s infinite;">
                            <strong>Project:</strong> <span id="applyProjectTitle">Loading...</span>
                        </div>
                    </div>
                </div>
                <div class="apply-modal-footer">
                    <button class="btn btn-outline" id="cancelApplyBtn">Cancel</button>
                    <button class="btn btn-primary" id="submitApplyBtn">Submit Application</button>
                </div>
            </div>
        </div>
    `;
    
    if (!document.getElementById('applyModal')) {
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        
        document.getElementById('closeApplyModal').addEventListener('click', closeApplyModal);
        document.getElementById('cancelApplyBtn').addEventListener('click', closeApplyModal);
        document.getElementById('submitApplyBtn').addEventListener('click', submitApplication);
        
        document.getElementById('applyModal').addEventListener('click', function(e) {
            if (e.target === this) closeApplyModal();
        });
        
        // Add ripple effect to buttons
        ['closeApplyModal', 'cancelApplyBtn', 'submitApplyBtn'].forEach(id => {
            const btn = document.getElementById(id);
            if (btn) {
                btn.addEventListener('click', function(e) {
                    createRipple(this, e);
                });
            }
        });
    }
}

function openApplyModal(projectId) {
    createApplyModal();
    
    const project = pc_projects.find(p => p.id === projectId);
    if (!project) return;
    
    currentApplyProject = project;
    document.getElementById('applyProjectTitle').textContent = project.title;
    
    const modal = document.getElementById('applyModal');
    modal.style.display = 'flex';
    
    // Reset animations
    const modalContent = modal.querySelector('.apply-modal-content');
    modal.classList.remove('closing');
    modalContent.classList.remove('closing');
    
    // Trigger reflow
    void modal.offsetWidth;
    
    // Add opening animation
    setTimeout(() => {
        modal.classList.add('show');
        modalContent.style.animation = 'modalSlideUp 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
    }, 10);
}

function closeApplyModal() {
    const modal = document.getElementById('applyModal');
    const modalContent = modal.querySelector('.apply-modal-content');
    
    modalContent.style.animation = 'modalSlideDown 0.3s cubic-bezier(0.6, -0.28, 0.735, 0.045)';
    modal.classList.remove('show');
    
    setTimeout(() => {
        modal.style.display = 'none';
        modalContent.style.animation = '';
        currentApplyProject = null;
    }, 300);
}

function submitApplication() {
    const name = document.getElementById('applyName').value.trim();
    const github = document.getElementById('applyGithub').value.trim();
    const skills = document.getElementById('applySkills').value.trim();
    const comment = document.getElementById('applyComment').value.trim();
    
    if (!name || !github || !skills) {
        // Animate validation errors
        const inputs = [document.getElementById('applyName'), 
                       document.getElementById('applyGithub'), 
                       document.getElementById('applySkills')];
        inputs.forEach(input => {
            if (!input.value.trim()) {
                input.classList.add('shake');
                input.style.borderColor = 'var(--danger)';
                setTimeout(() => {
                    input.classList.remove('shake');
                    input.style.borderColor = '';
                }, 500);
            }
        });
        showEnhancedNotification('Please fill in all required fields', 'error');
        return;
    }
    
    if (!currentApplyProject) {
        showEnhancedNotification('No project selected', 'error');
        return;
    }
    
    const req = {
        id: "req_" + Date.now(),
        projectId: currentApplyProject.id,
        applicantName: name,
        github: github,
        comment: comment,
        skills: skills.split(',').map(s => s.trim()).filter(Boolean)
    };
    
    pc_requests.unshift(req);
    
    const applyBtn = document.querySelector(`[data-project-id="${currentApplyProject.id}"]`);
    if (applyBtn) {
        // Animate button change
        applyBtn.style.transition = 'all 0.3s ease';
        applyBtn.innerHTML = '<i class="fas fa-check-circle"></i> Applied ✓';
        applyBtn.classList.remove("btn-primary");
        applyBtn.classList.add("btn-outline");
        applyBtn.disabled = true;
        
        applyBtn.classList.add('pulse');
        setTimeout(() => {
            applyBtn.classList.remove('pulse');
        }, 1500);
    }
    
    pc_renderIncomingRequests();
    pc_renderMyProjects();
    
    // Show success animation before closing
    showSuccessAnimation();
    
    setTimeout(() => {
        closeApplyModal();
        showEnhancedNotification("Application submitted successfully!", "success");
    }, 800);
}

/* =========================================================
   PROJECT COLLABORATION - CORE FUNCTIONS - ENHANCED
========================================================= */
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
            <div class="no-requests" style="text-align: center; padding: 40px 20px; color: var(--gray);">
                <i class="fas fa-inbox" style="font-size: 3rem; opacity: 0.3; margin-bottom: 15px;"></i>
                <p>No incoming requests yet</p>
            </div>`;
        return;
    }

    mine.forEach((r, index) => {
        const proj = pc_projects.find(p => p.id === r.projectId);
        container.innerHTML += `
        <div class="request-card clean-request-card" data-request-id="${r.id}" 
             style="animation: fadeIn 0.5s ${index * 0.1}s both;">
            <div class="req-top">
                <div>
                    <div class="req-name">${r.applicantName}</div>
                    <div class="req-project">applied for <strong>${proj.title}</strong></div>
                </div>
                <button class="btn btn-outline btn-small pc-analyse-btn" data-request-id="${r.id}">
                    <i class="fas fa-chart-line"></i> Analyse Skill
                </button>
            </div>
            <div class="req-comment">${r.comment || ""}</div>
            <div class="req-skills-text">
                <strong>Skills:</strong> ${r.skills.join(", ")}
            </div>
            <a href="${r.github}" target="_blank" class="btn btn-outline btn-small req-github-btn">
                <i class="fab fa-github"></i> GitHub
            </a>
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
        <div class="project-card-custom no-projects-msg" style="color:var(--gray); padding:30px; text-align: center; animation: fadeIn 0.5s;">
            <i class="fas fa-project-diagram" style="font-size: 3rem; opacity: 0.3; margin-bottom: 15px;"></i>
            <p>You haven't posted any projects yet.</p>
            <p style="font-size: 0.9rem; margin-top: 10px;">Use the form on the right to add a project.</p>
        </div>`;
        return;
    }

    mine.forEach((p, index) => {
        const team = (p.team || []).map(m => `<span class="skill-tag" style="animation: fadeIn 0.5s;">${m}</span>`).join("");
        container.innerHTML += `
        <div class="project-card-custom" style="animation: fadeIn 0.5s ${index * 0.1}s both;">
            <div style="display: flex; justify-content: space-between; align-items: start;">
                <strong style="font-size: 1.1rem; color: var(--primary);">${p.title}</strong>
                <span class="project-status status-approved" style="animation: pulse 2s infinite;">Approved</span>
            </div>
            <div style="color: var(--gray); font-size:0.9rem; margin-top:6px; line-height: 1.5;">
                ${p.description}
            </div>
            <div style="margin-top:10px;">
                <strong>Skills:</strong> ${p.skills.join(", ")}
            </div>
            <div style="margin-top:8px;">
                <strong>Roles Needed:</strong> ${p.roles || "None"}
            </div>
            <div style="margin-top:8px;">
                <strong>Team:</strong> ${team || '<span style="color:var(--gray)">No members yet</span>'}
            </div>
            ${p.github ? `
            <div style="margin-top:12px;">
                <a href="${p.github}" class="btn btn-outline btn-small" target="_blank" style="animation: float 3s ease-in-out infinite;">
                    <i class="fab fa-github"></i> View on GitHub
                </a>
            </div>` : ""}
        </div>
        `;
    });
}

function pc_renderProjectFeed() {
    const container = document.getElementById('projectFeedList');
    if (!container) return;

    container.innerHTML = "";
    const myName = currentUser ? currentUser.name : "You";
    const others = pc_projects.filter(p => p.owner !== myName);

    if (others.length === 0) {
        container.innerHTML = `
            <div class="project-card-custom" style="color:var(--gray); text-align: center; padding: 30px; animation: fadeIn 0.5s;">
                <i class="fas fa-search" style="font-size: 3rem; opacity: 0.3; margin-bottom: 15px;"></i>
                <p>No projects posted by others yet.</p>
            </div>`;
        return;
    }

    others.forEach((p, index) => {
        container.innerHTML += `
        <div class="project-card-custom" style="animation: fadeIn 0.5s ${index * 0.1}s both;">
            <div class="project-owner">
                <div class="avatar" style="animation: float 3s ease-in-out infinite;">${p.owner.charAt(0)}</div>
                <div style="flex:1;">
                    <div style="font-weight:600; color: var(--primary);">${p.title}</div>
                    <div style="color:var(--gray); font-size:0.9rem;">by ${p.owner}</div>
                </div>
                <button class="btn btn-primary pc-apply-btn" data-project-id="${p.id}">
                    <i class="fas fa-paper-plane"></i> Apply to Join
                </button>
            </div>
            <div style="color: var(--gray); margin-top:8px; line-height: 1.5;">${p.description}</div>
            <div style="margin-top:8px;">
                <strong>Skills:</strong> ${p.skills.join(", ")}
            </div>
            <div style="margin-top:8px;">
                <strong>Roles:</strong> ${p.roles || "None"}
            </div>
        </div>
        `;
    });
}

function pc_initializeDemoContent() {
    if (pc_projects.length) return;

    pc_projects = [
        {
            id: "demo_1",
            owner: "Jasmeet Khanwani",
            title: "Smart Timetable Optimizer",
            description: "Optimize student timetables using ML and constraints.",
            github: "",
            skills: ["Python", "OR-Tools"],
            roles: "ML Engineer",
            team: []
        },
        {
            id: "demo_2",
            owner: "Aditi Dube",
            title: "Campus Events Portal",
            description: "Events listing & registration platform.",
            github: "",
            skills: ["React", "Node.js"],
            roles: "Frontend / Backend",
            team: []
        }
    ];

    pc_requests = [
        {
            id: "demo_req_1",
            projectId: "demo_2",
            applicantName: "Namita Shastri",
            github: "https://github.com/example/alex",
            comment: "I can help with frontend UI.",
            skills: ["React", "Firebase"]
        }
    ];
}

function pc_addTestRequests() {
    const myName = currentUser ? currentUser.name : "You";

    const testProj = {
        id: "proj_test",
        owner: myName,
        title: "AI Chatbot for College",
        description: "AI chatbot to answer college FAQs.",
        github: "https://github.com/college/chatbot",
        skills: ["Python", "NLP"],
        roles: "ML Engineer",
        team: []
    };

    if (!pc_projects.find(p => p.id === "proj_test")) {
        pc_projects.unshift(testProj);
    }

    const r1 = {
        id: "req_test_01",
        projectId: "proj_test",
        applicantName: "Saksham Dubey",
        github: "https://github.com/rohan/ai-projects",
        comment: "I have ML experience and want to contribute.",
        skills: ["Python", "TensorFlow"]
    };

    const r2 = {
        id: "req_test_02",
        projectId: "proj_test",
        applicantName: "Janak Parmar",
        github: "https://github.com/aisha/react-dashboard",
        comment: "I can help with frontend UI and design.",
        skills: ["React", "UI/UX"]
    };

    if (!pc_requests.find(r => r.id === "req_test_01")) pc_requests.push(r1);
    if (!pc_requests.find(r => r.id === "req_test_02")) pc_requests.push(r2);
}

function pc_onProjectsPageShow() {
    pc_initializeDemoContent();
    pc_addTestRequests();
    pc_renderMyProjects();
    pc_renderProjectFeed();
    pc_renderIncomingRequests();
    
    const projectContainers = [
        document.getElementById('myProjectsList'),
        document.getElementById('projectFeedList'),
        document.getElementById('incomingRequestsList')
    ];
    
    projectContainers.forEach(container => {
        if (container && !container.classList.contains('scrollable-content')) {
            container.classList.add('scrollable-content');
        }
    });
    
    createApplyModal();
}

/* =========================================================
   LINKEDIN INTEGRATION
========================================================= */
function initializeLinkedInButtons() {
    const studentConnectBtn = document.getElementById('connectStudentLinkedinBtn');
    const studentViewBtn = document.getElementById('viewStudentLinkedinBtn');
    const facultyConnectBtn = document.getElementById('connectFacultyLinkedinBtn');
    const facultyViewBtn = document.getElementById('viewFacultyLinkedinBtn');
    
    if (studentConnectBtn) studentConnectBtn.addEventListener('click', () => connectLinkedIn('student'));
    if (studentViewBtn) studentViewBtn.addEventListener('click', () => viewLinkedInProfile('student'));
    if (facultyConnectBtn) facultyConnectBtn.addEventListener('click', () => connectLinkedIn('faculty'));
    if (facultyViewBtn) facultyViewBtn.addEventListener('click', () => viewLinkedInProfile('faculty'));
    
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
        showSuccessAnimation();
        showEnhancedNotification(`${role.charAt(0).toUpperCase() + role.slice(1)} LinkedIn profile connected!`, 'success');
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
                <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin-bottom: 15px; animation: fadeIn 0.5s;">
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
                <div class="linkedin-stats" style="animation: fadeIn 0.5s 0.2s both;">
                    <div class="linkedin-stat">
                        <div class="linkedin-stat-value">${profile.connections}+</div>
                        <div class="linkedin-stat-label">Connections</div>
                    </div>
                    <div class="linkedin-stat">
                        <div class="linkedin-stat-value">${profile.followers}</div>
                        <div class="linkedin-stat-label">Followers</div>
                    </div>
                </div>
                <div style="margin-top: 20px; font-size: 0.9rem; animation: fadeIn 0.5s 0.3s both;">
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
                animation: overlayFadeIn 0.3s ease-out;
            `;
            
            modal.innerHTML = `
                <div style="background: white; padding: 25px; border-radius: 15px; max-width: 500px; width: 90%; max-height: 80vh; overflow-y: auto; animation: modalSlideUp 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                        <h3 style="margin: 0; color: #0077B5;">LinkedIn Profile Preview</h3>
                        <button onclick="this.closest('.modal-overlay').remove()" style="background: none; border: none; font-size: 1.5rem; cursor: pointer; color: var(--gray); transition: all 0.3s;">&times;</button>
                    </div>
                    ${modalContent}
                    <div style="margin-top: 20px; text-align: right;">
                        <button onclick="window.open('${profile.profileUrl}', '_blank'); this.closest('.modal-overlay').remove();" 
                                style="background: #0077B5; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer; margin-right: 10px; transition: all 0.3s;">
                            <i class="fab fa-linkedin"></i> Open in New Tab
                        </button>
                        <button onclick="this.closest('.modal-overlay').remove()" 
                                style="background: var(--gray); color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer; transition: all 0.3s;">
                            Close
                        </button>
                    </div>
                </div>
            `;
            
            document.body.appendChild(modal);
            modal.addEventListener('click', function(e) {
                if (e.target === this) this.remove();
            });
        }
    } else {
        showEnhancedNotification('LinkedIn profile not connected yet', 'error');
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
            <span class="linkedin-connected" style="animation: fadeIn 0.5s;">
                <i class="fas fa-check-circle"></i> Connected
            </span>
            <br>
            <small style="color: var(--gray);">Last synced: Just now</small>
        `;
        connectBtn.style.display = 'none';
        if (viewBtn) {
            viewBtn.style.display = 'block';
            viewBtn.classList.add('pulse');
            setTimeout(() => viewBtn.classList.remove('pulse'), 2000);
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
        if (viewBtn) viewBtn.style.display = 'none';
    }
}

function initializeLinkedInOnDashboardLoad() {
    if (currentRole) updateLinkedInUI(currentRole);
}

/* =========================================================
   ANIMATION UTILITIES
========================================================= */
function showSuccessAnimation() {
    // Create confetti
    for (let i = 0; i < 20; i++) {
        createConfetti();
    }
}

function createConfetti() {
    const confetti = document.createElement('div');
    confetti.className = 'confetti';
    
    // Random position
    confetti.style.left = Math.random() * 100 + 'vw';
    
    // Random color
    const colors = ['#8B5FBF', '#6C4AB6', '#FF9E9E', '#4A90E2', '#FFBD35', '#4A6FA5'];
    confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
    
    // Random size
    const size = Math.random() * 10 + 5;
    confetti.style.width = size + 'px';
    confetti.style.height = size + 'px';
    
    // Random animation duration
    confetti.style.animationDuration = (Math.random() * 2 + 1) + 's';
    
    // Random rotation
    confetti.style.transform = `rotate(${Math.random() * 360}deg)`;
    
    document.body.appendChild(confetti);
    
    // Remove after animation
    setTimeout(() => {
        confetti.remove();
    }, 3000);
}

// Ripple effect for buttons
function createRipple(button, event) {
    const circle = document.createElement("span");
    const diameter = Math.max(button.clientWidth, button.clientHeight);
    const radius = diameter / 2;

    circle.style.width = circle.style.height = `${diameter}px`;
    circle.style.left = `${event.clientX - button.getBoundingClientRect().left - radius}px`;
    circle.style.top = `${event.clientY - button.getBoundingClientRect().top - radius}px`;
    circle.classList.add("ripple");

    const ripple = button.getElementsByClassName("ripple")[0];
    if (ripple) {
        ripple.remove();
    }

    button.appendChild(circle);
    
    // Remove ripple after animation
    setTimeout(() => {
        circle.remove();
    }, 600);
}

/* =========================================================
   CORE EVENT HANDLERS
========================================================= */
loginBtn.addEventListener('click', handleLogin);
logoutBtn.addEventListener('click', handleLogout);

roleBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
        createRipple(btn, e);
        
        roleBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentRole = btn.getAttribute('data-role');
    });
});

navLinks.forEach(link => {
    link.addEventListener('click', e => {
        e.preventDefault();
        
        // Add ripple effect
        createRipple(link, e);
        
        const page = e.target.getAttribute('data-page');
        showPage(page);

        navLinks.forEach(nav => nav.classList.remove('active'));
        e.target.classList.add('active');
    });
});

// Hide role-specific pages & buttons
function applyRoleBasedUI(role) {
    document.querySelectorAll('.nav-link[data-page="clubs"]').forEach(el => {
        el.style.display = role === 'faculty' ? 'none' : '';
    });

    document.querySelectorAll('.nav-link[data-page="skill-summary"]').forEach(el => {
        el.style.display = role === 'student' ? 'none' : '';
    });

    const exploreClubsBtn = document.getElementById('exploreClubsBtn');
    if (exploreClubsBtn) exploreClubsBtn.style.display = role === 'faculty' ? 'none' : '';

    const exploreSkillSummaryBtn = document.getElementById('exploreskill-summaryBtn');
    if (exploreSkillSummaryBtn) exploreSkillSummaryBtn.style.display = role === 'student' ? 'none' : '';

    if (role === 'faculty') document.getElementById('clubs-page')?.classList.remove('active');
    if (role === 'student') document.getElementById('skill-summary-page')?.classList.remove('active');
}

function showPage(pageId) {
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
    if (pageEl) pageEl.classList.add('active');

    if (pageId === 'network') setTimeout(initializeNetworkPage, 100);
    if (pageId === 'clubs') setTimeout(() => {
        initializeJoinClubButtons();
        updateMyClubsUI();
    }, 100);
    if (pageId === 'projects') setTimeout(pc_onProjectsPageShow, 150);
    if (pageId === 'events') setTimeout(initializeEventsPage, 100);
}

function handleLogin() {
    const email = document.getElementById('loginEmail').value;
    const pass = document.getElementById('loginPassword').value;

    if (!email || !pass) {
        // Animate empty fields
        const inputs = [document.getElementById('loginEmail'), document.getElementById('loginPassword')];
        inputs.forEach(input => {
            if (!input.value.trim()) {
                input.classList.add('shake');
                input.style.borderColor = 'var(--danger)';
                setTimeout(() => {
                    input.classList.remove('shake');
                    input.style.borderColor = '';
                }, 500);
            }
        });
        showEnhancedNotification('Please fill in all fields', 'error');
        return;
    }

    if (email === demoAccounts[currentRole].email &&
        pass === demoAccounts[currentRole].password) {

        currentUser = demoAccounts[currentRole];
        showDashboard();
        showSuccessAnimation();
        showEnhancedNotification(`Welcome ${currentUser.name}!`, 'success');
    } else {
        // Shake animation for invalid login
        const loginCard = document.querySelector('.login-card');
        loginCard.classList.add('shake');
        setTimeout(() => loginCard.classList.remove('shake'), 500);
        showEnhancedNotification('Invalid email or password', 'error');
    }
}

function showDashboard() {
    mainHeader.classList.remove('hidden');
    mainFooter.classList.remove('hidden');
    applyRoleBasedUI(currentRole);
    pages.forEach(p => p.classList.remove('active'));
    document.getElementById('login-page').classList.remove('active');

    const cfg = ROLE_CONFIG[currentRole];
    document.getElementById(cfg.dashboardId).classList.add('active');
    document.getElementById(cfg.nameId).textContent = currentUser.name;
    document.getElementById(cfg.titleId).textContent = currentUser.title;

    navLinks.forEach(n => n.classList.remove('active'));
    document.querySelector('[data-page="dashboard"]').classList.add('active');

    setTimeout(initializeSkills, 100);
    initializeLinkedInButtons();
    setTimeout(initializeLinkedInOnDashboardLoad, 150);
    
    if (currentRole === 'student') {
        setTimeout(moveGitHubAnalysisToRightPanel, 200);
    }
}

function handleLogout() {
    // Close any open modals
    closeProfileEditModal();
    closeSkillModal();
    closeEnhanceModal();
    closeApplyModal();
    
    // Animation for logout
    document.body.style.opacity = '0.8';
    document.body.style.transition = 'opacity 0.3s';
    
    setTimeout(() => {
        currentUser = null;
        mainHeader.classList.add('hidden');
        mainFooter.classList.add('hidden');

        pages.forEach(p => p.classList.remove('active'));
        document.getElementById('login-page').classList.add('active');

        document.getElementById('loginEmail').value = '';
        document.getElementById('loginPassword').value = '';
        applyRoleBasedUI('student');
        
        document.body.style.opacity = '';
        showEnhancedNotification('Logged out successfully', 'info');
    }, 300);
}

/* =========================================================
   EVENT DELEGATION FOR DYNAMIC ELEMENTS
========================================================= */
document.addEventListener('click', function (e) {
    // Add ripple effect to all buttons
    if (e.target.closest('.btn:not([disabled])')) {
        const btn = e.target.closest('.btn');
        createRipple(btn, e);
    }
    
    // Project collaboration apply button
    if (e.target.closest('.pc-apply-btn')) {
        e.preventDefault();
        const btn = e.target.closest('.pc-apply-btn');
        const projectId = btn.getAttribute('data-project-id');
        
        if (!currentUser) {
            showEnhancedNotification("Please login to apply", "error");
            return;
        }
        
        openApplyModal(projectId);
    }

    // Project collaboration accept button
    if (e.target.closest('.pc-accept-btn')) {
        const btn = e.target.closest('.pc-accept-btn');
        const id = btn.getAttribute('data-request-id');
        const req = pc_requests.find(r => r.id === id);
        const proj = pc_projects.find(p => p.id === req.projectId);

        // Animation for acceptance
        btn.innerHTML = '<i class="fas fa-check"></i> Accepted';
        btn.classList.remove('btn-primary');
        btn.classList.add('btn-success');
        btn.disabled = true;
        
        proj.team.push(req.applicantName);
        pc_requests = pc_requests.filter(r => r.id !== id);

        setTimeout(() => {
            pc_renderMyProjects();
            pc_renderIncomingRequests();
            pc_renderProjectFeed();
            showSuccessAnimation();
            showEnhancedNotification(`${req.applicantName} added to team!`, "success");
        }, 300);
    }

    // Project collaboration decline button
    if (e.target.closest('.pc-decline-btn')) {
        const btn = e.target.closest('.pc-decline-btn');
        const id = btn.getAttribute('data-request-id');
        const req = pc_requests.find(r => r.id === id);
        
        // Animation for decline
        btn.innerHTML = '<i class="fas fa-times"></i> Declined';
        btn.classList.remove('btn-danger');
        btn.classList.add('btn-outline');
        btn.disabled = true;
        
        setTimeout(() => {
            pc_requests = pc_requests.filter(r => r.id !== id);
            pc_renderMyProjects();
            pc_renderIncomingRequests();
            showEnhancedNotification("Request declined", "error");
        }, 300);
    }

    // Project collaboration analyse button
    if (e.target.closest('.pc-analyse-btn')) {
        const id = e.target.closest('.pc-analyse-btn').getAttribute('data-request-id');
        const req = pc_requests.find(r => r.id === id);
        if (!req) return;

        // Show analysis modal
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Skill Analysis: ${req.applicantName}</h3>
                    <button class="modal-close">&times;</button>
                </div>
                <div class="modal-body">
                    <div style="text-align: center; padding: 20px;">
                        <div class="spinner" style="margin: 0 auto 20px;"></div>
                        <p>Analyzing ${req.applicantName}'s skills...</p>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-outline close-analysis">Close</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Simulate analysis
        setTimeout(() => {
            const modalBody = modal.querySelector('.modal-body');
            modalBody.innerHTML = `
                <h4>Skill Match Analysis</h4>
                <p><strong>Applicant:</strong> ${req.applicantName}</p>
                <p><strong>Skills:</strong> ${req.skills.join(', ')}</p>
                <div style="margin-top: 20px; padding: 15px; background: var(--light); border-radius: 10px;">
                    <strong>Match Score:</strong> <span style="color: var(--success); font-weight: bold;">85%</span>
                    <div class="progress-bar" style="margin-top: 10px;">
                        <div class="progress" style="width: 85%;"></div>
                    </div>
                </div>
                <div style="margin-top: 20px;">
                    <strong>Recommendation:</strong> Strong match for frontend development role.
                </div>
            `;
        }, 1500);
        
        // Close handlers
        modal.querySelector('.modal-close').addEventListener('click', () => modal.remove());
        modal.querySelector('.close-analysis').addEventListener('click', () => modal.remove());
        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.remove();
        });
    }

    // Faculty project approval
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
        
        // Animate approval
        projectCard.style.boxShadow = '0 0 20px rgba(40, 167, 69, 0.3)';
        setTimeout(() => {
            projectCard.style.boxShadow = '';
        }, 1000);

        showSuccessAnimation();
        showEnhancedNotification('Project approved successfully!', 'success');
    }

    // Faculty project rejection
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
        
        // Animate rejection
        projectCard.style.boxShadow = '0 0 20px rgba(220, 53, 69, 0.3)';
        setTimeout(() => {
            projectCard.style.boxShadow = '';
        }, 1000);

        showEnhancedNotification('Project rejected', 'error');
    }
});

/* =========================================================
   INITIALIZATION
========================================================= */
window.addEventListener('load', () => {
    console.log("INIT: Creating modals and initializing animations...");

    if (!document.getElementById("skillModal")) {
        console.log("Creating Skill Modal");
        createSkillModal();
    }

    if (!document.getElementById("enhanceModal")) {
        console.log("Creating Enhance Modal");
        createEnhanceModal();
    }

    if (!document.getElementById("profileEditModal")) {
        console.log("Creating Profile Edit Modal");
        createProfileEditModal();
    }

    // Initialize ripple effect for all buttons
    document.querySelectorAll('.btn').forEach(btn => {
        btn.addEventListener('click', function(e) {
            createRipple(this, e);
        });
    });

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
    
    // Move GitHub analysis if already on student dashboard
    if (document.querySelector('#student-dashboard.active')) {
        setTimeout(moveGitHubAnalysisToRightPanel, 200);
    }
    
    // Animate page load
    document.body.style.opacity = '0';
    document.body.style.transition = 'opacity 0.5s';
    setTimeout(() => {
        document.body.style.opacity = '1';
    }, 100);
});

// BIND AI BUTTONS
Object.values(ROLE_CONFIG).forEach(cfg => {
    document.getElementById(cfg.addSkillBtnId)?.addEventListener('click', openSkillModal);
    document.getElementById(cfg.aiBtnId)?.addEventListener('click', runAIAnalysis);
});

// UPDATED PROFILE EDIT BUTTONS - Now using enhanced modal
document.getElementById('editStudentProfileBtn')?.addEventListener('click', (e) => {
    createRipple(e.target, e);
    
    if (!currentUser) {
        showEnhancedNotification('Please login first', 'error');
        return;
    }
    
    openProfileEditModal('student');
});

document.getElementById('editFacultyProfileBtn')?.addEventListener('click', (e) => {
    createRipple(e.target, e);
    
    if (!currentUser) {
        showEnhancedNotification('Please login first', 'error');
        return;
    }
    
    openProfileEditModal('faculty');
});

// Project posting button
document.getElementById('pc_postProjectBtn')?.addEventListener('click', () => {
    const title = document.getElementById('pc_projTitle')?.value.trim();
    const desc = document.getElementById('pc_projDesc')?.value.trim();
    const repo = document.getElementById('pc_projGithub')?.value.trim();
    const skills = document.getElementById('pc_projSkills')?.value.trim().split(",").map(s => s.trim()).filter(Boolean);
    const roles = document.getElementById('pc_projRoles')?.value.trim();

    if (!title || !desc) {
        // Animate validation errors
        const inputs = [document.getElementById('pc_projTitle'), document.getElementById('pc_projDesc')];
        inputs.forEach(input => {
            if (!input.value.trim()) {
                input.classList.add('shake');
                input.style.borderColor = 'var(--danger)';
                setTimeout(() => {
                    input.classList.remove('shake');
                    input.style.borderColor = '';
                }, 500);
            }
        });
        showEnhancedNotification("Please enter project title and description", "error");
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
        team: []
    };

    pc_projects.unshift(newProj);
    pc_renderProjectFeed();
    pc_renderMyProjects();
    pc_renderIncomingRequests();

    showSuccessAnimation();
    showEnhancedNotification("Project posted successfully!", "success");

    // Clear form with animation
    const form = document.querySelector('.project-form-right');
    form.style.opacity = '0.5';
    setTimeout(() => {
        document.getElementById('pc_projTitle').value = "";
        document.getElementById('pc_projDesc').value = "";
        document.getElementById('pc_projGithub').value = "";
        document.getElementById('pc_projSkills').value = "";
        document.getElementById('pc_projRoles').value = "";
        form.style.opacity = '';
    }, 300);
});

// Explore buttons
document.getElementById('exploreClubsBtn')?.addEventListener('click', () => {
    showPage('clubs');
    navLinks.forEach(nav => nav.classList.remove('active'));
    document.querySelector('[data-page="clubs"]').classList.add('active');
});

// Click outside modals to close
document.addEventListener('click', (e) => {
    const skillModal = document.getElementById('skillModal');
    if (skillModal && e.target === skillModal) closeSkillModal();
    
    const enhanceModal = document.getElementById('enhanceModal');
    if (enhanceModal && e.target === enhanceModal) closeEnhanceModal();
    
    const applyModal = document.getElementById('applyModal');
    if (applyModal && e.target === applyModal) closeApplyModal();
    
    const profileEditModal = document.getElementById('profileEditModal');
    if (profileEditModal && e.target === profileEditModal) closeProfileEditModal();
});

// Simple accept/decline for generic connection requests
function acceptRequest(button) {
    const requestItem = button.closest('.request-item');
    const name = requestItem.querySelector('.post-user').textContent;

    requestItem.style.opacity = "0";
    requestItem.style.transform = "translateX(100%)";
    setTimeout(() => {
        requestItem.remove();
        showSuccessAnimation();
        showEnhancedNotification(`You are now connected with ${name}`, 'success');
    }, 300);
}

function declineRequest(button) {
    const requestItem = button.closest('.request-item');
    const name = requestItem.querySelector('.post-user').textContent;

    requestItem.style.opacity = "0";
    requestItem.style.transform = "translateX(-100%)";
    setTimeout(() => {
        requestItem.remove();
        showEnhancedNotification(`You declined ${name}'s request`, 'error');
    }, 300);
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

// Initialize enhanced animations
function initializeEnhancedAnimations() {
    console.log("Enhanced animations initialized");
    
    // Add CSS animations if not already added
    if (!document.querySelector('#enhanced-animations')) {
        const style = document.createElement('style');
        style.id = 'enhanced-animations';
        style.textContent = `
            .spin {
                animation: spin 1s linear;
            }
            .btn-success {
                background-color: var(--success) !important;
            }
            /* Profile Edit Modal Specific Styles */
            .profile-preview {
                margin-top: 20px;
                padding: 15px;
                background: var(--light);
                border-radius: 10px;
                border: 1px solid var(--border);
            }
            .profile-preview h4 {
                margin-bottom: 10px;
                color: var(--dark);
                font-size: 1rem;
            }
            .preview-profile-card {
                transition: all 0.3s ease;
            }
            .preview-profile-card:hover {
                transform: translateY(-3px);
                box-shadow: 0 5px 15px rgba(139, 95, 191, 0.1);
            }
            #profileEditModal .form-control {
                background: white;
                border: 2px solid var(--border);
                border-radius: 10px;
                padding: 12px 15px;
                font-size: 1rem;
                transition: all 0.3s ease;
            }
            #profileEditModal .form-control:focus {
                border-color: var(--primary);
                background: var(--light);
                box-shadow: 0 0 0 3px rgba(139, 95, 191, 0.2);
            }
            #profileEditModal textarea.form-control {
                min-height: 100px;
                resize: vertical;
            }
            #saveProfileBtn {
                position: relative;
                overflow: hidden;
            }
            #saveProfileBtn::after {
                content: '';
                position: absolute;
                top: 50%;
                left: 50%;
                width: 0;
                height: 0;
                border-radius: 50%;
                background: rgba(255, 255, 255, 0.3);
                transform: translate(-50%, -50%);
                transition: width 0.6s, height 0.6s;
            }
            #saveProfileBtn:hover::after {
                width: 300px;
                height: 300px;
            }
        `;
        document.head.appendChild(style);
    }
}

// Call initialization
initializeEnhancedAnimations();
