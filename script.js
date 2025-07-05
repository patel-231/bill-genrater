document.addEventListener('DOMContentLoaded', () => {
    // --- Utility Functions (Keep these first) ---
    const getNumericValue = (elementId) => {
        const value = parseFloat(document.getElementById(elementId).value);
        return isNaN(value) ? 0 : value;
    };

    const formatCurrency = (value) => {
        // Formats to 2 decimal places, adding commas for thousands
        return value.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    };

    // --- DOM Elements (Group related elements) ---
    const billItemsBody = document.getElementById('bill-items-body');
    const addItemBtn = document.getElementById('add-item');
    const subtotalSpan = document.getElementById('subtotal');
    const taxRateInput = document.getElementById('tax-rate');
    const taxAmountSpan = document.getElementById('tax-amount');
    const discountRateInput = document.getElementById('discount-rate');
    const discountAmountSpan = document.getElementById('discount-amount');
    const grandTotalSpan = document.getElementById('grand-total');
    const generateBillBtn = document.getElementById('generate-bill');
    const resetFormBtn = document.getElementById('reset-form');
    const toggleDarkModeBtn = document.getElementById('toggle-dark-mode');
    const togglePanelBtn = document.getElementById('toggle-panel');
    const controlPanel = document.getElementById('control-panel');
    const saveCompanyDetailsBtn = document.getElementById('saveCompanyDetailsBtn');
    const companyDetailsModal = document.getElementById('companyDetailsModal');
    const closeCompanyDetailsModal = document.querySelector('#companyDetailsModal .modal-close-btn');
    const showCompanyDetailsModalBtn = document.getElementById('showCompanyDetailsModal');

    // Company details fields for saving
    const companyNameInput = document.getElementById('company-name');
    const companyAddressInput = document.getElementById('company-address');
    const companyPhoneInput = document.getElementById('company-phone');
    const companyEmailInput = document.getElementById('company-email');
    const companyGstInput = document.getElementById('company-gst');
    const showCompanyGstCheckbox = document.getElementById('show-company-gst');

    // Customer details fields
    const customerNameInput = document.getElementById('customer-name');
    const customerAddressInput = document.getElementById('customer-address');
    const customerPhoneInput = document.getElementById('customer-phone');
    const customerEmailInput = document.getElementById('customer-email');
    const customerGstInput = document.getElementById('customer-gst');
    const showCustomerGstCheckbox = document.getElementById('show-customer-gst');

    // Bill info fields
    const billNumberInput = document.getElementById('bill-number');
    const billDateInput = document.getElementById('bill-date');

    // Sign-In/Sign-Up Modal elements
    const signInModal = document.getElementById('signInModal');
    const closeSignInModal = document.querySelector('#signInModal .modal-close-btn');
    const showSignInModalBtn = document.getElementById('showSignInModal'); // For showing the sign-in modal
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    const signInBtn = document.getElementById('signInBtn');
    const toggleSignInSignUpBtn = document.getElementById('toggleSignInSignUp'); // Button to switch between Sign In/Sign Up
    const signInSignUpTitle = document.getElementById('signInSignUpTitle'); // Title in the modal
    const authMessage = document.getElementById('authMessage'); // Message for success/error

    // App control buttons for login/logout
    const loginStatusButton = document.getElementById('login-status-button'); // This button will dynamically show "Login" or "Logout"

    let isSignUpMode = false; // To track if the modal is in Sign Up mode

    // --- Local Storage Keys ---
    const LOCAL_STORAGE_COMPANY_DETAILS = 'billGeneratorCompanyDetails';
    const LOCAL_STORAGE_DARK_MODE = 'billGeneratorDarkMode';
    const LOCAL_STORAGE_USERS = 'billGeneratorUsers'; // Stores registered users
    const LOCAL_STORAGE_LOGGED_IN_USER = 'billGeneratorLoggedInUser'; // Stores currently logged-in user

    // --- Initial Load Functions ---

    // Load company details from Local Storage
    const loadCompanyDetails = () => {
        const storedDetails = JSON.parse(localStorage.getItem(LOCAL_STORAGE_COMPANY_DETAILS));
        if (storedDetails) {
            companyNameInput.value = storedDetails.name || '';
            companyAddressInput.value = storedDetails.address || '';
            companyPhoneInput.value = storedDetails.phone || '';
            companyEmailInput.value = storedDetails.email || '';
            companyGstInput.value = storedDetails.gst || '';
            showCompanyGstCheckbox.checked = storedDetails.showGst !== false; // Default to true if not set
            toggleCompanyGstVisibility();
        }
    };

    // Load dark mode preference
    const loadDarkMode = () => {
        const isDarkMode = localStorage.getItem(LOCAL_STORAGE_DARK_MODE) === 'true';
        if (isDarkMode) {
            document.body.classList.add('dark-mode');
        } else {
            document.body.classList.remove('dark-mode');
        }
    };

    // Initialize the bill date to today
    const initializeBillDate = () => {
        const today = new Date();
        const yyyy = today.getFullYear();
        const mm = String(today.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
        const dd = String(today.getDate()).padStart(2, '0');
        billDateInput.value = `${yyyy}-${mm}-${dd}`;
    };

    // --- Authentication Functions (New Backend Simulation) ---

    // A very basic (insecure) "hashing" for demonstration
    const simpleHash = (str) => {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash |= 0; // Convert to 32bit integer
        }
        return hash.toString();
    };

    // Register a new user
    const registerUser = () => {
        const username = usernameInput.value.trim();
        const password = passwordInput.value.trim();

        if (!username || !password) {
            authMessage.textContent = 'Username and password cannot be empty.';
            authMessage.style.color = 'red';
            return;
        }

        let users = JSON.parse(localStorage.getItem(LOCAL_STORAGE_USERS)) || {};

        if (users[username]) {
            authMessage.textContent = 'Username already exists. Please sign in or choose another.';
            authMessage.style.color = 'orange';
            return;
        }

        users[username] = simpleHash(password); // Store hashed password (insecurely)
        localStorage.setItem(LOCAL_STORAGE_USERS, JSON.stringify(users));

        authMessage.textContent = 'Registration successful! You can now sign in.';
        authMessage.style.color = 'green';
        usernameInput.value = '';
        passwordInput.value = '';
        isSignUpMode = false; // Switch back to sign-in mode
        updateSignInSignUpModal(); // Update modal UI
    };

    // Sign in a user
    const signInUser = () => {
        const username = usernameInput.value.trim();
        const password = passwordInput.value.trim();

        if (!username || !password) {
            authMessage.textContent = 'Username and password cannot be empty.';
            authMessage.style.color = 'red';
            return;
        }

        let users = JSON.parse(localStorage.getItem(LOCAL_STORAGE_USERS)) || {};

        if (users[username] && users[username] === simpleHash(password)) {
            localStorage.setItem(LOCAL_STORAGE_LOGGED_IN_USER, username);
            authMessage.textContent = `Welcome, ${username}!`;
            authMessage.style.color = 'green';
            setTimeout(() => {
                signInModal.style.display = 'none';
                updateLoginStatusButton(); // Update the Login/Logout button
            }, 1000); // Close modal after 1 second
            usernameInput.value = '';
            passwordInput.value = '';
        } else {
            authMessage.textContent = 'Invalid username or password.';
            authMessage.style.color = 'red';
        }
    };

    // Log out the current user
    const logoutUser = () => {
        localStorage.removeItem(LOCAL_STORAGE_LOGGED_IN_USER);
        updateLoginStatusButton(); // Update the Login/Logout button
        alert('You have been logged out.'); // Simple feedback
    };

    // Check if a user is logged in
    const isLoggedIn = () => {
        return localStorage.getItem(LOCAL_STORAGE_LOGGED_IN_USER) !== null;
    };

    // Get current logged in user
    const getLoggedInUser = () => {
        return localStorage.getItem(LOCAL_STORAGE_LOGGED_IN_USER);
    };

    // Update the text of the Login/Logout button
    const updateLoginStatusButton = () => {
        if (isLoggedIn()) {
            loginStatusButton.textContent = `Logout (${getLoggedInUser()})`;
            loginStatusButton.onclick = logoutUser;
        } else {
            loginStatusButton.textContent = 'Login';
            loginStatusButton.onclick = () => {
                isSignUpMode = false; // Ensure it opens in sign-in mode by default
                updateSignInSignUpModal();
                signInModal.style.display = 'flex';
                authMessage.textContent = ''; // Clear previous messages
            };
        }
    };

    // Update the modal's UI based on sign-up/sign-in mode
    const updateSignInSignUpModal = () => {
        if (isSignUpMode) {
            signInSignUpTitle.textContent = 'Sign Up';
            signInBtn.textContent = 'Register';
            toggleSignInSignUpBtn.textContent = 'Already have an account? Sign In';
            signInBtn.onclick = registerUser;
        } else {
            signInSignUpTitle.textContent = 'Sign In';
            signInBtn.textContent = 'Login';
            toggleSignInSignUpBtn.textContent = 'Don\'t have an account? Sign Up';
            signInBtn.onclick = signInUser;
        }
        authMessage.textContent = ''; // Clear messages when switching mode
        usernameInput.value = ''; // Clear inputs
        passwordInput.value = '';
    };

    // --- Core Bill Calculation and Management ---

    const calculateTotal = () => {
        let subtotal = 0;
        document.querySelectorAll('.item-row').forEach(row => {
            const quantity = parseFloat(row.querySelector('.item-quantity').value) || 0;
            const price = parseFloat(row.querySelector('.item-price').value) || 0;
            const total = quantity * price;
            row.querySelector('.item-total').textContent = formatCurrency(total);
            subtotal += total;
        });

        subtotalSpan.textContent = formatCurrency(subtotal);

        let taxRate = getNumericValue('tax-rate') / 100;
        let discountRate = getNumericValue('discount-rate') / 100;

        let taxAmount = subtotal * taxRate;
        let discountAmount = subtotal * discountRate;

        taxAmountSpan.textContent = formatCurrency(taxAmount);
        discountAmountSpan.textContent = formatCurrency(discountAmount);

        let grandTotal = subtotal + taxAmount - discountAmount;
        grandTotalSpan.textContent = formatCurrency(grandTotal);
    };

    const addItem = () => {
        const newRow = document.createElement('tr');
        newRow.classList.add('item-row');
        newRow.innerHTML = `
            <td><input type="text" class="item-description" value="New Item"></td>
            <td><input type="number" class="item-quantity" value="1" min="0"></td>
            <td><input type="number" class="item-price" value="0.00" min="0" step="0.01"></td>
            <td class="item-total">0.00</td>
            <td><button class="delete-item-btn">X</button></td>
        `;
        billItemsBody.appendChild(newRow);

        // Add event listeners for new inputs
        const quantityInput = newRow.querySelector('.item-quantity');
        const priceInput = newRow.querySelector('.item-price');
        const deleteButton = newRow.querySelector('.delete-item-btn');

        quantityInput.addEventListener('input', calculateTotal);
        priceInput.addEventListener('input', calculateTotal);
        deleteButton.addEventListener('click', () => {
            newRow.remove();
            calculateTotal();
        });

        calculateTotal(); // Recalculate totals after adding a new item
    };

    const generateBill = () => {
        window.print();
    };

    const resetForm = () => {
        if (confirm('Are you sure you want to reset the entire bill?')) {
            document.querySelectorAll('input[type="text"], input[type="number"], input[type="email"], input[type="date"]').forEach(input => {
                // Skip company details inputs if they were saved and we're not explicitly resetting them
                if (!input.classList.contains('company-detail-input')) {
                    input.value = '';
                }
            });
            billItemsBody.innerHTML = ''; // Clear all bill items
            addItem(); // Add one empty item by default
            taxRateInput.value = '0';
            discountRateInput.value = '0';
            initializeBillDate(); // Re-initialize date
            calculateTotal(); // Recalculate everything
            loadCompanyDetails(); // Reload saved company details (if any)
            customerGstInput.value = ''; // Ensure customer GST is cleared on reset
            showCustomerGstCheckbox.checked = true; // Reset customer GST visibility
            toggleCustomerGstVisibility(); // Apply visibility
        }
    };

    // --- Company Details Management ---
    const saveCompanyDetails = () => {
        // Only allow saving if logged in
        if (!isLoggedIn()) {
            alert('Please login to save company details.');
            return;
        }

        const companyDetails = {
            name: companyNameInput.value.trim(),
            address: companyAddressInput.value.trim(),
            phone: companyPhoneInput.value.trim(),
            email: companyEmailInput.value.trim(),
            gst: companyGstInput.value.trim(),
            showGst: showCompanyGstCheckbox.checked
        };
        localStorage.setItem(LOCAL_STORAGE_COMPANY_DETAILS, JSON.stringify(companyDetails));
        alert('Company details saved successfully!');
        companyDetailsModal.style.display = 'none'; // Close modal after saving
    };

    // Toggle visibility of Company GST input
    const toggleCompanyGstVisibility = () => {
        const inputGroup = companyGstInput.closest('.input-group');
        if (showCompanyGstCheckbox.checked) {
            inputGroup.style.display = 'block'; // Or 'flex' or 'grid' depending on layout
        } else {
            inputGroup.style.display = 'none';
        }
    };

    // Toggle visibility of Customer GST input
    const toggleCustomerGstVisibility = () => {
        const inputGroup = customerGstInput.closest('.input-group');
        if (showCustomerGstCheckbox.checked) {
            inputGroup.style.display = 'block';
        } else {
            inputGroup.style.display = 'none';
        }
    };


    // --- Event Listeners ---
    addItemBtn.addEventListener('click', addItem);
    generateBillBtn.addEventListener('click', generateBill);
    resetFormBtn.addEventListener('click', resetForm);

    // Recalculate total on tax or discount rate change
    taxRateInput.addEventListener('input', calculateTotal);
    discountRateInput.addEventListener('input', calculateTotal);

    // Dark Mode Toggle
    toggleDarkModeBtn.addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');
        // Save preference to Local Storage
        const isDarkMode = document.body.classList.contains('dark-mode');
        localStorage.setItem(LOCAL_STORAGE_DARK_MODE, isDarkMode);
    });

    // Control Panel Toggle (3D background)
    togglePanelBtn.addEventListener('click', () => {
        controlPanel.classList.toggle('hidden');
    });

    // Company Details Modal interactions
    showCompanyDetailsModalBtn.addEventListener('click', () => {
        // Prevent opening if not logged in
        if (!isLoggedIn()) {
            alert('Please login to manage company details.');
            // Optionally, open the sign-in modal directly
            // showSignInModalBtn.click();
            return;
        }
        companyDetailsModal.style.display = 'flex';
    });
    closeCompanyDetailsModal.addEventListener('click', () => {
        companyDetailsModal.style.display = 'none';
    });
    saveCompanyDetailsBtn.addEventListener('click', saveCompanyDetails);
    showCompanyGstCheckbox.addEventListener('change', toggleCompanyGstVisibility);

    // Customer GST visibility
    showCustomerGstCheckbox.addEventListener('change', toggleCustomerGstVisibility);


    // Sign-In Modal interactions
    showSignInModalBtn.addEventListener('click', () => {
        // This button now has its functionality handled by updateLoginStatusButton
        // It will either log you out or open the modal for login/signup
    });
    closeSignInModal.addEventListener('click', () => {
        signInModal.style.display = 'none';
    });
    toggleSignInSignUpBtn.addEventListener('click', () => {
        isSignUpMode = !isSignUpMode;
        updateSignInSignUpModal();
    });
    signInBtn.addEventListener('click', signInUser); // Default, will be overridden by updateSignInSignUpModal


    // Close modals if clicking outside
    window.addEventListener('click', (event) => {
        if (event.target == companyDetailsModal) {
            companyDetailsModal.style.display = 'none';
        }
        if (event.target == signInModal) {
            signInModal.style.display = 'none';
        }
    });

    // --- Initializations on Load ---
    addItem(); // Add one default item row when the page loads
    loadCompanyDetails(); // Load company details on page load
    loadDarkMode(); // Apply dark mode preference
    initializeBillDate(); // Set current date
    updateLoginStatusButton(); // Set initial text for login/logout button
    updateSignInSignUpModal(); // Set initial state of sign-in modal (default to sign-in)

    // Initial calculation (important for showing 0.00 if no items)
    calculateTotal();
});

// --- Three.js Background (Existing code) ---
// Initialize Three.js scene
let scene, camera, renderer, particles;
const initThree = () => {
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    renderer = new THREE.WebGLRenderer({ canvas: document.getElementById('three-background'), alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio); // Improve rendering quality on high-res displays

    // Create particles
    const geometry = new THREE.BufferGeometry();
    const vertices = [];
    const particleCount = 1000; // More particles for a denser effect

    for (let i = 0; i < particleCount; i++) {
        const x = (Math.random() - 0.5) * 2000;
        const y = (Math.random() - 0.5) * 2000;
        const z = (Math.random() - 0.5) * 2000;
        vertices.push(x, y, z);
    }

    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));

    const material = new THREE.PointsMaterial({
        color: 0x888888, // Grayish color
        size: 2, // Smaller particles
        transparent: true,
        blending: THREE.AdditiveBlending,
        map: generateSprite() // Use a custom sprite for softer particles
    });

    particles = new THREE.Points(geometry, material);
    scene.add(particles);

    camera.position.z = 5; // Start closer to the center
};

// Function to generate a soft, circular sprite
const generateSprite = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 16;
    canvas.height = 16;
    const context = canvas.getContext('2d');
    const gradient = context.createRadialGradient(
        canvas.width / 2,
        canvas.height / 2,
        0,
        canvas.width / 2,
        canvas.height / 2,
        canvas.width / 2
    );
    gradient.addColorStop(0, 'rgba(255,255,255,1)');
    gradient.addColorStop(0.2, 'rgba(128,128,128,1)'); // Softer center
    gradient.addColorStop(1, 'rgba(0,0,0,0)');
    context.fillStyle = gradient;
    context.fillRect(0, 0, canvas.width, canvas.height);
    return new THREE.CanvasTexture(canvas);
};


// Animation loop
const animateThree = () => {
    requestAnimationFrame(animateThree);

    // Rotate particles
    particles.rotation.x += 0.0005;
    particles.rotation.y += 0.0008;

    renderer.render(scene, camera);
};

// Handle window resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// Initialize Three.js if the canvas element exists
if (document.getElementById('three-background')) {
    // Check if THREE is defined. If not, load it or assume it's external.
    // For this example, we assume THREE is loaded via <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
    if (typeof THREE !== 'undefined') {
        initThree();
        animateThree();
    } else {
        console.warn("Three.js not loaded. Skipping background animation.");
        // Hide the canvas if Three.js is not available
        document.getElementById('three-background').style.display = 'none';
    }
}