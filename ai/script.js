// Enhanced JavaScript for Workify Enterprise Platform

document.addEventListener('DOMContentLoaded', function() {
  // Initialize UI components
  initializeRangeSlider();
  initializeEventListeners();
  initializeAnimations();
  initializeMobileMenu();
});

// Mobile menu functionality
function initializeMobileMenu() {
  const mobileMenuBtn = document.getElementById('mobileMenuBtn');
  const closeMobileMenu = document.getElementById('closeMobileMenu');
  const sidebar = document.getElementById('sidebar');
  const mobileOverlay = document.getElementById('mobileOverlay');
  
  function openMobileMenu() {
    sidebar.classList.add('open');
    mobileOverlay.classList.add('show');
    document.body.style.overflow = 'hidden'; // Prevent background scrolling
  }
  
  function closeMobileMenuHandler() {
    sidebar.classList.remove('open');
    mobileOverlay.classList.remove('show');
    document.body.style.overflow = ''; // Restore scrolling
  }
  
  if (mobileMenuBtn) {
    mobileMenuBtn.addEventListener('click', openMobileMenu);
  }
  
  if (closeMobileMenu) {
    closeMobileMenu.addEventListener('click', closeMobileMenuHandler);
  }
  
  if (mobileOverlay) {
    mobileOverlay.addEventListener('click', closeMobileMenuHandler);
  }
  
  // Close menu when clicking on a menu item (for mobile)
  const formalizerBtn = document.getElementById('formalizerBtn');
  if (formalizerBtn) {
    formalizerBtn.addEventListener('click', () => {
      if (window.innerWidth < 768) {
        closeMobileMenuHandler();
      }
    });
  }
  
  // Handle window resize
  window.addEventListener('resize', () => {
    if (window.innerWidth >= 768) {
      closeMobileMenuHandler();
    }
  });
}

// Range slider value display
function initializeRangeSlider() {
  const spicinessSlider = document.getElementById("spiciness");
  const spicinessValue = document.getElementById("spicinessValue");
  
  spicinessSlider.addEventListener("input", function() {
    spicinessValue.textContent = this.value;
  });
}

// Event listeners
function initializeEventListeners() {
  // Formalizer button - smooth scroll to tool
  document.getElementById("formalizerBtn").addEventListener("click", () => {
    document.getElementById("formalizerTool").scrollIntoView({ 
      behavior: 'smooth',
      block: 'center'
    });
  });

  // Submit button - process text
  document.getElementById("submitBtn").addEventListener("click", handleTextSubmission);
  
  // Copy button
  document.getElementById("copyBtn").addEventListener("click", handleCopyText);
  
  // Upgrade buttons
  const upgradeButtons = document.querySelectorAll('#upgradeBtn, .bg-white.text-primary-600');
  upgradeButtons.forEach(btn => {
    btn.addEventListener("click", handleUpgradeClick);
  });
  
  // Input text area - auto-resize and character count
  const inputTextArea = document.getElementById("inputText");
  inputTextArea.addEventListener("input", function() {
    this.style.height = 'auto';
    this.style.height = this.scrollHeight + 'px';
  });
}

// Handle text submission with loading states
async function handleTextSubmission() {
  const text = document.getElementById("inputText").value.trim();
  const conversion = document.getElementById("conversion").value;
  const spiciness = parseInt(document.getElementById("spiciness").value);
  const outputEl = document.getElementById("output");
  const outputContainer = document.getElementById("outputContainer");
  const submitBtn = document.getElementById("submitBtn");

  if (!text) {
    showNotification("Please enter some text to transform.", "warning");
    return;
  }

  // Show loading state
  submitBtn.innerHTML = '<i class="bi bi-arrow-clockwise animate-spin"></i><span>Transforming...</span>';
  submitBtn.disabled = true;
  
  outputEl.innerHTML = `
    <div class="flex items-center space-x-3 text-gray-500">
      <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600"></div>
      <span>AI is analyzing and transforming your text...</span>
    </div>
  `;
  outputContainer.classList.remove("hidden");
  outputContainer.classList.add("fade-in");

  try {
    const response = await fetch("https://goblin.tools/api/Formalizer", {
      method: "POST",
      headers: {
        "Accept": "*/*",
        "Content-Type": "application/json",
        "Origin": "https://goblin.tools",
        "Referer": "https://goblin.tools/Formalizer"
      },
      body: JSON.stringify({
        Text: text,
        Conversion: conversion,
        Spiciness: spiciness
      })
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} - ${response.statusText}`);
    }

    const result = await response.text();
    
    // Type-writer effect for result
    outputEl.textContent = "";
    typeWriterEffect(outputEl, result, 30);
    
    showNotification("Text transformed successfully!", "success");
    
    // Update usage counter (mock)
    updateUsageCounter();
    
  } catch (err) {
    outputEl.innerHTML = `
      <div class="flex items-center space-x-3 text-red-600">
        <i class="bi bi-exclamation-triangle text-xl"></i>
        <div>
          <div class="font-medium">Transform Failed</div>
          <div class="text-sm text-red-500">${err.message}</div>
        </div>
      </div>
    `;
    showNotification("Failed to transform text. Please try again.", "error");
  } finally {
    // Reset button state
    submitBtn.innerHTML = '<i class="bi bi-arrow-right-circle"></i><span>Transform Text</span>';
    submitBtn.disabled = false;
  }
}

// Enhanced copy functionality
function handleCopyText() {
  const outputText = document.getElementById("output").textContent;
  const copyBtn = document.getElementById("copyBtn");

  if (!outputText || outputText.includes("AI is analyzing")) {
    showNotification("No text to copy yet.", "warning");
    return;
  }

  navigator.clipboard.writeText(outputText).then(() => {
    // Animate copy success
    copyBtn.innerHTML = '<i class="bi bi-clipboard-check text-green-600"></i><span>Copied!</span>';
    copyBtn.classList.add('bg-green-50', 'border-green-200');
    
    setTimeout(() => {
      copyBtn.innerHTML = '<i class="bi bi-clipboard"></i><span>Copy</span>';
      copyBtn.classList.remove('bg-green-50', 'border-green-200');
    }, 2000);
    
    showNotification("Text copied to clipboard!", "success");
  }).catch(() => {
    showNotification("Failed to copy text.", "error");
  });
}

// Handle upgrade button clicks
function handleUpgradeClick() {
  showUpgradeModal();
}

// Typewriter effect for output
function typeWriterEffect(element, text, speed = 50) {
  let i = 0;
  element.textContent = "";
  
  function typeChar() {
    if (i < text.length) {
      element.textContent += text.charAt(i);
      i++;
      setTimeout(typeChar, speed);
    }
  }
  
  typeChar();
}

// Show notifications with proper stacking
function showNotification(message, type = "info") {
  // Create notification container if it doesn't exist
  let notificationContainer = document.getElementById('notification-container');
  if (!notificationContainer) {
    notificationContainer = document.createElement('div');
    notificationContainer.id = 'notification-container';
    notificationContainer.className = 'fixed top-4 right-4 z-50 space-y-3';
    document.body.appendChild(notificationContainer);
  }
  
  const notification = document.createElement('div');
  notification.className = `px-6 py-4 rounded-lg shadow-lg flex items-center space-x-3 transition-all transform translate-x-full opacity-0 max-w-sm`;
  
  let bgColor, iconClass, textColor;
  switch(type) {
    case 'success':
      bgColor = 'bg-green-500';
      iconClass = 'bi-check-circle';
      textColor = 'text-white';
      break;
    case 'error':
      bgColor = 'bg-red-500';
      iconClass = 'bi-exclamation-circle';
      textColor = 'text-white';
      break;
    case 'warning':
      bgColor = 'bg-yellow-500';
      iconClass = 'bi-exclamation-triangle';
      textColor = 'text-white';
      break;
    default:
      bgColor = 'bg-blue-500';
      iconClass = 'bi-info-circle';
      textColor = 'text-white';
  }
  
  notification.classList.add(bgColor, textColor);
  notification.innerHTML = `
    <i class="bi ${iconClass} flex-shrink-0"></i>
    <span class="font-medium">${message}</span>
  `;
  
  notificationContainer.appendChild(notification);
  
  // Animate in
  setTimeout(() => {
    notification.classList.remove('translate-x-full', 'opacity-0');
  }, 100);
  
  // Auto remove after 4 seconds
  setTimeout(() => {
    notification.classList.add('translate-x-full', 'opacity-0');
    setTimeout(() => {
      if (notification.parentNode) {
        notificationContainer.removeChild(notification);
      }
      // Remove container if empty
      if (notificationContainer.children.length === 0) {
        document.body.removeChild(notificationContainer);
      }
    }, 300);
  }, 4000);
}

// Mock usage counter update
function updateUsageCounter() {
  const usageElement = document.querySelector('.space-y-3 .font-medium');
  if (usageElement) {
    const current = parseInt(usageElement.textContent.split('/')[0]);
    const newCount = Math.min(current + 1, 5);
    usageElement.textContent = `${newCount}/5`;
    
    // Update progress bar
    const progressBar = document.querySelector('.bg-primary-500');
    if (progressBar) {
      progressBar.style.width = `${(newCount / 5) * 100}%`;
    }
    
    // Show upgrade prompt if limit reached
    if (newCount >= 5) {
      setTimeout(() => {
        showNotification("Daily limit reached! Upgrade to Pro for unlimited requests.", "warning");
      }, 1000);
    }
  }
}

// Show upgrade modal
function showUpgradeModal() {
  const modal = document.createElement('div');
  modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4';
  modal.innerHTML = `
    <div class="bg-white rounded-2xl p-8 max-w-md w-full space-y-6 transform transition-all">
      <div class="text-center">
        <div class="w-16 h-16 bg-gradient-to-r from-primary-500 to-primary-700 rounded-full flex items-center justify-center mx-auto mb-4">
          <i class="bi bi-star-fill text-white text-2xl"></i>
        </div>
        <h3 class="text-2xl font-bold text-gray-900 mb-2">Upgrade to Workify Pro</h3>
        <p class="text-gray-600">Unlock the full potential of AI-powered writing</p>
      </div>
      
      <div class="space-y-4">
        <div class="flex items-center space-x-3">
          <i class="bi bi-check-circle text-green-500"></i>
          <span class="text-gray-700">Unlimited text transformations</span>
        </div>
        <div class="flex items-center space-x-3">
          <i class="bi bi-check-circle text-green-500"></i>
          <span class="text-gray-700">No advertisements</span>
        </div>
        <div class="flex items-center space-x-3">
          <i class="bi bi-check-circle text-green-500"></i>
          <span class="text-gray-700">Priority customer support</span>
        </div>
        <div class="flex items-center space-x-3">
          <i class="bi bi-check-circle text-green-500"></i>
          <span class="text-gray-700">Advanced AI models</span>
        </div>
        <div class="flex items-center space-x-3">
          <i class="bi bi-check-circle text-green-500"></i>
          <span class="text-gray-700">Team collaboration features</span>
        </div>
      </div>
      
      <div class="text-center">
        <div class="text-3xl font-bold text-gray-900 mb-1">$5<span class="text-lg text-gray-500">/month</span></div>
        <p class="text-sm text-gray-500 mb-6">7-day free trial, cancel anytime</p>
        
        <button class="w-full bg-gradient-to-r from-primary-500 to-primary-700 text-white py-3 rounded-xl font-semibold hover:shadow-lg transition-all mb-3">
          Start Free Trial
        </button>
        <button id="closeModal" class="w-full text-gray-500 hover:text-gray-700 py-2">
          Maybe later
        </button>
      </div>
    </div>
  `;
  
  document.body.appendChild(modal);
  
  // Close modal functionality
  modal.querySelector('#closeModal').addEventListener('click', () => {
    document.body.removeChild(modal);
  });
  
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      document.body.removeChild(modal);
    }
  });
}

// Initialize smooth animations
function initializeAnimations() {
  // Intersection Observer for scroll animations
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('fade-in');
      }
    });
  }, observerOptions);
  
  // Observe elements for animation
  document.querySelectorAll('section, .card-hover').forEach(el => {
    observer.observe(el);
  });
}
