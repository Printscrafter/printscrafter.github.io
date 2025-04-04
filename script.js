document.addEventListener('DOMContentLoaded', () => {
    // --- Configuration ---
    const GAS_WEB_APP_URL = 'https://script.google.com/macros/s/AKfycbwJIHO6rNjmbcy-3MBJbIbtcLqUc_fiQGIXT9LMyJO2VK_-avlkCYEvk0CYSHwNw1diJw/exec'; // Replace this later
    const PRICES = {
        '4x6': 1,
        '5x7': 2,
        '8x10': 3,
        '12x16': 4,
        '16x20': 6,
        '20x24': 8,
        '24x36': 15,
        '36x42': 20
    };
    const MAX_FILE_SIZE_MB = 10;

    // --- DOM Elements ---
    const fileInput = document.getElementById('file-input');
    const dropZone = document.getElementById('drop-zone');
    const previewArea = document.getElementById('preview-area');
    const orderFormSection = document.getElementById('order-form-section');
    const imageDetailsArea = document.getElementById('image-details-area');
    const userDetailsSection = document.getElementById('user-details-section');
    const summarySection = document.getElementById('summary-section');
    const userNameInput = document.getElementById('user-name');
    const userEmailInput = document.getElementById('user-email');
    const userAddressInput = document.getElementById('user-address');
    const totalItemsSpan = document.getElementById('total-items');
    const totalPriceSpan = document.getElementById('total-price');
    const submitOrderButton = document.getElementById('submit-order');
    const statusMessageDiv = document.getElementById('status-message');
    const submitLoader = document.getElementById('submit-loader');

    // --- State ---
    let uploadedFiles = {}; // Store file objects and their details { fileId: { file: File, readerResult: base64, size: '4x6', quantity: 1, price: 0, element: HTMLElement } }
    let nextFileId = 0;

    // --- Event Listeners ---

    // File Input Change
    fileInput.addEventListener('change', handleFileSelect);

    // Drag and Drop
    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.classList.add('border-blue-500', 'bg-blue-50');
    });
    dropZone.addEventListener('dragleave', (e) => {
        e.preventDefault();
        dropZone.classList.remove('border-blue-500', 'bg-blue-50');
    });
    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.classList.remove('border-blue-500', 'bg-blue-50');
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            handleFiles(e.dataTransfer.files);
            fileInput.files = e.dataTransfer.files; // Optional: Sync with file input
        }
    });

    // Click on Drop Zone triggers File Input
    dropZone.addEventListener('click', () => {
        fileInput.click();
    });

    // Submit Order
    submitOrderButton.addEventListener('click', handleSubmitOrder);

    // --- Functions ---

    function handleFileSelect(event) {
        handleFiles(event.target.files);
    }

    function handleFiles(files) {
        if (!files) return;
        showStatusMessage('', false); // Clear previous status

        for (const file of files) {
            if (!file.type.startsWith('image/')) {
                console.warn(`Skipping non-image file: ${file.name}`);
                showStatusMessage(`Skipped non-image file: ${file.name}`, true, 'orange');
                continue;
            }
            if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
                console.warn(`Skipping large file: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB)`);
                 showStatusMessage(`File too large (max ${MAX_FILE_SIZE_MB}MB): ${file.name}`, true, 'orange');
                continue;
            }

            const fileId = `file-${nextFileId++}`;
            const reader = new FileReader();

            reader.onload = function(e) {
                // Store file data
                uploadedFiles[fileId] = {
                    file: file,
                    readerResult: e.target.result, // Base64 data URL
                    size: Object.keys(PRICES)[0], // Default to first size
                    quantity: 1,
                    price: 0, // Will be calculated later
                    element: null // Will be assigned the form element
                };
                // Create preview and form elements
                createImagePreviewAndForm(fileId, file.name, e.target.result);
                updateSummaryAndVisibility(); // Update totals and show sections
            }

            reader.onerror = function(e) {
                console.error("FileReader error:", e);
                showStatusMessage(`Error reading file: ${file.name}`, true);
            }

            reader.readAsDataURL(file); // Read file as Base64
        }
    }

    function createImagePreviewAndForm(fileId, fileName, imageSrc) {
        // --- Create Preview ---
        const previewContainer = document.createElement('div');
        previewContainer.classList.add('relative', 'fade-in');
        previewContainer.dataset.fileId = fileId; // Link preview to fileId

        const img = document.createElement('img');
        img.src = imageSrc;
        img.alt = `Preview of ${fileName}`;
        img.classList.add('w-full', 'h-32', 'object-cover', 'rounded-md', 'shadow'); // Fixed height preview

        const removeButtonPreview = document.createElement('button');
        removeButtonPreview.innerHTML = '&times;'; // 'x' symbol
        removeButtonPreview.classList.add('absolute', 'top-1', 'right-1', 'bg-red-500', 'text-white', 'rounded-full', 'w-5', 'h-5', 'flex', 'items-center', 'justify-center', 'text-xs', 'font-bold', 'hover:bg-red-700', 'transition-colors');
        removeButtonPreview.title = `Remove ${fileName}`;
        removeButtonPreview.onclick = () => removeImage(fileId);

        previewContainer.appendChild(img);
        previewContainer.appendChild(removeButtonPreview);
        previewArea.appendChild(previewContainer);

        // --- Create Form Section ---
        const formContainer = document.createElement('div');
        formContainer.classList.add('border', 'border-gray-200', 'p-4', 'rounded-md', 'mb-4', 'fade-in', 'flex', 'flex-col', 'md:flex-row', 'md:items-center', 'gap-4');
        formContainer.dataset.fileId = fileId; // Link form to fileId
        uploadedFiles[fileId].element = formContainer; // Store reference

        // Mini Preview in Form
        const formImg = document.createElement('img');
        formImg.src = imageSrc;
        formImg.alt = fileName;
        formImg.classList.add('w-16', 'h-16', 'object-cover', 'rounded', 'flex-shrink-0');

        // Details Div
        const detailsDiv = document.createElement('div');
        detailsDiv.classList.add('flex-grow');

        // File Name
        const nameP = document.createElement('p');
        nameP.textContent = fileName;
        nameP.classList.add('font-semibold', 'text-sm', 'mb-2', 'truncate'); // Truncate long names

        // Size Selector
        const sizeLabel = document.createElement('label');
        sizeLabel.textContent = 'Size: ';
        sizeLabel.classList.add('text-sm', 'mr-1');
        const sizeSelect = document.createElement('select');
        sizeSelect.classList.add('border', 'border-gray-300', 'rounded', 'px-2', 'py-1', 'text-sm');
        sizeSelect.dataset.fileId = fileId;
        for (const size in PRICES) {
            const option = document.createElement('option');
            option.value = size;
            option.textContent = `${size} ($${PRICES[size].toFixed(2)})`;
            sizeSelect.appendChild(option);
        }
        sizeSelect.value = uploadedFiles[fileId].size; // Set default
        sizeSelect.onchange = handleItemChange;

        // Quantity Input
        const quantityLabel = document.createElement('label');
        quantityLabel.textContent = 'Qty: ';
        quantityLabel.classList.add('text-sm', 'ml-2', 'mr-1');
        const quantityInput = document.createElement('input');
        quantityInput.type = 'number';
        quantityInput.min = '1';
        quantityInput.value = uploadedFiles[fileId].quantity;
        quantityInput.classList.add('border', 'border-gray-300', 'rounded', 'px-2', 'py-1', 'text-sm', 'w-16');
        quantityInput.dataset.fileId = fileId;
        quantityInput.onchange = handleItemChange;
        quantityInput.oninput = handleItemChange; // Handle direct input too

        // Price Display
        const priceP = document.createElement('p');
        priceP.classList.add('text-sm', 'mt-1', 'font-medium', 'text-green-600');
        priceP.textContent = `Item Price: $${calculateItemPrice(fileId).toFixed(2)}`; // Initial price

        detailsDiv.appendChild(nameP);
        detailsDiv.appendChild(sizeLabel);
        detailsDiv.appendChild(sizeSelect);
        detailsDiv.appendChild(quantityLabel);
        detailsDiv.appendChild(quantityInput);
        detailsDiv.appendChild(priceP);

        // Remove Button for Form Item
        const removeButtonForm = document.createElement('button');
        removeButtonForm.innerHTML = '&times;';
        removeButtonForm.classList.add('bg-red-100', 'text-red-600', 'rounded-full', 'w-6', 'h-6', 'flex', 'items-center', 'justify-center', 'text-sm', 'font-bold', 'hover:bg-red-200', 'transition-colors', 'flex-shrink-0', 'ml-auto', 'md:ml-0');
        removeButtonForm.title = `Remove ${fileName}`;
        removeButtonForm.onclick = () => removeImage(fileId);

        formContainer.appendChild(formImg);
        formContainer.appendChild(detailsDiv);
        formContainer.appendChild(removeButtonForm); // Add remove button to form item

        imageDetailsArea.appendChild(formContainer);
    }

    function handleItemChange(event) {
        const fileId = event.target.dataset.fileId;
        if (!uploadedFiles[fileId]) return;

        const formContainer = uploadedFiles[fileId].element;
        const sizeSelect = formContainer.querySelector('select');
        const quantityInput = formContainer.querySelector('input[type="number"]');
        const priceP = formContainer.querySelector('p.text-green-600');

        uploadedFiles[fileId].size = sizeSelect.value;
        uploadedFiles[fileId].quantity = parseInt(quantityInput.value) || 1; // Ensure quantity is at least 1
        if (uploadedFiles[fileId].quantity < 1) { // Correct if user enters 0 or less
             uploadedFiles[fileId].quantity = 1;
             quantityInput.value = 1;
        }

        const itemPrice = calculateItemPrice(fileId);
        priceP.textContent = `Item Price: $${itemPrice.toFixed(2)}`;

        updateSummaryAndVisibility();
    }

    function calculateItemPrice(fileId) {
        const item = uploadedFiles[fileId];
        const pricePerItem = PRICES[item.size] || 0;
        item.price = pricePerItem * item.quantity;
        return item.price;
    }

    function removeImage(fileId) {
        if (!uploadedFiles[fileId]) return;

        // Remove preview
        const previewElement = previewArea.querySelector(`div[data-file-id="${fileId}"]`);
        if (previewElement) previewElement.remove();

        // Remove form section
        const formElement = imageDetailsArea.querySelector(`div[data-file-id="${fileId}"]`);
        if (formElement) formElement.remove();

        // Remove from state
        delete uploadedFiles[fileId];

        updateSummaryAndVisibility();
    }

    function updateSummaryAndVisibility() {
        const fileIds = Object.keys(uploadedFiles);
        const hasFiles = fileIds.length > 0;

        // Toggle visibility of sections
        orderFormSection.classList.toggle('hidden', !hasFiles);
        userDetailsSection.classList.toggle('hidden', !hasFiles);
        summarySection.classList.toggle('hidden', !hasFiles);

        if (hasFiles) {
            let totalItems = 0;
            let totalPrice = 0;
            fileIds.forEach(id => {
                totalItems += uploadedFiles[id].quantity;
                totalPrice += calculateItemPrice(id); // Recalculate just in case
            });

            totalItemsSpan.textContent = totalItems;
            totalPriceSpan.textContent = `$${totalPrice.toFixed(2)}`;
            submitOrderButton.disabled = false; // Enable submit button if files exist
        } else {
            totalItemsSpan.textContent = '0';
            totalPriceSpan.textContent = '$0.00';
            submitOrderButton.disabled = true; // Disable submit if no files
        }
    }

    function showStatusMessage(message, isError = false, color = 'red') {
        statusMessageDiv.textContent = message;
        statusMessageDiv.classList.remove('hidden', 'bg-red-100', 'text-red-700', 'bg-green-100', 'text-green-700', 'bg-orange-100', 'text-orange-700'); // Clear previous styles

        if (message) {
            let bgColor, textColor;
            if (isError) {
                if (color === 'orange') {
                    bgColor = 'bg-orange-100';
                    textColor = 'text-orange-700';
                } else {
                    bgColor = 'bg-red-100';
                    textColor = 'text-red-700';
                }
            } else {
                bgColor = 'bg-green-100';
                textColor = 'text-green-700';
            }
            statusMessageDiv.classList.add(bgColor, textColor);
            statusMessageDiv.classList.remove('hidden');
        } else {
            statusMessageDiv.classList.add('hidden');
        }
    }

    async function handleSubmitOrder() {
        // --- Validation ---
        const name = userNameInput.value.trim();
        const email = userEmailInput.value.trim();
        const address = userAddressInput.value.trim();
        const items = Object.values(uploadedFiles);

        if (items.length === 0) {
            showStatusMessage('Please upload at least one image.', true);
            return;
        }
        if (!name || !email || !address) {
            showStatusMessage('Please fill in all your details (Name, Email, Address).', true);
            // Optionally highlight missing fields
            if (!name) userNameInput.classList.add('border-red-500'); else userNameInput.classList.remove('border-red-500');
            if (!email) userEmailInput.classList.add('border-red-500'); else userEmailInput.classList.remove('border-red-500');
            if (!address) userAddressInput.classList.add('border-red-500'); else userAddressInput.classList.remove('border-red-500');
            return;
        } else {
             userNameInput.classList.remove('border-red-500');
             userEmailInput.classList.remove('border-red-500');
             userAddressInput.classList.remove('border-red-500');
        }

        // Basic email format check (consider a more robust regex if needed)
        if (!/^\S+@\S+\.\S+$/.test(email)) {
             showStatusMessage('Please enter a valid email address.', true);
             userEmailInput.classList.add('border-red-500');
             return;
        } else {
             userEmailInput.classList.remove('border-red-500');
        }

        if (GAS_WEB_APP_URL === 'YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL_HERE') {
             showStatusMessage('Error: Google Apps Script URL is not configured in script.js.', true);
             return;
        }


        // --- Prepare Data ---
        showStatusMessage('Submitting order...', false, 'blue'); // Use a neutral color for processing
        submitOrderButton.disabled = true;
        submitLoader.classList.remove('hidden');

        const orderData = {
            userName: name,
            userEmail: email,
            userAddress: address,
            items: items.map(item => ({
                fileName: item.file.name,
                mimeType: item.file.type,
                base64Data: item.readerResult.split(',')[1], // Remove the "data:image/png;base64," part
                size: item.size,
                quantity: item.quantity,
                price: item.price
            })),
            totalPrice: parseFloat(totalPriceSpan.textContent.replace('$', ''))
        };

        // --- Send Data to Google Apps Script ---
        try {
            const response = await fetch(GAS_WEB_APP_URL, {
                method: 'POST',
                // mode: 'cors', // Removed this line - let browser handle default
                cache: 'no-cache',
                headers: {
                    // 'Content-Type': 'application/json', // Changed to text/plain
                    'Content-Type': 'text/plain;charset=utf-8', // Send as plain text
                },
                 // redirect: 'follow', // GAS web apps often require following redirects
                body: JSON.stringify(orderData) // Still send the stringified JSON in the body
            });

             // Note: GAS web apps often return HTML confirmation or plain text on success,
             // and might not return perfect JSON unless specifically crafted in doPost.
             // We'll try to parse JSON, but handle potential errors gracefully.
            let result;
            const contentType = response.headers.get("content-type");
            if (contentType && contentType.indexOf("application/json") !== -1) {
                result = await response.json();
            } else {
                // If not JSON, maybe plain text or HTML - treat as success if status is OK
                const textResult = await response.text();
                console.log("GAS Response (non-JSON):", textResult);
                 if (!response.ok) {
                    throw new Error(`Server responded with status ${response.status}: ${textResult}`);
                 }
                 // Assume success if response is OK but not JSON
                 result = { status: 'success', message: 'Order submitted successfully (check email for confirmation).' };
            }


            if (response.ok && result.status === 'success') {
                showStatusMessage(result.message || 'Order submitted successfully!', false);
                // Clear form and state
                resetForm();
            } else {
                throw new Error(result.message || 'An unknown error occurred during submission.');
            }

        } catch (error) {
            console.error('Error submitting order:', error);
            showStatusMessage(`Error submitting order: ${error.message}`, true);
        } finally {
            submitOrderButton.disabled = false; // Re-enable button even on error
            submitLoader.classList.add('hidden');
             // Re-enable button only if there are still items (might have failed)
             updateSummaryAndVisibility();
        }
    }

    function resetForm() {
        // Clear file input visually (though the internal FileList might be harder to clear reliably)
        fileInput.value = ''; // May not work in all browsers for security reasons

        // Clear previews and forms
        previewArea.innerHTML = '';
        imageDetailsArea.innerHTML = '';

        // Clear user details form
        userNameInput.value = '';
        userEmailInput.value = '';
        userAddressInput.value = '';
         userNameInput.classList.remove('border-red-500');
         userEmailInput.classList.remove('border-red-500');
         userAddressInput.classList.remove('border-red-500');


        // Reset state
        uploadedFiles = {};
        nextFileId = 0;

        // Update summary and hide sections
        updateSummaryAndVisibility();
    }

}); // End DOMContentLoaded
