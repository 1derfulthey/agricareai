
    // Show main control buttons.
    elements.mainControlsSection.style.display = 'flex';
    elements.mainImageDisplayArea.style.display = 'flex';
    elements.webcamButton.style.display = 'flex';
    elements.uploadButton.style.display = 'flex';
    elements.reportBugEntryButton.style.display = 'flex';
}

/**
 * Starts the webcam stream and displays it in the provided video element.
 * @param {HTMLVideoElement} videoElement - The video element to display the stream.
 * @param {string} stateFlag - The state flag to set (e.g., 'isWebcamActive').
 */
async function startWebcam(videoElement, stateFlag) {
    try {
        // Request access to the user's camera, preferring the environment (rear) camera.
        const stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: "environment" }
        });
        videoElement.srcObject = stream; // Set the video source to the camera stream.
        videoElement.style.display = "block"; // Show the video element.
        state[stateFlag] = true; // Update the state flag.
        
        // Adjust UI visibility based on which webcam is active.
        if (videoElement === elements.webcam) {
            elements.placeholderImage.style.display = "none"; // Hide main placeholder.
            showAnalysisWebcamActionButtons(); // Show analysis webcam controls.
        } else if (videoElement === elements.reportWebcam) {
            elements.reportPlaceholderImage.style.display = "none"; // Hide report placeholder.
            showReportWebcamActionButtons(); // Show report webcam controls.
        }
    } catch (error) {
        console.error("Camera error:", error);
        showErrorMessage("ไม่สามารถเข้าถึงกล้องได้ โปรดอนุญาตการเข้าถึงในเบราว์เซอร์ของคุณ"); // Display camera access error.
        
        // Reset UI based on which webcam encountered an error.
        if (videoElement === elements.webcam) {
            resetUI(); 
        } else if (videoElement === elements.reportWebcam) {
            stopWebcam(elements.reportWebcam, 'isReportWebcamActive');
            elements.reportWebcam.style.display = "none";
            elements.reportPlaceholderImage.style.display = "flex";
            elements.reportInitialCaptureUploadButtons.style.display = "flex";
            elements.reportWebcamActionButtons.style.display = "none";
            elements.reportImageActionButtons.style.display = "none";
        }
    }
}

/**
 * Stops the webcam stream associated with a video element.
 * @param {HTMLVideoElement} videoElement - The video element whose stream should be stopped.
 * @param {string} stateFlag - The state flag to reset.
 */
function stopWebcam(videoElement, stateFlag) {
    if (state[stateFlag] && videoElement.srcObject) {
        // Stop all tracks in the media stream.
        videoElement.srcObject.getTracks().forEach(track => track.stop());
        state[stateFlag] = false; // Update the state flag.
        videoElement.srcObject = null; // Clear the video source.
    }
}

/**
 * Captures a frame from the webcam video element and calls a callback with the resulting image.
 * @param {HTMLVideoElement} videoElement - The video element to capture from.
 * @param {function} callback - The callback function to call with the captured image (HTMLCanvasElement).
 */
function captureFromWebcam(videoElement, callback) {
    if (!state.isWebcamActive && !state.isReportWebcamActive) return; // Do nothing if no webcam is active.
    
    // Create a temporary canvas to draw the video frame.
    const canvas = document.createElement("canvas");
    canvas.width = videoElement.videoWidth;
    canvas.height = videoElement.videoHeight;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
    
    // Stop the appropriate webcam after capturing.
    if (videoElement === elements.webcam) {
        stopWebcam(elements.webcam, 'isWebcamActive');
    } else if (videoElement === elements.reportWebcam) {
        stopWebcam(elements.reportWebcam, 'isReportWebcamActive');
    }
    
    callback(canvas); // Call the callback with the canvas containing the captured image.
}

/**
 * Handles file upload events, reads the selected image, and calls a callback with the image.
 * @param {Event} event - The file input change event.
 * @param {function} callback - The callback function to call with the loaded image (HTMLImageElement).
 */
function handleFileUpload(event, callback) {
    const file = event.target.files[0];
    if (!file) {
        // If no file is selected, reset UI or show appropriate buttons based on context.
        if (event.target === elements.fileUpload) {
            resetUI();
        } else if (event.target === elements.reportFileUpload) {
            if (!state.currentImageDataUrl) { // Only show if no image was previously loaded.
                elements.reportInitialCaptureUploadButtons.style.display = "flex";
                elements.reportWebcamActionButtons.style.display = "none";
                elements.reportImageActionButtons.style.display = "none"; 
                elements.reportPlaceholderImage.style.display = "flex";
            }
        }
        return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
        const img = new Image();
        img.onload = () => callback(img); // Call callback when image is loaded.
        img.onerror = () => showErrorMessage("ไม่สามารถโหลดไฟล์รูปภาพได้"); // Handle image loading error.
        img.src = e.target.result; // Set image source to data URL.
    };
    reader.onerror = () => showErrorMessage("ไม่สามารถอ่านไฟล์ได้"); // Handle file reading error.
    reader.readAsDataURL(file); // Read the file as a data URL.
}

/**
 * Displays the captured or uploaded image in the main analysis area and updates controls.
 * @param {HTMLImageElement|HTMLCanvasElement} imageElement - The image or canvas element to display.
 */
function displayCapturedImageForAnalysis(imageElement) {
    state.currentImage = imageElement; // Store the image element.
    const tempCanvas = document.createElement("canvas");
    // Set canvas dimensions based on image or video dimensions.
    tempCanvas.width = imageElement.width || imageElement.videoWidth;
    tempCanvas.height = imageElement.videoHeight || imageElement.height;
    const ctx = tempCanvas.getContext("2d");
    ctx.drawImage(imageElement, 0, 0, tempCanvas.width, tempCanvas.height);
    state.currentImageDataUrl = tempCanvas.toDataURL("image/png"); // Store the image as data URL.

    elements.uploadedImage.src = state.currentImageDataUrl; // Set the src of the display image.
    elements.uploadedImage.style.display = "block"; // Show the display image.
    elements.webcam.style.display = "none"; // Hide the webcam.
    elements.placeholderImage.style.display = "none"; // Hide the placeholder.
    
    elements.predictionResult.style.display = "none"; // Hide previous prediction results.
    elements.reportBugSection.style.display = "none"; // Hide report section.

    showAnalysisImageActionButtons(); // Show action buttons relevant to displayed image.
    elements.mainControlsSection.style.display = 'none'; // Hide main controls.
}

/**
 * Displays the captured or uploaded image in the bug report area and updates controls.
 * @param {HTMLImageElement|HTMLCanvasElement} imageElement - The image or canvas element to display.
 */
function displayCapturedImageForReport(imageElement) {
    state.currentImage = imageElement; // Store the image element.
    const tempCanvas = document.createElement("canvas");
    // Set canvas dimensions based on image or video dimensions.
    tempCanvas.width = imageElement.width || imageElement.videoWidth;
    tempCanvas.height = imageElement.videoHeight || imageElement.height;
    const ctx = tempCanvas.getContext("2d");
    ctx.drawImage(imageElement, 0, 0, tempCanvas.width, tempCanvas.height);
    state.currentImageDataUrl = tempCanvas.toDataURL("image/png"); // Store the image as data URL.

    elements.reportUploadedImage.src = state.currentImageDataUrl; // Set the src of the report display image.
    elements.reportUploadedImage.style.display = "block"; // Show the report display image.
    elements.reportWebcam.style.display = "none"; // Hide the report webcam.
    elements.reportPlaceholderImage.style.display = "none"; // Hide the report placeholder.

    showReportImageActionButtons(); // Show action buttons relevant to displayed image in report.
}

/**
 * Analyzes the current image using the loaded AI model and displays the prediction results.
 */
async function analyzeImage() {
    if (!state.currentImage || !state.model) {
        showErrorMessage("ไม่มีภาพสำหรับวิเคราะห์ หรือโมเดลยังไม่พร้อม"); // Display error if no image or model.
        return;
    }
    showInfoMessage('<i class="fas fa-spinner fa-spin"></i> กำลังวิเคราะห์...'); // Show analyzing message.
    
    // Create a canvas and draw the current image resized to 224x224 (model input size).
    const canvas = document.createElement("canvas");
    canvas.width = 224;
    canvas.height = 224;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(state.currentImage, 0, 0, 224, 224);
    
    const predictions = await state.model.predict(canvas); // Get predictions from the AI model.
    displayPredictionResults(predictions); // Display the results.
}

/**
 * Displays the prediction results from the AI model.
 * @param {Array<Object>} predictions - An array of prediction objects from the AI model.
 */
function displayPredictionResults(predictions) {
    // Find the prediction with the highest probability.
    let topPrediction = predictions.reduce((prev, current) => (prev.probability > current.probability) ? prev : current);
    const isConfident = topPrediction.probability > 0.80; // Check if confidence is above 80%.
    let insectInfo;

    elements.predictionResult.style.display = "block"; // Show the prediction result box.
    elements.reportBugSection.style.display = "none"; // Hide the report bug section.

    if (isConfident && INSECT_DB[topPrediction.className]) {
        // If confident and insect is in DB, display detailed info.
        insectInfo = INSECT_DB[topPrediction.className];
        const confidencePercent = Math.round(topPrediction.probability * 100);
        elements.resultText.innerHTML = `
            <div class="insect-type-label ${insectInfo.type}">
                ${insectInfo.type === "beneficial" ? "แมลงมีประโยชน์" : "แมลงศัตรูพืช"}
            </div>
            <h4>${insectInfo.description}</h4>
            <div class="confidence-level">
                <i class="fas fa-chart-line"></i> ระดับความมั่นใจ: ${confidencePercent}%
            </div>
        `;
        elements.additionalInfo.innerHTML = `
            <p><i class="fas fa-info-circle"></i> ${insectInfo.details}</p>
            <p><i class="fas fa-lightbulb"></i> <strong>คำแนะนำ:</strong> ${insectInfo.recommendation}</p>
        `;
    } else {
        // If not confident or unknown, display unknown message and report option.
        insectInfo = INSECT_DB.unknown;
        elements.resultText.innerHTML = `<h4>${insectInfo.description}</h4>`;
        const reasonsHTML = insectInfo.reasons.map(reason => `<li><i class="fas fa-circle-info custom-bullet-icon"></i> ${reason}</li>`).join("");
        elements.additionalInfo.innerHTML = `
            <div class="unknown-result">
                <p><i class="fas fa-exclamation-triangle"></i> ${insectInfo.details}</p>
                <ul>${reasonsHTML}</ul>
                <p><i class="fas fa-lightbulb"></i> <strong>คำแนะนำ:</strong> ${insectInfo.recommendation}</p>
                <button id="reportUnknownBugButton" class="btn-info" style="margin-top: 15px;">
                    <i class="fas fa-file-alt"></i> รายงานแมลงนี้
                </button>
            </div>
        `;
        // Add event listener to the "Report this bug" button.
        const reportBtn = document.getElementById("reportUnknownBugButton");
        if (reportBtn) {
            reportBtn.addEventListener("click", () => {
                state.currentFlow = 'report_submission'; // Set flow to report submission.
                showReportBugForm(); // Show the report form.
            });
        }
    }
}

/**
 * Displays an informational message in the prediction result area.
 * @param {string} message - The message to display (can contain HTML).
 */
function showInfoMessage(message) {
    elements.predictionResult.style.display = "block";
    elements.resultText.innerHTML = message;
    elements.additionalInfo.innerHTML = "";
    elements.reportBugSection.style.display = "none";
}

/**
 * Displays an error message in the prediction result area.
 * @param {string} message - The error message to display.
 */
function showErrorMessage(message) {
    elements.predictionResult.style.display = "block";
    elements.resultText.innerHTML = `<div class="error-message"><i class="fas fa-exclamation-triangle"></i> ${message}</div>`;
    elements.additionalInfo.innerHTML = "";
    elements.reportBugSection.style.display = "none";
}

/**
 * Shows the bug report form and pre-fills image if available.
 */
function showReportBugForm() {
    elements.mainControlsSection.style.display = 'none'; // Hide main controls.
    elements.mainImageDisplayArea.style.display = 'none'; // Hide main image area.
    elements.predictionResult.style.display = "none"; // Hide prediction results.

    elements.reportBugSection.style.display = "block"; // Show the report bug section.
    elements.reportBugForm.reset(); // Reset the form fields.
    elements.reportStatus.innerHTML = ''; // Clear previous report status.
    elements.reportStatus.className = ''; // Clear report status class.
    elements.reportDate.valueAsDate = new Date(); // Set report date to today.

    // If an image was already processed, display it in the report form.
    if (state.currentImageDataUrl) {
        elements.reportUploadedImage.src = state.currentImageDataUrl;
        elements.reportUploadedImage.style.display = "block";
        elements.reportPlaceholderImage.style.display = "none";
        showReportImageActionButtons(); // Show image action buttons for report.
    } else {
        // Otherwise, show initial capture/upload options for report.
        elements.reportPlaceholderImage.style.display = "flex";
        elements.reportUploadedImage.style.display = "none";
        elements.reportWebcam.style.display = "none";
        elements.reportInitialCaptureUploadButtons.style.display = "flex";
        elements.reportWebcamActionButtons.style.display = "none";
        elements.reportImageActionButtons.style.display = "none";
    }
}

/**
 * Submits the bug report form data to the Google Apps Script web app.
 * @param {Event} event - The form submission event.
 */
async function submitBugReport(event) {
    event.preventDefault(); // Prevent default form submission.

    if (!state.currentImageDataUrl) {
        showReportStatus("error", "กรุณาถ่ายภาพหรืออัปโหลดรูปแมลงก่อนรายงาน"); // Error if no image.
        return;
    }

    showReportStatus("info", '<i class="fas fa-spinner fa-spin"></i> กำลังส่งข้อมูล...'); // Show loading status.
    elements.submitReportButton.disabled = true; // Disable submit button.

    // Get selected damage types.
    const selectedDamage = Array.from(elements.damageCheckboxes)
                               .filter(checkbox => checkbox.checked)
                               .map(checkbox => checkbox.value);

    // Prepare form data for submission.
    const formData = {
        image_data: state.currentImageDataUrl.split(',')[1], // Send only the base64 part of the image.
        insect_name: elements.insectName.value || '',
        date_found: elements.reportDate.value,
        location_district: elements.reportLocationDistrict.value,
        location_province: elements.reportLocationProvince.value,
        plant_type: elements.reportPlantType.value,
        damage_observed: selectedDamage,
        additional_comments: elements.additionalComments.value
    };

    try {
        // Send data to Google Apps Script web app.
        const response = await fetch(WEB_APP_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'text/plain;charset=utf-8' // Content-Type for Google Apps Script.
            },
            body: JSON.stringify(formData) // Send form data as JSON string.
        });

        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

        const result = await response.json(); // Parse response as JSON.

        if (result.status === 'success') {
            showReportStatus("success", "ส่งข้อมูลรายงานแมลงสำเร็จ!"); // Show success message.
            elements.thankYouModal.style.display = 'block'; // Show thank you modal.
            setTimeout(resetUI, 3000); // Reset UI after 3 seconds.
        } else {
            showReportStatus("error", `เกิดข้อผิดพลาด: ${result.message}`); // Show error message from server.
        }
    } catch (error) {
        console.error("Error submitting report:", error);
        showReportStatus("error", `ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้: ${error.message}`); // Show network error.
    } finally {
        elements.submitReportButton.disabled = false; // Re-enable submit button.
    }
}

/**
 * Displays the status of the bug report submission.
 * @param {string} type - Type of status ('info', 'success', 'error').
 * @param {string} message - The message to display.
 */
function showReportStatus(type, message) {
    elements.reportStatus.innerHTML = message;
    elements.reportStatus.className = `report-status ${type}`; // Apply class for styling.
}

/**
 * Shows the action buttons specific to the analysis webcam view.
 */
function showAnalysisWebcamActionButtons() {
    elements.analysisActionButtons.style.display = "flex";
    elements.analysisWebcamControls.style.display = "flex";
    elements.captureButton.style.display = "flex";
    elements.cancelWebcamButton.style.display = "flex";
    elements.analysisImageControls.style.display = "none";
    elements.backToHomeButton.style.display = "none";
}

/**
 * Shows the action buttons specific to the analysis image display view.
 */
function showAnalysisImageActionButtons() {
    elements.analysisActionButtons.style.display = "flex";
    elements.analysisWebcamControls.style.display = "none";
    elements.captureButton.style.display = "none";
    elements.cancelWebcamButton.style.display = "none";
    elements.analysisImageControls.style.display = "flex";
    elements.retakeOrSelectNewButton.style.display = "flex";
    elements.backToHomeButton.style.display = "flex";
    elements.analyzeButton.style.display = "flex";

    // Adjust button text based on image source.
    if (state.imageSource === 'webcam') {
        elements.retakeOrSelectNewButton.innerHTML = '<i class="fas fa-rotate-left"></i> ถ่ายใหม่';
    } else if (state.imageSource === 'upload') {
        elements.retakeOrSelectNewButton.innerHTML = '<i class="fas fa-image"></i> เลือกภาพใหม่';
    }
}

/**
 * Shows the action buttons specific to the report webcam view.
 */
function showReportWebcamActionButtons() {
    elements.reportInitialCaptureUploadButtons.style.display = "none"; 
    elements.reportWebcamActionButtons.style.display = "flex"; 
    elements.captureButtonReport.style.display = "flex";
    elements.cancelReportWebcamButton.style.display = "flex";
    elements.reportImageActionButtons.style.display = "none";
}

/**
 * Shows the action buttons specific to the report image display view.
 */
function showReportImageActionButtons() {
    elements.reportInitialCaptureUploadButtons.style.display = "none";
    elements.reportWebcamActionButtons.style.display = "none";
    elements.reportImageActionButtons.style.display = "flex";
    elements.retakeOrSelectNewReportButton.style.display = "flex";
}

// Initialize the application when the window loads.
window.addEventListener("load", initializeApp);
