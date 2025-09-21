// Application state
let currentUser = null;
let isWalletConnected = false;
let currentPage = 'landing';

// Sample data from the application
const sampleData = {
  contractAddress: "0x5fbdb2315678afecb367f032d93f642f64180aa3",
  sampleWorkers: [
    {
      address: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
      score: 4.8,
      totalJobs: 247,
      jobs: [
        {"platform": "Uber", "rating": 5, "timestamp": "2025-09-20", "jobType": "Driver"},
        {"platform": "DoorDash", "rating": 4, "timestamp": "2025-09-19", "jobType": "Delivery"},
        {"platform": "TaskRabbit", "rating": 5, "timestamp": "2025-09-18", "jobType": "Assembly"},
        {"platform": "Fiverr", "rating": 5, "timestamp": "2025-09-17", "jobType": "Design"}
      ]
    },
    {
      address: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
      score: 4.2,
      totalJobs: 89,
      jobs: [
        {"platform": "Upwork", "rating": 4, "timestamp": "2025-09-20", "jobType": "Writing"},
        {"platform": "Uber", "rating": 5, "timestamp": "2025-09-19", "jobType": "Driver"},
        {"platform": "TaskRabbit", "rating": 3, "timestamp": "2025-09-18", "jobType": "Moving"}
      ]
    }
  ],
  platforms: ["Uber", "Lyft", "DoorDash", "Grubhub", "TaskRabbit", "Handy", "Fiverr", "Upwork", "Freelancer"],
  jobTypes: ["Driver", "Delivery", "Assembly", "Cleaning", "Moving", "Design", "Writing", "Programming", "Marketing", "Other"]
};

// Initialize application
document.addEventListener('DOMContentLoaded', function() {
  initializeApp();
  setupEventListeners();
  populateFormOptions();
});

function initializeApp() {
  // Check if user was previously connected (simulate localStorage)
  const savedUser = getCurrentUser();
  if (savedUser) {
    currentUser = savedUser;
    isWalletConnected = true;
    updateWalletUI();
  }
  
  showPage('landing');
}

function setupEventListeners() {
  // Navigation - use event delegation to handle dynamically created elements
  document.addEventListener('click', function(e) {
    // Handle navigation links
    if (e.target.hasAttribute('data-page')) {
      e.preventDefault();
      const page = e.target.getAttribute('data-page');
      showPage(page);
    }
    
    // Handle quick search buttons
    if (e.target.hasAttribute('data-address')) {
      e.preventDefault();
      const address = e.target.getAttribute('data-address');
      document.getElementById('search-address').value = address;
      searchWorker();
    }
  });

  // Wallet connection
  document.getElementById('wallet-btn').addEventListener('click', connectWallet);
  document.getElementById('connect-wallet-btn').addEventListener('click', connectWallet);

  // Registration
  document.getElementById('worker-registration').addEventListener('submit', registerWorker);

  // Add job form
  document.getElementById('add-job-form').addEventListener('submit', addJob);

  // Rating stars
  document.querySelectorAll('.star').forEach(star => {
    star.addEventListener('click', handleStarClick);
  });

  // Search functionality
  document.getElementById('search-btn').addEventListener('click', searchWorker);
  document.getElementById('search-address').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      searchWorker();
    }
  });

  // Modal handlers
  document.getElementById('success-ok-btn').addEventListener('click', closeModal);
  
  // Close modal when clicking backdrop
  document.querySelectorAll('.modal-backdrop').forEach(backdrop => {
    backdrop.addEventListener('click', function(e) {
      if (e.target === this) {
        closeModal();
      }
    });
  });
}

function showPage(pageName) {
  console.log('Navigating to page:', pageName);
  
  // Remove active class from all nav links
  document.querySelectorAll('.nav-link').forEach(link => {
    link.classList.remove('active');
  });
  
  // Add active class to current nav link
  const currentNavLink = document.querySelector(`[data-page="${pageName}"]`);
  if (currentNavLink && currentNavLink.classList.contains('nav-link')) {
    currentNavLink.classList.add('active');
  }

  // Hide all pages
  document.querySelectorAll('.page').forEach(page => {
    page.classList.remove('active');
  });
  
  // Show current page
  const targetPage = document.getElementById(`${pageName}-page`);
  if (targetPage) {
    targetPage.classList.add('active');
  }

  currentPage = pageName;

  // Page-specific initialization
  if (pageName === 'dashboard' && currentUser) {
    loadDashboardData();
  } else if (pageName === 'register') {
    updateRegistrationPage();
  }
  
  // Clear any existing alerts
  clearAlerts();
}

// Wallet Connection (Simulated)
async function connectWallet() {
  showLoadingModal('Connecting to MetaMask...');
  
  try {
    // Simulate wallet connection delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Simulate getting account
    const accounts = [
      '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
      '0x70997970C51812dc3A010C7d01b50e0d17dc79C8',
      '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC'
    ];
    
    const selectedAccount = accounts[Math.floor(Math.random() * accounts.length)];
    
    currentUser = {
      address: selectedAccount,
      isRegistered: sampleData.sampleWorkers.some(w => w.address === selectedAccount)
    };
    
    isWalletConnected = true;
    updateWalletUI();
    closeModal();
    
    showSuccessModal('Wallet connected successfully!');
    
    // If on register page, update the form
    if (currentPage === 'register') {
      updateRegistrationPage();
    }
    
  } catch (error) {
    closeModal();
    showErrorAlert('Failed to connect wallet. Please try again.');
  }
}

function updateWalletUI() {
  const walletBtn = document.getElementById('wallet-btn');
  
  if (isWalletConnected && currentUser) {
    walletBtn.textContent = `${currentUser.address.substring(0, 6)}...${currentUser.address.substring(38)}`;
    walletBtn.classList.remove('btn--primary');
    walletBtn.classList.add('btn--secondary');
  } else {
    walletBtn.textContent = 'Connect Wallet';
    walletBtn.classList.remove('btn--secondary');
    walletBtn.classList.add('btn--primary');
  }
}

function updateRegistrationPage() {
  const walletStatus = document.getElementById('wallet-status');
  const registerForm = document.getElementById('register-form');
  const walletAddressInput = document.getElementById('wallet-address');
  
  if (isWalletConnected && currentUser) {
    walletStatus.classList.add('hidden');
    registerForm.classList.remove('hidden');
    walletAddressInput.value = currentUser.address;
    
    if (currentUser.isRegistered) {
      registerForm.innerHTML = `
        <div class="alert alert-success">
          <strong>Already Registered!</strong> You are already registered as a worker. 
          <a href="#" data-page="dashboard" style="color: var(--color-primary); text-decoration: underline;">Go to Dashboard</a>
        </div>
      `;
    }
  } else {
    walletStatus.classList.remove('hidden');
    registerForm.classList.add('hidden');
  }
}

// Worker Registration
async function registerWorker(e) {
  e.preventDefault();
  
  if (!isWalletConnected) {
    showErrorAlert('Please connect your wallet first.');
    return;
  }
  
  const displayName = document.getElementById('display-name').value;
  if (!displayName.trim()) {
    showErrorAlert('Please enter a display name.');
    return;
  }
  
  showLoadingModal('Registering worker on blockchain...');
  
  try {
    // Simulate blockchain transaction
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Update user status
    currentUser.isRegistered = true;
    currentUser.displayName = displayName;
    currentUser.score = 0;
    currentUser.totalJobs = 0;
    currentUser.jobs = [];
    
    // Save user data
    saveCurrentUser(currentUser);
    
    closeModal();
    showSuccessModal('Worker registered successfully! You can now start adding jobs to build your reputation.');
    
    // Navigate to dashboard after success modal
    setTimeout(() => {
      closeModal();
      showPage('dashboard');
    }, 2000);
    
  } catch (error) {
    closeModal();
    showErrorAlert('Registration failed. Please try again.');
  }
}

// Dashboard Functions
function loadDashboardData() {
  if (!currentUser) {
    showErrorAlert('Please connect your wallet and register first.');
    return;
  }
  
  // Get worker data
  let workerData = sampleData.sampleWorkers.find(w => w.address === currentUser.address);
  
  if (!workerData && currentUser.isRegistered) {
    // New registered worker
    workerData = {
      address: currentUser.address,
      score: currentUser.score || 0,
      totalJobs: currentUser.totalJobs || 0,
      jobs: currentUser.jobs || []
    };
  }
  
  if (workerData) {
    // Update score display
    document.getElementById('user-score').textContent = workerData.score.toFixed(1);
    document.getElementById('total-jobs').textContent = workerData.totalJobs;
    document.getElementById('platforms-count').textContent = 
      new Set(workerData.jobs.map(job => job.platform)).size;
    
    // Update job list
    const jobList = document.getElementById('job-list');
    jobList.innerHTML = '';
    
    if (workerData.jobs.length === 0) {
      jobList.innerHTML = '<div class="alert alert-warning">No jobs added yet. <a href="#" data-page="add-job" style="color: var(--color-primary); text-decoration: underline;">Add your first job</a> to start building your reputation!</div>';
    } else {
      // Show recent jobs (last 5)
      const recentJobs = workerData.jobs.slice(0, 5);
      recentJobs.forEach(job => {
        const jobElement = createJobElement(job);
        jobList.appendChild(jobElement);
      });
    }
  } else {
    showErrorAlert('Worker data not found. Please register first.');
  }
}

function createJobElement(job) {
  const jobDiv = document.createElement('div');
  jobDiv.className = 'job-item';
  
  const stars = '⭐'.repeat(job.rating) + '☆'.repeat(5 - job.rating);
  
  jobDiv.innerHTML = `
    <div class="job-info">
      <div class="job-platform">${job.platform}</div>
      <div class="job-details">
        <h4>${job.jobType}</h4>
        <p>${job.timestamp}</p>
      </div>
    </div>
    <div class="job-rating">
      <span class="stars">${stars}</span>
      <span>${job.rating}/5</span>
    </div>
  `;
  
  return jobDiv;
}

// Add Job Functions
function populateFormOptions() {
  const platformSelect = document.getElementById('platform-select');
  const jobTypeSelect = document.getElementById('job-type-select');
  
  // Clear existing options (keep placeholder)
  platformSelect.innerHTML = '<option value="">Select platform...</option>';
  jobTypeSelect.innerHTML = '<option value="">Select job type...</option>';
  
  // Populate platforms
  sampleData.platforms.forEach(platform => {
    const option = document.createElement('option');
    option.value = platform;
    option.textContent = platform;
    platformSelect.appendChild(option);
  });
  
  // Populate job types
  sampleData.jobTypes.forEach(jobType => {
    const option = document.createElement('option');
    option.value = jobType;
    option.textContent = jobType;
    jobTypeSelect.appendChild(option);
  });
}

function handleStarClick(e) {
  const rating = parseInt(e.target.getAttribute('data-rating'));
  const stars = document.querySelectorAll('.star');
  
  // Update visual state
  stars.forEach((star, index) => {
    if (index < rating) {
      star.classList.add('active');
    } else {
      star.classList.remove('active');
    }
  });
  
  // Update hidden input
  document.getElementById('selected-rating').value = rating;
}

async function addJob(e) {
  e.preventDefault();
  
  if (!isWalletConnected || !currentUser || !currentUser.isRegistered) {
    showErrorAlert('Please connect wallet and register as a worker first.');
    return;
  }
  
  const platform = document.getElementById('platform-select').value;
  const jobType = document.getElementById('job-type-select').value;
  const rating = document.getElementById('selected-rating').value;
  const description = document.getElementById('job-description').value;
  
  if (!platform || !jobType || !rating) {
    showErrorAlert('Please fill in all required fields.');
    return;
  }
  
  showLoadingModal('Adding job to blockchain...');
  
  try {
    // Simulate blockchain transaction
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Create new job
    const newJob = {
      platform: platform,
      jobType: jobType,
      rating: parseInt(rating),
      timestamp: new Date().toISOString().split('T')[0],
      description: description
    };
    
    // Update user data
    if (!currentUser.jobs) currentUser.jobs = [];
    currentUser.jobs.unshift(newJob); // Add to beginning
    currentUser.totalJobs = (currentUser.totalJobs || 0) + 1;
    
    // Recalculate score
    const totalRating = currentUser.jobs.reduce((sum, job) => sum + job.rating, 0);
    currentUser.score = totalRating / currentUser.jobs.length;
    
    // Save data
    saveCurrentUser(currentUser);
    
    closeModal();
    showSuccessModal('Job added successfully! Your reputation has been updated.');
    
    // Reset form
    document.getElementById('add-job-form').reset();
    document.querySelectorAll('.star').forEach(star => star.classList.remove('active'));
    document.getElementById('selected-rating').value = '';
    
    // Update dashboard if we're on it
    if (currentPage === 'dashboard') {
      loadDashboardData();
    }
    
  } catch (error) {
    closeModal();
    showErrorAlert('Failed to add job. Please try again.');
  }
}

// Search Functions
function searchWorker() {
  const address = document.getElementById('search-address').value.trim();
  const resultsContainer = document.getElementById('search-results');
  
  if (!address) {
    showErrorAlert('Please enter a wallet address.');
    return;
  }
  
  // Validate address format (basic check)
  if (!address.startsWith('0x') || address.length !== 42) {
    showErrorAlert('Please enter a valid wallet address.');
    return;
  }
  
  // Show loading
  resultsContainer.innerHTML = '<div class="loading-spinner" style="margin: 40px auto;"></div>';
  
  setTimeout(() => {
    displaySearchResults(address, resultsContainer);
  }, 1500);
}

function displaySearchResults(address, container) {
  // Find worker data
  let workerData = sampleData.sampleWorkers.find(w => w.address.toLowerCase() === address.toLowerCase());
  
  // Check if it's current user
  if (currentUser && currentUser.address.toLowerCase() === address.toLowerCase()) {
    workerData = {
      address: currentUser.address,
      score: currentUser.score || 0,
      totalJobs: currentUser.totalJobs || 0,
      jobs: currentUser.jobs || []
    };
  }
  
  if (!workerData) {
    container.innerHTML = `
      <div class="alert alert-warning">
        <strong>Worker Not Found</strong><br>
        No worker found with address: ${address}<br>
        This worker may not be registered yet.
      </div>
    `;
    return;
  }
  
  // Create worker profile
  const profileDiv = document.createElement('div');
  profileDiv.className = 'worker-profile';
  
  const platforms = new Set(workerData.jobs.map(job => job.platform));
  const avgRating = workerData.jobs.length > 0 ? 
    (workerData.jobs.reduce((sum, job) => sum + job.rating, 0) / workerData.jobs.length).toFixed(1) : 
    '0.0';
  
  profileDiv.innerHTML = `
    <div class="worker-header">
      <div class="worker-address">${address}</div>
      <div class="worker-score">
        <span class="worker-rating">${avgRating}</span>
        <span class="stars">${'⭐'.repeat(Math.floor(parseFloat(avgRating)))}</span>
      </div>
    </div>
    
    <div class="worker-stats">
      <div class="worker-stat">
        <span class="worker-stat-value">${workerData.totalJobs || workerData.jobs.length}</span>
        <span class="worker-stat-label">Total Jobs</span>
      </div>
      <div class="worker-stat">
        <span class="worker-stat-value">${platforms.size}</span>
        <span class="worker-stat-label">Platforms</span>
      </div>
      <div class="worker-stat">
        <span class="worker-stat-value">${avgRating}</span>
        <span class="worker-stat-label">Avg Rating</span>
      </div>
    </div>
    
    <div class="worker-jobs">
      <h4>Recent Jobs</h4>
      <div class="job-list" id="worker-job-list"></div>
    </div>
  `;
  
  container.innerHTML = '';
  container.appendChild(profileDiv);
  
  // Add jobs to the profile
  const jobList = profileDiv.querySelector('#worker-job-list');
  if (workerData.jobs.length === 0) {
    jobList.innerHTML = '<p style="color: var(--color-text-secondary); text-align: center;">No jobs recorded yet.</p>';
  } else {
    workerData.jobs.slice(0, 5).forEach(job => {
      const jobElement = createJobElement(job);
      jobList.appendChild(jobElement);
    });
  }
}

// Modal Functions
function showLoadingModal(text) {
  document.getElementById('loading-text').textContent = text;
  document.getElementById('loading-modal').classList.remove('hidden');
}

function showSuccessModal(text) {
  document.getElementById('success-text').textContent = text;
  document.getElementById('success-modal').classList.remove('hidden');
}

function closeModal() {
  document.querySelectorAll('.modal').forEach(modal => {
    modal.classList.add('hidden');
  });
}

// Utility Functions
function showErrorAlert(message) {
  // Create alert element
  const alert = document.createElement('div');
  alert.className = 'alert alert-error';
  alert.innerHTML = `<strong>Error:</strong> ${message}`;
  
  // Insert at top of current page
  const currentPageEl = document.querySelector('.page.active');
  const container = currentPageEl.querySelector('.container');
  if (container) {
    container.insertBefore(alert, container.firstChild);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
      if (alert.parentNode) {
        alert.parentNode.removeChild(alert);
      }
    }, 5000);
  }
}

function clearAlerts() {
  document.querySelectorAll('.alert').forEach(alert => {
    if (!alert.classList.contains('alert-success') || !alert.innerHTML.includes('Already Registered')) {
      alert.remove();
    }
  });
}

function getCurrentUser() {
  // In a real app, this would check localStorage or wallet connection
  // For demo, we'll simulate some persistence
  return currentUser;
}

function saveCurrentUser(userData) {
  // In a real app, this would save to localStorage
  // For demo, we just update our in-memory user
  currentUser = userData;
  
  // Update sample data if it's one of our demo workers
  const existingWorker = sampleData.sampleWorkers.find(w => w.address === userData.address);
  if (existingWorker) {
    Object.assign(existingWorker, userData);
  }
}