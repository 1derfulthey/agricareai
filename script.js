// Define the URL for the Teachable Machine AI model and the Google Apps Script web app.
const MODEL_URL = "https://teachablemachine.withgoogle.com/models/wsSrXpCPW/";
const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbxsgCInGAapb6YWlGyr42VDqtDIX0WgweSFfyzErTKvglGtFWPLdlQe_85xYYfgnaA-/exec"; 

// Cache all necessary DOM elements for efficient access.
const elements = {
    webcamButton: document.getElementById("webcamButton"),
    uploadButton: document.getElementById("uploadButton"),
    fileUpload: document.getElementById("fileUpload"),
    analysisWebcamControls: document.querySelector(".analysis-webcam-controls"),
    captureButton: document.getElementById("captureButton"),
    cancelWebcamButton: document.getElementById("cancelWebcamButton"),
    retakeOrSelectNewButton: document.getElementById("retakeOrSelectNewButton"),
    backToHomeButton: document.getElementById("backToHomeButton"),
    analyzeButton: document.getElementById("analyzeButton"),
    webcam: document.getElementById("webcam"),
    uploadedImage: document.getElementById("uploadedImage"),
    placeholderImage: document.getElementById("placeholderImage"),
    analysisActionButtons: document.querySelector(".analysis-action-buttons"),
    analysisImageControls: document.querySelector(".analysis-image-controls"),
    predictionResult: document.getElementById("predictionResult"),
    resultText: document.getElementById("resultText"),
    additionalInfo: document.getElementById("additionalInfo"),
    mainControlsSection: document.getElementById("mainControlsSection"),
    mainImageDisplayArea: document.getElementById("mainImageDisplayArea"),
    reportBugSection: document.getElementById("reportBugSection"),
    reportBugForm: document.getElementById("reportBugForm"),
    insectName: document.getElementById("insectName"),
    reportDate: document.getElementById("reportDate"),
    reportLocationDistrict: document.getElementById("reportLocationDistrict"),
    reportLocationProvince: document.getElementById("reportLocationProvince"),
    reportPlantType: document.getElementById("reportPlantType"),
    damageCheckboxes: document.querySelectorAll('input[name="damage"]'),
    additionalComments: document.getElementById("additionalComments"),
    submitReportButton: document.getElementById("submitReportButton"),
    cancelReportButton: document.getElementById("cancelReportButton"),
    reportStatus: document.getElementById("reportStatus"),
    reportBugEntryButton: document.getElementById("reportBugEntryButton"),
    reportWebcam: document.getElementById("reportWebcam"),
    reportUploadedImage: document.getElementById("reportUploadedImage"),
    reportPlaceholderImage: document.getElementById("reportPlaceholderImage"),
    reportWebcamButton: document.getElementById("reportWebcamButton"),
    reportUploadButton: document.getElementById("reportUploadButton"),
    reportFileUpload: document.getElementById("reportFileUpload"),
    reportImageArea: document.querySelector(".report-image-area"),
    reportInitialCaptureUploadButtons: document.querySelector(".report-initial-capture-upload-buttons"),
    reportWebcamActionButtons: document.querySelector(".report-webcam-action-buttons"),
    captureButtonReport: document.getElementById("captureButtonReport"),
    cancelReportWebcamButton: document.getElementById("cancelReportWebcamButton"),
    reportImageActionButtons: document.querySelector(".report-image-action-buttons"),
    retakeOrSelectNewReportButton: document.getElementById("retakeOrSelectNewReportButton"),
    thankYouModal: document.getElementById("thankYouModal"),
    closeThankYouModal: document.getElementById("closeThankYouModal")
};

// Define the application's state variables.
const state = {
    model: null, // Stores the loaded Teachable Machine model.
    isWebcamActive: false, // Flag to track if the main webcam is active.
    isReportWebcamActive: false, // Flag to track if the report webcam is active.
    currentImage: null, // Stores the current image element (HTMLImageElement or HTMLVideoElement).
    currentImageDataUrl: null, // Stores the Base64 data URL of the current image.
    currentFlow: 'idle', // Tracks the current user flow (e.g., 'idle', 'analysis_webcam', 'report_submission').
    imageSource: null // Tracks if the current image came from 'webcam' or 'upload'.
};

// Database of insect information, including type, description, details, and recommendations.
const INSECT_DB = {
    "Lady Beetles - ด้วงเต่าลาย": {
        type: "beneficial",
        description: "ด้วงเต่าลาย",
        details: "เป็นแมลงมีประโยชน์ ตลอดชีวิตกินเพลี้ยอ่อน เพลี้ยไฟ เพลี้ยหอย เพลี้ยแป้ง แมลงหวี่ขาว ไข่แมลงศัตรูพืช ฯลฯ ได้กว่า 1,100 ตัว",
        recommendation: "ควรอนุรักษ์ในสวน โดยปลูกดอกดาวเรืองหรือผักชีเพื่อดึงดูด (ระวังหากด้วงเต่าขนาดใหญ่และมีจุดตั้งแต่ 10-28 จุดจะเป็นศัตรูพืช)"
    },
    "Green Lacewing - แมลงช้างปีกใส": {
        type: "beneficial",
        description: "แมลงช้างปีกใส",
        details: "เป็นแมลงมีประโยชน์ ตัวอ่อนของแมลงช้างปีกใสกินไข่แมลง เพลี้ยอ่อน เพลี้ยแป้ง เพลี้ยหอย แมลงหวี่ขาว ไรแดงและไข่แมลงศัตรูพืช",
        recommendation: "ควรอนุรักษ์ในสวน โดยปลูกดอกดาวเรืองหรือผักชี เพื่อดึงดูดตัวเต็มวัย"
    },
    "Stink Bug - มวนพิฆาต": {
        type: "beneficial",
        description: "มวนพิฆาต",
        details: "เป็นแมลงมีประโยชน์ กินหนอนและไข่ของแมลงศัตรูพืชหลายชนิด",
        recommendation: "ปลูกพืชที่หลากหลาย เพื่อเป็นที่หลบซ่อนของมวนพิฆาต"
    },
    "Assassin Bug - มวนเพชฌฆาต": {
        type: "beneficial",
        description: "มวนเพชฌฆาต",
        details: "เป็นแมลงมีประโยชน์ กินหนอน เพลี้ยอ่อน เพลี้ยแป้ง ไรแดง และแมลงหวี่ขาว",
        recommendation: "ปลูกพืชที่หลากหลาย เพื่อเป็นที่หลบซ่อนของมวนเพชฌฆาต"
    },
    "Mealybugs - เพลี้ยแป้ง": {
        type: "pest",
        description: "เพลี้ยแป้ง",
        details: "เป็นศัตรูพืชร้ายแรง ดูดน้ำเลี้ยงทำให้พืชแคระแกร็น",
        recommendation: "ควรใช้สารสะเดาหรือเชื้อราบิวเวอร์เรียฉีดพ่น (หากมีความจำเป็นต้องใช้สารเคมีควรใช้ ไทอะมีทอกแซม 25% WG , อะมิตาโคลพริด 70% WG , บูโพรเฟซิน 40% SC หรือไวด์ออยล์ 67% EC)"
    },
    "Cutworm - หนอนกระทู้": {
        type: "pest",
        description: "หนอนกระทู้",
        details: "เป็นศัตรูพืช กัดกินใบและลำต้นพืชอ่อนในเวลากลางคืน",
        recommendation: "ควรใช้สารสะเดาฉีดพ่น และกำจัดวัชพืชที่เป็นแหล่งอาศัยของหนอนกระทู้ (หากมีความจำเป็นต้องใช้สารเคมีควรใช้ บาซิลลัส ทูริงเยนซิส (ฺBt) ฉีดพ่นตอนเย็น)"
    },
    "Striped Flea Beetle - ด้วงหมัดผักแถบลาย": {
        type: "pest",
        description: "ด้วงหมัดผักแถบลาย",
        details: "เป็นศัตรูพืช กัดกินใบพืชจำพวก กะหล่ำปลี คะน้า ผักกาดขาวปลี และผักอื่น ๆ ทำให้เป็นรูพรุน",
        recommendation: "ควรใช้สารสะเดาฉีดพ่น และไถตากดินเพื่อทำลายตัวอ่อน (หากมีความจำเป็นต้องใช้สารเคมีควรใช้ โทลแฟนไพแรต 16% EC , ไดโนทีฟูแรน 10% WP)"
    },
    "unknown": {
        type: "unknown",
        description: "ไม่สามารถระบุชนิดได้",
        details: "ระบบไม่สามารถระบุชนิดแมลงนี้ได้ อาจเป็นเพราะ:",
        reasons: [
            "ภาพไม่ชัดเจนหรือมีแสงน้อย/มากเกินไป",
            "มุมของภาพไม่เหมาะสมสำหรับการระบุชนิด",
            "แมลงไม่ได้อยู่ในฐานข้อมูลของโมเดล"
        ],
        recommendation: "กรุณาถ่ายภาพใหม่อีกครั้งให้ชัดเจน หรือปรึกษาผู้เชี่ยวชาญ"
    }
};

// Data for provinces and their corresponding districts in Thailand.
const PROVINCES_DISTRICTS = {
    "กำแพงเพชร": ["เมือง", "พรานกระต่าย", "โกสัมพีนคร", "คลองขลุง", "ไทรงาม", "คลองลาน", "ทรายทองวัฒนา", "ลานกระบือ", "ขาณุวรลักษบุรี", "ปางศิลาทอง", "บึงสามัคคี" ],
    "เชียงราย": ["เมือง", "เวียงชัย", "แม่ลาว", "แม่จัน", "ดอยหลวง", "พาน", "พญาเม็งราย", "เวียงเชียงรุ้ง", "ป่าแดด", "แม่สรวย", "เชียงแสน", "ขุนตาล", "แม่สาย", "เทิง", "แม่ฟ้าหลวง", "เวียงป่าเป้า", "เวียงแก่น", "เชียงของ"],
    "ตาก": ["แม่สอด", "เมืองตาก", "บ้านตาก", "สามเงา", "แม่ระมาด", "ท่าสองยาง"],
    "เชียงใหม่": ["เมืองเชียงใหม่", "หางดง", "สารภี", "สันทราย", "สันกำแพง", "ดอยสะเก็ด"],
    "นครราชสีมา": ["เมืองนครราชสีมา", "ปากช่อง", "สีคิ้ว", "สูงเนิน", "ขามทะเลสอ", "ด่านขุนทด"]
};

/**
 * Initializes the application by loading the AI model, setting up event listeners,
 * and resetting the UI.
 */
async function initializeApp() {
    showInfoMessage("กำลังเตรียม AI ให้พร้อมใช้งาน..."); // Display loading message.
    try {
        // Load the Teachable Machine image model.
        state.model = await tmImage.load(MODEL_URL + "model.json", MODEL_URL + "metadata.json");
        setupEventListeners(); // Attach all UI event listeners.
        initializeLocationDropdowns(); // Populate province and district dropdowns.
        resetUI(); // Reset the user interface to its initial state.
    } catch (error) {
        console.error("Failed to load model:", error);
        showErrorMessage("ไม่สามารถโหลดโมเดล AI ได้ โปรดตรวจสอบการเชื่อมต่ออินเทอร์เน็ตแล้วรีเฟรชหน้าเว็บ"); // Display error message.
    }
}

/**
 * Sets up all event listeners for user interactions.
 */
function setupEventListeners() {
    // Event listener for the "Take Photo" button in the main section.
    elements.webcamButton.addEventListener("click", () => {
        resetUI(); // Reset UI before starting new flow.
        state.currentFlow = 'analysis_webcam'; // Set current flow to webcam analysis.
        state.imageSource = 'webcam'; // Set image source.
        elements.mainControlsSection.style.display = 'none'; // Hide main controls.
        startWebcam(elements.webcam, 'isWebcamActive'); // Start the webcam for analysis.
    });

    // Event listener for the "Capture" button when webcam is active for analysis.
    elements.captureButton.addEventListener("click", () => {
        captureFromWebcam(elements.webcam, displayCapturedImageForAnalysis); // Capture image from webcam.
    });

    // Event listener for the "Cancel Webcam" button in the analysis flow.
    elements.cancelWebcamButton.addEventListener("click", resetUI); // Reset UI.

    // Event listener for the "Upload Image" button in the main section.
    elements.uploadButton.addEventListener("click", () => {
        resetUI(); // Reset UI before starting new flow.
        state.currentFlow = 'analysis_upload'; // Set current flow to upload analysis.
        state.imageSource = 'upload'; // Set image source.
        elements.mainControlsSection.style.display = 'none'; // Hide main controls.
        elements.fileUpload.click(); // Programmatically click the hidden file input.
    });

    // Event listener for when a file is selected for upload in the main analysis section.
    elements.fileUpload.addEventListener("change", (event) => {
        handleFileUpload(event, displayCapturedImageForAnalysis); // Handle the file upload.
    });

    // Event listener for "Retake Photo" or "Select New Image" button after an image is displayed for analysis.
    elements.retakeOrSelectNewButton.addEventListener("click", () => {
        elements.predictionResult.style.display = "none"; // Hide previous prediction results.

        if (state.imageSource === 'webcam') {
            elements.uploadedImage.style.display = "none"; // Hide uploaded image.
            elements.placeholderImage.style.display = "none"; // Hide placeholder.
            startWebcam(elements.webcam, 'isWebcamActive'); // Restart webcam.
            showAnalysisWebcamActionButtons(); // Show webcam action buttons.
        } else if (state.imageSource === 'upload') {
            elements.uploadedImage.style.display = "none"; // Hide uploaded image.
            elements.placeholderImage.style.display = "flex"; // Show placeholder.
            document.getElementById('fileUpload').value = ''; // Clear the file input value.
            elements.fileUpload.click(); // Trigger file upload again.
            elements.analysisActionButtons.style.display = "none"; // Hide action buttons.
        }
    });

    // Event listener for the "Back to Home" button.
    elements.backToHomeButton.addEventListener("click", resetUI); // Reset UI.

    // Event listener for the "Analyze" button.
    elements.analyzeButton.addEventListener("click", analyzeImage); // Analyze the current image.

    // Event listener for the "Report Bug Entry" button in the main section.
    elements.reportBugEntryButton.addEventListener("click", () => {
        resetUI(); // Reset UI before showing report form.
        state.currentFlow = 'report_submission'; // Set current flow to report submission.
        showReportBugForm(); // Display the bug report form.
    });

    // Event listener for the "Take Photo" button in the report section.
    elements.reportWebcamButton.addEventListener("click", () => {
        stopWebcam(elements.reportWebcam, 'isReportWebcamActive'); // Stop any existing report webcam stream.
        startWebcam(elements.reportWebcam, 'isReportWebcamActive'); // Start webcam for report.
    });

    // Event listener for the "Capture" button when webcam is active for reporting.
    elements.captureButtonReport.addEventListener("click", () => {
        captureFromWebcam(elements.reportWebcam, displayCapturedImageForReport); // Capture image from webcam for report.
    });

    // Event listener for the "Cancel Webcam" button in the report flow.
    elements.cancelReportWebcamButton.addEventListener("click", () => {
        stopWebcam(elements.reportWebcam, 'isReportWebcamActive'); // Stop report webcam.
        elements.reportWebcam.style.display = "none"; // Hide webcam element.
        elements.reportPlaceholderImage.style.display = "flex"; // Show report placeholder.
        elements.reportInitialCaptureUploadButtons.style.display = "flex"; // Show initial capture/upload buttons.
        elements.reportWebcamActionButtons.style.display = "none"; // Hide webcam action buttons.
        elements.reportImageActionButtons.style.display = "none"; // Hide image action buttons.
    });

    // Event listener for when a file is selected for upload in the report section.
    elements.reportFileUpload.addEventListener("change", (event) => handleFileUpload(event, displayCapturedImageForReport));

    // Event listener for the "Upload Image" button in the report section.
    elements.reportUploadButton.addEventListener("click", () => {
        elements.reportFileUpload.click(); // Programmatically click the hidden file input for report.
        elements.reportInitialCaptureUploadButtons.style.display = 'none'; // Hide initial buttons.
        elements.reportWebcamActionButtons.style.display = "none"; // Hide webcam action buttons.
        elements.reportImageActionButtons.style.display = "none"; // Hide image action buttons.
    });

    // Event listener for "Retake Photo/Select New Image" button in the report section.
    elements.retakeOrSelectNewReportButton.addEventListener("click", () => {
        elements.reportUploadedImage.style.display = "none"; // Hide uploaded image.
        elements.reportPlaceholderImage.style.display = "flex"; // Show placeholder.
        elements.reportInitialCaptureUploadButtons.style.display = "flex"; // Show initial capture/upload buttons.
        elements.reportWebcamActionButtons.style.display = "none"; // Hide webcam action buttons.
        elements.reportImageActionButtons.style.display = "none"; // Hide image action buttons.
        document.getElementById('reportFileUpload').value = ''; // Clear file input.
        state.currentImageDataUrl = null; // Clear image data URL.
        state.currentImage = null; // Clear current image.
    });

    // Event listener for the bug report form submission.
    elements.reportBugForm.addEventListener("submit", submitBugReport);

    // Event listener for the "Cancel Report" button.
    elements.cancelReportButton.addEventListener("click", resetUI);

    // Event listener for closing the "Thank You" modal.
    elements.closeThankYouModal.addEventListener("click", () => {
        elements.thankYouModal.style.display = 'none'; // Hide the modal.
    });
}

/**
 * Populates the province and district dropdowns and sets up their change listeners.
 */
function initializeLocationDropdowns() {
    // Populate province dropdown.
    elements.reportLocationProvince.innerHTML = '<option value="">-- กรุณาเลือกจังหวัด --</option>';
    Object.keys(PROVINCES_DISTRICTS).forEach(province => {
        const option = document.createElement('option');
        option.value = province;
        option.textContent = province;
        elements.reportLocationProvince.appendChild(option);
    });

    // Add change listener to province dropdown to update districts.
    elements.reportLocationProvince.addEventListener('change', function() {
        const selectedProvince = this.value;
        elements.reportLocationDistrict.innerHTML = '<option value="">-- กรุณาเลือกอำเภอ --</option>';
        elements.reportLocationDistrict.disabled = !selectedProvince; // Disable district dropdown if no province is selected.
        
        if (selectedProvince) {
            PROVINCES_DISTRICTS[selectedProvince].forEach(district => {
                const option = document.createElement('option');
                option.value = district;
                option.textContent = district;
                elements.reportLocationDistrict.appendChild(option);
            });
        }
    });
}

/**
 * Resets the entire user interface to its initial state.
 */
function resetUI() {
    // Stop any active webcam streams.
    stopWebcam(elements.webcam, 'isWebcamActive');
    stopWebcam(elements.reportWebcam, 'isReportWebcamActive');

    // Hide all image display elements.
    elements.webcam.style.display = "none";
    elements.uploadedImage.style.display = "none";
    elements.placeholderImage.style.display = "flex"; // Show main placeholder.
    
    // Hide all analysis action buttons.
    elements.analysisActionButtons.style.display = "none";
    elements.analysisWebcamControls.style.display = "none";
    elements.captureButton.style.display = "none";
    elements.cancelWebcamButton.style.display = "none";
    elements.analysisImageControls.style.display = "none"; 
    elements.retakeOrSelectNewButton.style.display = "none";
    elements.backToHomeButton.style.display = "none";
    elements.analyzeButton.style.display = "none";

    // Hide all report section image elements and controls.
    elements.reportUploadedImage.style.display = "none";
    elements.reportPlaceholderImage.style.display = "none"; 
    elements.reportWebcam.style.display = "none";
    elements.reportInitialCaptureUploadButtons.style.display = "none";
    elements.reportWebcamActionButtons.style.display = "none";
    elements.reportImageActionButtons.style.display = "none";

    // Hide prediction result and report bug sections.
    elements.predictionResult.style.display = "none";
    elements.reportBugSection.style.display = "none";
    elements.thankYouModal.style.display = "none";

    // Reset state variables.
    state.currentImage = null;
    state.currentImageDataUrl = null;
    state.currentFlow = 'idle';
    state.imageSource = null;

    // Clear file input values and form data.
    document.getElementById('fileUpload').value = '';
    elements.reportBugForm.reset();
    elements.reportStatus.innerHTML = '';
    elements.reportStatus.className = '';

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
