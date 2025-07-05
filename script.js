document.addEventListener('DOMContentLoaded', () => {
    // --- Utility Functions ---
    const getNumericValue = (elementId) => {
        const value = parseFloat(document.getElementById(elementId).value);
        return isNaN(value) ? 0 : value;
    };

    const formatCurrency = (value) => {
        return value.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    };

    // --- DOM Elements ---
    // Company details display fields (these are readonly in main view)
    const companyNameDisplay = document.getElementById('company-name');
    const companyAddressDisplay = document.getElementById('company-address');
    const companyPhoneDisplay = document.getElementById('company-phone');
    const companyEmailDisplay = document.getElementById('company-email');
    const companyGstDisplay = document.getElementById('company-gst');

    // Company details modal fields (these are editable)
    const modalCompanyNameInput = document.getElementById('modal-company-name');
    const modalCompanyAddressInput = document.getElementById('modal-company-address');
    const modalCompanyPhoneInput = document.getElementById('modal-company-phone');
    const modalCompanyEmailInput = document.getElementById('modal-company-email');
    const modalCompanyGstInput = document.getElementById('modal-company-gst');
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

    // Bill items and totals
    const billItemsBody = document.getElementById('bill-items-body');
    const addItemBtn = document.getElementById('add-item');
    const subtotalSpan = document.getElementById('subtotal');
    const taxRateInput = document.getElementById('tax-rate');
    const taxAmountSpan = document.getElementById('tax-amount');
    const discountRateInput = document.getElementById('discount-rate');
    const discountAmountSpan = document.getElementById('discount-amount');
    const grandTotalSpan = document.getElementById('grand-total');

    // Action buttons
    const generateBillBtn = document.getElementById('generate-bill');
    const resetFormBtn = document.getElementById('reset-form');

    // App controls
    const toggleDarkModeBtn = document.getElementById('toggle-dark-mode');
    const togglePanelBtn = document.getElementById('toggle-panel');
    const controlPanel = document.getElementById('control-panel');
    const showCompanyDetailsModalBtn = document.getElementById('showCompanyDetailsModal');
    const loginStatusButton = document.getElementById('login-status-button'); // This button dynamically shows "Login" or "Logout"

    // Company Details Modal elements
    const companyDetailsModal = document.getElementById('companyDetailsModal');
    const closeCompanyDetailsModal = companyDetailsModal.querySelector('.modal-close-btn');
    const saveCompanyDetailsBtn = document.getElementById('saveCompanyDetailsBtn');
    const clearCompanyDetailsBtn = document.getElementById('clearCompanyDetailsBtn'); // NEW

    // Sign-In/Sign-Up Modal elements
    const signInModal = document.getElementById('signInModal');
    const closeSignInModal = signInModal.querySelector('.modal-close-btn');
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    const signInBtn = document.getElementById('signInBtn'); // Main button inside sign-in modal
    const toggleSignInSignUpBtn = document.getElementById('toggleSignInSignUp'); // Button to switch modes
    const signInSignUpTitle = document.getElementById('signInSignUpTitle');
    const authMessage = document.getElementById('authMessage');

    let isSignUpMode = false; // To track if the modal is in Sign Up mode

    // --- Local Storage Keys ---
    const LOCAL_STORAGE_COMPANY_DETAILS = 'billGeneratorCompanyDetails';
    const LOCAL_STORAGE_DARK_MODE = 'billGeneratorDarkMode';
    const LOCAL_STORAGE_USERS = 'billGeneratorUsers';
    const LOCAL_STORAGE_LOGGED_IN_USER = 'billGeneratorLoggedInUser';

    // --- Initial Load Functions ---

    // Load company details from Local Storage and update display/modal inputs
    const loadCompanyDetails = () => {
        const storedDetails = JSON.parse(localStorage.getItem(LOCAL_STORAGE_COMPANY_DETAILS));
        if (storedDetails) {
            // Update display fields (readonly)
            companyNameDisplay.value = storedDetails.name || '';
            companyAddressDisplay.value = storedDetails.address || '';
            companyPhoneDisplay.value = storedDetails.phone || '';
            companyEmailDisplay.value = storedDetails.email || '';
            companyGstDisplay.value = storedDetails.gst || '';

            // Update modal fields (editable)
            modalCompanyNameInput.value = storedDetails.name || '';
            modalCompanyAddressInput.value = storedDetails.address || '';
            modalCompanyPhoneInput.value = storedDetails.phone || '';
            modalCompanyEmailInput.value = storedDetails.email || '';
            modalCompanyGstInput.value = storedDetails.gst || '';
            showCompanyGstCheckbox.checked = storedDetails.showGst !== false; // Default to true if not set
            toggleCompanyGstVisibility();
        } else {
             // Clear modal inputs if no details are stored
            modalCompanyNameInput.value = '';
            modalCompanyAddressInput.value = '';
            modalCompanyPhoneInput.value = '';
            modalCompanyEmailInput.value = '';
            modalCompanyGstInput.value = '';
            showCompanyGstCheckbox.checked = true; // Default checkbox to checked
            toggleCompanyGstVisibility();
        }
        // Set editability based on login status right after loading
        setCompanyDetailsEditability(isLoggedIn());
    };

    // Set company details inputs in the main view to be readonly or editable
    const setCompanyDetailsEditability = (editable) => {
        const companyDetailInputs = document.querySelectorAll('.company-detail-input');
        companyDetailInputs.forEach(input => {
            input.readOnly = !editable;
            if (editable) {
                input.style.backgroundColor = ''; // Reset background if it was changed
                input.style.cursor = '';
                input.title = 'Editable';
            } else {
                input.style.backgroundColor = '#e9ecef'; // Grey out if not editable
                input.style.cursor = 'not-allowed';
                input.title = 'Login to edit company details';
            }
        });
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
        const mm = String(today.getMonth() + 1).padStart(2, '0');
        const dd = String(today.getDate()).padStart(2, '0');
        billDateInput.value = `${yyyy}-${mm}-${dd}`;
    };

    // --- Authentication Functions (Local Storage Backend Simulation) ---

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

        users[username] = simpleHash(password);
        localStorage.setItem(LOCAL_STORAGE_USERS, JSON.stringify(users));

        authMessage.textContent = 'Registration successful! You can now sign in.';
        authMessage.style.color = 'green';
        usernameInput.value = '';
        passwordInput.value = '';
        isSignUpMode = false;
        updateSignInSignUpModal(); // Update modal UI to sign-in mode
    };

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
                updateLoginStatusButton();
                setCompanyDetailsEditability(true); // Make company details editable on login
            }, 1000);
            usernameInput.value = '';
            passwordInput.value = '';
        } else {
            authMessage.textContent = 'Invalid username or password.';
            authMessage.style.color = 'red';
        }
    };

    const logoutUser = () => {
        localStorage.removeItem(LOCAL_STORAGE_LOGGED_IN_USER);
        updateLoginStatusButton();
        setCompanyDetailsEditability(false); // Make company details readonly on logout
        alert('You have been logged out.');
    };

    const isLoggedIn = () => {
        return localStorage.getItem(LOCAL_STORAGE_LOGGED_IN_USER) !== null;
    };

    const getLoggedInUser = () => {
        return localStorage.getItem(LOCAL_STORAGE_LOGGED_IN_USER);
    };

    // Update the text and behavior of the Login/Logout button
    const updateLoginStatusButton = () => {
        if (isLoggedIn()) {
            loginStatusButton.textContent = `Logout (${getLoggedInUser()})`;
            loginStatusButton.removeEventListener('click', openSignInModalForLogin); // Remove specific listener
            loginStatusButton.addEventListener('click', logoutUser); // Add logout listener
        } else {
            loginStatusButton.textContent = 'Login';
            loginStatusButton.removeEventListener('click', logoutUser); // Remove logout listener
            loginStatusButton.addEventListener('click', openSignInModalForLogin); // Add login listener
        }
    };

    // Helper to open sign-in modal in login mode
    const openSignInModalForLogin = () => {
        isSignUpMode = false; // Ensure it opens in sign-in mode
        updateSignInSignUpModal();
        signInModal.style.display = 'flex';
        authMessage.textContent = ''; // Clear previous messages
    };

    // Update the modal's UI based on sign-up/sign-in mode
    const updateSignInSignUpModal = () => {
        if (isSignUpMode) {
            signInSignUpTitle.textContent = 'Sign Up';
            signInBtn.textContent = 'Register';
            toggleSignInSignUpBtn.textContent = 'Already have an account? Sign In';
        } else {
            signInSignUpTitle.textContent = 'Sign In';
            signInBtn.textContent = 'Login';
            toggleSignInSignUpBtn.textContent = 'Don\'t have an account? Sign Up';
        }
        authMessage.textContent = ''; // Clear messages when switching mode
        usernameInput.value = ''; // Clear inputs
        passwordInput.value = '';
    };

    // Handle authentication action (sign in or register) based on current mode
    const handleAuthAction = () => {
        if (isSignUpMode) {
            registerUser();
        } else {
            signInUser();
        }
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
        if (confirm('Are you sure you want to reset the entire bill? This will not clear saved company details.')) {
            // Clear customer details
            customerNameInput.value = '';
            customerAddressInput.value = '';
            customerPhoneInput.value = '';
            customerEmailInput.value = '';
            customerGstInput.value = '';
            showCustomerGstCheckbox.checked = true; // Reset customer GST visibility
            toggleCustomerGstVisibility();

            // Clear bill info
            billNumberInput.value = '001'; // Reset bill number
            initializeBillDate(); // Re-initialize date

            // Clear all bill items and add one empty item
            billItemsBody.innerHTML = '';
            addItem();

            // Reset tax and discount
            taxRateInput.value = '0';
            discountRateInput.value = '0';

            calculateTotal(); // Recalculate everything
        }
    };

    // --- Company Details Management ---
    const saveCompanyDetails = () => {
        if (!isLoggedIn()) {
            alert('Please login to save company details.');
            return;
        }

        const companyDetails = {
            name: modalCompanyNameInput.value.trim(),
            address: modalCompanyAddressInput.value.trim(),
            phone: modalCompanyPhoneInput.value.trim(),
            email: modalCompanyEmailInput.value.trim(),
            gst: modalCompanyGstInput.value.trim(),
            showGst: showCompanyGstCheckbox.checked
        };
        localStorage.setItem(LOCAL_STORAGE_COMPANY_DETAILS, JSON.stringify(companyDetails));
        alert('Company details saved successfully!');
        companyDetailsModal.style.display = 'none'; // Close modal after saving
        loadCompanyDetails(); // Reload to update main display fields
    };

    const clearCompanyDetails = () => {
        if (!isLoggedIn()) {
            alert('Please login to clear company details.');
            return;
        }
        if (confirm('Are you sure you want to clear ALL saved company details?')) {
            localStorage.removeItem(LOCAL_STORAGE_COMPANY_DETAILS);
            alert('Company details cleared.');
            companyDetailsModal.style.display = 'none';
            loadCompanyDetails(); // Reload to update display fields (will show empty)
        }
    };


    // Toggle visibility of Company GST input in the modal
    const toggleCompanyGstVisibility = () => {
        const inputGroup = modalCompanyGstInput.closest('.input-group');
        if (showCompanyGstCheckbox.checked) {
            inputGroup.style.display = 'block';
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
        const isDarkMode = document.body.classList.contains('dark-mode');
        localStorage.setItem(LOCAL_STORAGE_DARK_MODE, isDarkMode);
    });

    // Control Panel Toggle (3D background)
    togglePanelBtn.addEventListener('click', () => {
        controlPanel.classList.toggle('hidden');
    });

    // Company Details Modal interactions
    showCompanyDetailsModalBtn.addEventListener('click', () => {
        if (!isLoggedIn()) {
            alert('Please login to manage company details.');
            openSignInModalForLogin(); // Offer to login
            return;
        }
        companyDetailsModal.style.display = 'flex';
    });
    closeCompanyDetailsModal.addEventListener('click', () => {
        companyDetailsModal.style.display = 'none';
    });
    saveCompanyDetailsBtn.addEventListener('click', saveCompanyDetails);
    clearCompanyDetailsBtn.addEventListener('click', clearCompanyDetails); // NEW event listener
    showCompanyGstCheckbox.addEventListener('change', toggleCompanyGstVisibility);

    // Customer GST visibility
    showCustomerGstCheckbox.addEventListener('change', toggleCustomerGstVisibility);


    // Sign-In Modal interactions
    closeSignInModal.addEventListener('click', () => {
        signInModal.style.display = 'none';
    });
    toggleSignInSignUpBtn.addEventListener('click', () => {
        isSignUpMode = !isSignUpMode;
        updateSignInSignUpModal();
    });
    signInBtn.addEventListener('click', handleAuthAction); // Call the new handler


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

    calculateTotal(); // Initial calculation
});

// --- Three.js Background (Existing code - ensure Three.js library is loaded BEFORE this script) ---
let scene, camera, renderer, particles;
const initThree = () => {
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    renderer = new THREE.WebGLRenderer({ canvas: document.getElementById('three-background'), alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);

    const geometry = new THREE.BufferGeometry();
    const vertices = [];
    const particleCount = 1000;

    for (let i = 0; i < particleCount; i++) {
        const x = (Math.random() - 0.5) * 2000;
        const y = (Math.random() - 0.5) * 2000;
        const z = (Math.random() - 0.5) * 2000;
        vertices.push(x, y, z);
    }

    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));

    const material = new THREE.PointsMaterial({
        color: 0x888888,
        size: 2,
        transparent: true,
        blending: THREE.AdditiveBlending,
        map: generateSprite()
    });

    particles = new THREE.Points(geometry, material);
    scene.add(particles);

    camera.position.z = 5;
};

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
    gradient.addColorStop(0.2, 'rgba(128,128,128,1)');
    gradient.addColorStop(1, 'rgba(0,0,0,0)');
    context.fillStyle = gradient;
    context.fillRect(0, 0, canvas.width, canvas.height);
    return new THREE.CanvasTexture(canvas);
};


const animateThree = () => {
    requestAnimationFrame(animateThree);

    particles.rotation.x += 0.0005;
    particles.rotation.y += 0.0008;

    renderer.render(scene, camera);
};

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

if (document.getElementById('three-background')) {
    if (typeof THREE !== 'undefined') {
        initThree();
        animateThree();
    } else {
        console.warn("Three.js not loaded. Skipping background animation.");
        document.getElementById('three-background').style.display = 'none';
    }
}