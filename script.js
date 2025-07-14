const MODEL_URL = "https://teachablemachine.withgoogle.com/models/wsSrXpCPW/";
const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbxsgCInGAapb6YWlGyr42VDqtDIX0WgweSFzzyErTKvglGtFWPLdlQe_85xYYfgnaA-/exec"; 

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

const state = {
    model: null,
    isWebcamActive: false,
    isReportWebcamActive: false,
    currentImage: null,
    currentImageDataUrl: null,
    currentFlow: 'idle',
    imageSource: null
};

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

const PROVINCES_DISTRICTS = {
    "กรุงเทพมหานคร": ["คลองสาน", "คลองสามวา", "คลองเตย", "จตุจักร", "ดอนเมือง", "ดินแดง"],
    "ตาก": ["แม่สอด", "เมืองตาก", "บ้านตาก", "สามเงา", "แม่ระมาด", "ท่าสองยาง"],
    "เชียงใหม่": ["เมืองเชียงใหม่", "หางดง", "สารภี", "สันทราย", "สันกำแพง", "ดอยสะเก็ด"],
    "นครราชสีมา": ["เมืองนครราชสีมา", "ปากช่อง", "สีคิ้ว", "สูงเนิน", "ขามทะเลสอ", "ด่านขุนทด"]
};

async function initializeApp() {
    showInfoMessage("กำลังเตรียม AI ให้พร้อมใช้งาน...");
    try {
        state.model = await tmImage.load(MODEL_URL + "model.json", MODEL_URL + "metadata.json");
        setupEventListeners();
        initializeLocationDropdowns();
        resetUI();
    } catch (error) {
        console.error("Failed to load model:", error);
        showErrorMessage("ไม่สามารถโหลดโมเดล AI ได้ โปรดตรวจสอบการเชื่อมต่ออินเทอร์เน็ตแล้วรีเฟรชหน้าเว็บ");
    }
}

function setupEventListeners() {
    elements.webcamButton.addEventListener("click", () => {
        resetUI();
        state.currentFlow = 'analysis_webcam';
        state.imageSource = 'webcam';
        elements.mainControlsSection.style.display = 'none';
        startWebcam(elements.webcam, 'isWebcamActive');
    });

    elements.captureButton.addEventListener("click", () => {
        captureFromWebcam(elements.webcam, displayCapturedImageForAnalysis);
    });

    elements.cancelWebcamButton.addEventListener("click", resetUI);

    elements.uploadButton.addEventListener("click", () => {
        resetUI();
        state.currentFlow = 'analysis_upload';
        state.imageSource = 'upload';
        elements.mainControlsSection.style.display = 'none';
        elements.fileUpload.click();
    });

    elements.fileUpload.addEventListener("change", (event) => {
        handleFileUpload(event, displayCapturedImageForAnalysis);
    });

    elements.retakeOrSelectNewButton.addEventListener("click", () => {
        elements.predictionResult.style.display = "none";

        if (state.imageSource === 'webcam') {
            elements.uploadedImage.style.display = "none";
            elements.placeholderImage.style.display = "none";
            startWebcam(elements.webcam, 'isWebcamActive');
            showAnalysisWebcamActionButtons();
        } else if (state.imageSource === 'upload') {
            elements.uploadedImage.style.display = "none";
            elements.placeholderImage.style.display = "flex";
            document.getElementById('fileUpload').value = '';
            elements.fileUpload.click();
            elements.analysisActionButtons.style.display = "none";
        }
    });

    elements.backToHomeButton.addEventListener("click", resetUI);
    elements.analyzeButton.addEventListener("click", analyzeImage);
    elements.reportBugEntryButton.addEventListener("click", () => {
        resetUI();
        state.currentFlow = 'report_submission';
        showReportBugForm();
    });

    elements.reportWebcamButton.addEventListener("click", () => {
        stopWebcam(elements.reportWebcam, 'isReportWebcamActive');
        startWebcam(elements.reportWebcam, 'isReportWebcamActive');
    });

    elements.captureButtonReport.addEventListener("click", () => {
        captureFromWebcam(elements.reportWebcam, displayCapturedImageForReport);
    });

    elements.cancelReportWebcamButton.addEventListener("click", () => {
        stopWebcam(elements.reportWebcam, 'isReportWebcamActive');
        elements.reportWebcam.style.display = "none";
        elements.reportPlaceholderImage.style.display = "flex";
        elements.reportInitialCaptureUploadButtons.style.display = "flex";
        elements.reportWebcamActionButtons.style.display = "none";
        elements.reportImageActionButtons.style.display = "none";
    });

    elements.reportFileUpload.addEventListener("change", (event) => handleFileUpload(event, displayCapturedImageForReport));
    elements.reportUploadButton.addEventListener("click", () => {
        elements.reportFileUpload.click();
        elements.reportInitialCaptureUploadButtons.style.display = 'none';
        elements.reportWebcamActionButtons.style.display = "none";
        elements.reportImageActionButtons.style.display = "none";
    });

    elements.retakeOrSelectNewReportButton.addEventListener("click", () => {
        elements.reportUploadedImage.style.display = "none";
        elements.reportPlaceholderImage.style.display = "flex";
        elements.reportInitialCaptureUploadButtons.style.display = "flex";
        elements.reportWebcamActionButtons.style.display = "none";
        elements.reportImageActionButtons.style.display = "none";
        document.getElementById('reportFileUpload').value = '';
        state.currentImageDataUrl = null;
        state.currentImage = null;
    });

    elements.reportBugForm.addEventListener("submit", submitBugReport);
    elements.cancelReportButton.addEventListener("click", resetUI);
    elements.closeThankYouModal.addEventListener("click", () => {
        elements.thankYouModal.style.display = 'none';
    });
}

function initializeLocationDropdowns() {
    elements.reportLocationProvince.innerHTML = '<option value="">-- กรุณาเลือกจังหวัด --</option>';
    Object.keys(PROVINCES_DISTRICTS).forEach(province => {
        const option = document.createElement('option');
        option.value = province;
        option.textContent = province;
        elements.reportLocationProvince.appendChild(option);
    });

    elements.reportLocationProvince.addEventListener('change', function() {
        const selectedProvince = this.value;
        elements.reportLocationDistrict.innerHTML = '<option value="">-- กรุณาเลือกอำเภอ --</option>';
        elements.reportLocationDistrict.disabled = !selectedProvince;
        
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

function resetUI() {
    stopWebcam(elements.webcam, 'isWebcamActive');
    stopWebcam(elements.reportWebcam, 'isReportWebcamActive');

    elements.webcam.style.display = "none";
    elements.uploadedImage.style.display = "none";
    elements.placeholderImage.style.display = "flex";
    
    elements.analysisActionButtons.style.display = "none";
    elements.analysisWebcamControls.style.display = "none";
    elements.captureButton.style.display = "none";
    elements.cancelWebcamButton.style.display = "none";
    elements.analysisImageControls.style.display = "none"; 
    elements.retakeOrSelectNewButton.style.display = "none";
    elements.backToHomeButton.style.display = "none";
    elements.analyzeButton.style.display = "none";

    elements.reportUploadedImage.style.display = "none";
    elements.reportPlaceholderImage.style.display = "none"; 
    elements.reportWebcam.style.display = "none";
    elements.reportInitialCaptureUploadButtons.style.display = "none";
    elements.reportWebcamActionButtons.style.display = "none";
    elements.reportImageActionButtons.style.display = "none";

    elements.predictionResult.style.display = "none";
    elements.reportBugSection.style.display = "none";
    elements.thankYouModal.style.display = "none";

    state.currentImage = null;
    state.currentImageDataUrl = null;
    state.currentFlow = 'idle';
    state.imageSource = null;

    document.getElementById('fileUpload').value = '';
    elements.reportBugForm.reset();
    elements.reportStatus.innerHTML = '';
    elements.reportStatus.className = '';

    elements.mainControlsSection.style.display = 'flex';
    elements.mainImageDisplayArea.style.display = 'flex';
    elements.webcamButton.style.display = 'flex';
    elements.uploadButton.style.display = 'flex';
    elements.reportBugEntryButton.style.display = 'flex';
}

async function startWebcam(videoElement, stateFlag) {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: "environment" }
        });
        videoElement.srcObject = stream;
        videoElement.style.display = "block";
        state[stateFlag] = true;
        
        if (videoElement === elements.webcam) {
            elements.placeholderImage.style.display = "none";
            showAnalysisWebcamActionButtons();
        } else if (videoElement === elements.reportWebcam) {
            elements.reportPlaceholderImage.style.display = "none";
            showReportWebcamActionButtons();
        }
    } catch (error) {
        console.error("Camera error:", error);
        showErrorMessage("ไม่สามารถเข้าถึงกล้องได้ โปรดอนุญาตการเข้าถึงในเบราว์เซอร์ของคุณ");
        
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

function stopWebcam(videoElement, stateFlag) {
    if (state[stateFlag] && videoElement.srcObject) {
        videoElement.srcObject.getTracks().forEach(track => track.stop());
        state[stateFlag] = false;
        videoElement.srcObject = null;
    }
}

function captureFromWebcam(videoElement, callback) {
    if (!state.isWebcamActive && !state.isReportWebcamActive) return;
    
    const canvas = document.createElement("canvas");
    canvas.width = videoElement.videoWidth;
    canvas.height = videoElement.videoHeight;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
    
    if (videoElement === elements.webcam) {
        stopWebcam(elements.webcam, 'isWebcamActive');
    } else if (videoElement === elements.reportWebcam) {
        stopWebcam(elements.reportWebcam, 'isReportWebcamActive');
    }
    
    callback(canvas);
}

function handleFileUpload(event, callback) {
    const file = event.target.files[0];
    if (!file) {
        if (event.target === elements.fileUpload) {
            resetUI();
        } else if (event.target === elements.reportFileUpload) {
            if (!state.currentImageDataUrl) {
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
        img.onload = () => callback(img);
        img.onerror = () => showErrorMessage("ไม่สามารถโหลดไฟล์รูปภาพได้");
        img.src = e.target.result;
    };
    reader.onerror = () => showErrorMessage("ไม่สามารถอ่านไฟล์ได้");
    reader.readAsDataURL(file);
}

function displayCapturedImageForAnalysis(imageElement) {
    state.currentImage = imageElement;
    const tempCanvas = document.createElement("canvas");
    tempCanvas.width = imageElement.width || imageElement.videoWidth;
    tempCanvas.height = imageElement.videoHeight || imageElement.height;
    const ctx = tempCanvas.getContext("2d");
    ctx.drawImage(imageElement, 0, 0, tempCanvas.width, tempCanvas.height);
    state.currentImageDataUrl = tempCanvas.toDataURL("image/png");

    elements.uploadedImage.src = state.currentImageDataUrl;
    elements.uploadedImage.style.display = "block";
    elements.webcam.style.display = "none";
    elements.placeholderImage.style.display = "none";
    
    elements.predictionResult.style.display = "none";
    elements.reportBugSection.style.display = "none";

    showAnalysisImageActionButtons();
    elements.mainControlsSection.style.display = 'none';
}

function displayCapturedImageForReport(imageElement) {
    state.currentImage = imageElement;
    const tempCanvas = document.createElement("canvas");
    tempCanvas.width = imageElement.width || imageElement.videoWidth;
    tempCanvas.height = imageElement.videoHeight || imageElement.height;
    const ctx = tempCanvas.getContext("2d");
    ctx.drawImage(imageElement, 0, 0, tempCanvas.width, tempCanvas.height);
    state.currentImageDataUrl = tempCanvas.toDataURL("image/png");

    elements.reportUploadedImage.src = state.currentImageDataUrl;
    elements.reportUploadedImage.style.display = "block";
    elements.reportWebcam.style.display = "none";
    elements.reportPlaceholderImage.style.display = "none";

    showReportImageActionButtons();
}

async function analyzeImage() {
    if (!state.currentImage || !state.model) {
        showErrorMessage("ไม่มีภาพสำหรับวิเคราะห์ หรือโมเดลยังไม่พร้อม");
        return;
    }
    showInfoMessage('<i class="fas fa-spinner fa-spin"></i> กำลังวิเคราะห์...');
    
    const canvas = document.createElement("canvas");
    canvas.width = 224;
    canvas.height = 224;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(state.currentImage, 0, 0, 224, 224);
    
    const predictions = await state.model.predict(canvas);
    displayPredictionResults(predictions);
}

function displayPredictionResults(predictions) {
    let topPrediction = predictions.reduce((prev, current) => (prev.probability > current.probability) ? prev : current);
    const isConfident = topPrediction.probability > 0.80;
    let insectInfo;

    elements.predictionResult.style.display = "block";
    elements.reportBugSection.style.display = "none";

    if (isConfident && INSECT_DB[topPrediction.className]) {
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
        const reportBtn = document.getElementById("reportUnknownBugButton");
        if (reportBtn) {
            reportBtn.addEventListener("click", () => {
                state.currentFlow = 'report_submission';
                showReportBugForm();
            });
        }
    }
}

function showInfoMessage(message) {
    elements.predictionResult.style.display = "block";
    elements.resultText.innerHTML = message;
    elements.additionalInfo.innerHTML = "";
    elements.reportBugSection.style.display = "none";
}

function showErrorMessage(message) {
    elements.predictionResult.style.display = "block";
    elements.resultText.innerHTML = `<div class="error-message"><i class="fas fa-exclamation-triangle"></i> ${message}</div>`;
    elements.additionalInfo.innerHTML = "";
    elements.reportBugSection.style.display = "none";
}

function showReportBugForm() {
    elements.mainControlsSection.style.display = 'none';
    elements.mainImageDisplayArea.style.display = 'none';
    elements.predictionResult.style.display = "none";

    elements.reportBugSection.style.display = "block";
    elements.reportBugForm.reset();
    elements.reportStatus.innerHTML = '';
    elements.reportStatus.className = '';
    elements.reportDate.valueAsDate = new Date();

    if (state.currentImageDataUrl) {
        elements.reportUploadedImage.src = state.currentImageDataUrl;
        elements.reportUploadedImage.style.display = "block";
        elements.reportPlaceholderImage.style.display = "none";
        showReportImageActionButtons();
    } else {
        elements.reportPlaceholderImage.style.display = "flex";
        elements.reportUploadedImage.style.display = "none";
        elements.reportWebcam.style.display = "none";
        elements.reportInitialCaptureUploadButtons.style.display = "flex";
        elements.reportWebcamActionButtons.style.display = "none";
        elements.reportImageActionButtons.style.display = "none";
    }
}

async function submitBugReport(event) {
    event.preventDefault();

    if (!state.currentImageDataUrl) {
        showReportStatus("error", "กรุณาถ่ายภาพหรืออัปโหลดรูปแมลงก่อนรายงาน");
        return;
    }

    showReportStatus("info", '<i class="fas fa-spinner fa-spin"></i> กำลังส่งข้อมูล...');
    elements.submitReportButton.disabled = true;

    const selectedDamage = Array.from(elements.damageCheckboxes)
                               .filter(checkbox => checkbox.checked)
                               .map(checkbox => checkbox.value);

    const formData = {
        image_data: state.currentImageDataUrl.split(',')[1],
        insect_name: elements.insectName.value || '',
        date_found: elements.reportDate.value,
        location_district: elements.reportLocationDistrict.value,
        location_province: elements.reportLocationProvince.value,
        plant_type: elements.reportPlantType.value,
        damage_observed: selectedDamage,
        additional_comments: elements.additionalComments.value
    };

    try {
        const response = await fetch(WEB_APP_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'text/plain;charset=utf-8'
            },
            body: JSON.stringify(formData)
        });

        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

        const result = await response.json();

        if (result.status === 'success') {
            showReportStatus("success", "ส่งข้อมูลรายงานแมลงสำเร็จ!");
            elements.thankYouModal.style.display = 'block';
            setTimeout(resetUI, 3000);
        } else {
            showReportStatus("error", `เกิดข้อผิดพลาด: ${result.message}`);
        }
    } catch (error) {
        console.error("Error submitting report:", error);
        showReportStatus("error", `ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้: ${error.message}`);
    } finally {
        elements.submitReportButton.disabled = false;
    }
}

function showReportStatus(type, message) {
    elements.reportStatus.innerHTML = message;
    elements.reportStatus.className = `report-status ${type}`;
}

function showAnalysisWebcamActionButtons() {
    elements.analysisActionButtons.style.display = "flex";
    elements.analysisWebcamControls.style.display = "flex";
    elements.captureButton.style.display = "flex";
    elements.cancelWebcamButton.style.display = "flex";
    elements.analysisImageControls.style.display = "none";
    elements.backToHomeButton.style.display = "none";
}

function showAnalysisImageActionButtons() {
    elements.analysisActionButtons.style.display = "flex";
    elements.analysisWebcamControls.style.display = "none";
    elements.captureButton.style.display = "none";
    elements.cancelWebcamButton.style.display = "none";
    elements.analysisImageControls.style.display = "flex";
    elements.retakeOrSelectNewButton.style.display = "flex";
    elements.backToHomeButton.style.display = "flex";
    elements.analyzeButton.style.display = "flex";

    if (state.imageSource === 'webcam') {
        elements.retakeOrSelectNewButton.innerHTML = '<i class="fas fa-rotate-left"></i> ถ่ายใหม่';
    } else if (state.imageSource === 'upload') {
        elements.retakeOrSelectNewButton.innerHTML = '<i class="fas fa-image"></i> เลือกภาพใหม่';
    }
}

function showReportWebcamActionButtons() {
    elements.reportInitialCaptureUploadButtons.style.display = "none"; 
    elements.reportWebcamActionButtons.style.display = "flex"; 
    elements.captureButtonReport.style.display = "flex";
    elements.cancelReportWebcamButton.style.display = "flex";
    elements.reportImageActionButtons.style.display = "none";
}

function showReportImageActionButtons() {
    elements.reportInitialCaptureUploadButtons.style.display = "none";
    elements.reportWebcamActionButtons.style.display = "none";
    elements.reportImageActionButtons.style.display = "flex";
    elements.retakeOrSelectNewReportButton.style.display = "flex";
}

window.addEventListener("load", initializeApp);
