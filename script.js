const MODEL_URL = "https://teachablemachine.withgoogle.com/models/wsSrXpCPW/";
const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbxsgCInGAapb6YWlGyr42VDqtDIX0WgweSFfyzErTKvglGtFWPLdlQe_85xYYfgnaA-/exec"; 

// --- DOM Elements ---
const elements = {
    webcamButton: document.getElementById("webcamButton"),
    uploadButton: document.getElementById("uploadButton"),
    fileUpload: document.getElementById("fileUpload"),
    retakeButton: document.getElementById("retakeButton"),
    analyzeButton: document.getElementById("analyzeButton"),
    webcam: document.getElementById("webcam"),
    uploadedImage: document.getElementById("uploadedImage"),
    placeholderImage: document.getElementById("placeholderImage"),
    actionButtons: document.querySelector(".action-buttons"),
    predictionResult: document.getElementById("predictionResult"),
    resultText: document.getElementById("resultText"),
    additionalInfo: document.getElementById("additionalInfo"),
    reportBugSection: document.getElementById("reportBugSection"),
    reportBugForm: document.getElementById("reportBugForm"),
    insectName: document.getElementById("insectName"), // เพิ่มการอ้างอิงถึง input ชื่อแมลง
    reportDate: document.getElementById("reportDate"),
    reportLocationDistrict: document.getElementById("reportLocationDistrict"),
    reportLocationProvince: document.getElementById("reportLocationProvince"),
    reportPlantType: document.getElementById("reportPlantType"),
    damageCheckboxes: document.querySelectorAll('input[name="damage"]'),
    additionalComments: document.getElementById("additionalComments"),
    submitReportButton: document.getElementById("submitReportButton"),
    cancelReportButton: document.getElementById("cancelReportButton"),
    reportStatus: document.getElementById("reportStatus"),
    // NEW: อ้างอิงถึงปุ่ม "ส่งภาพแมลง"
    directSubmitEntryButton: document.getElementById("directSubmitEntryButton")
};

// --- State Management ---
const state = {
    model: null,
    isWebcamActive: false,
    currentImage: null,
    currentImageDataUrl: null,
    // NEW: สถานะเพื่อระบุว่าผู้ใช้กำลังอยู่ในโหมดใด (idle, analysis, direct_submission)
    currentFlow: 'idle' // 'idle', 'analysis', 'direct_submission'
};

// --- Insect Database ---
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

// --- Main Functions ---

async function initializeApp() {
    showInfoMessage("กำลังเตรียม AI ให้พร้อมใช้งาน...");
    try {
        state.model = await tmImage.load(MODEL_URL + "model.json", MODEL_URL + "metadata.json");
        resetUI();
    } catch (error) {
        console.error("Failed to load model:", error);
        showErrorMessage("ไม่สามารถโหลดโมเดล AI ได้ โปรดตรวจสอบการเชื่อมต่ออินเทอร์เน็ตแล้วรีเฟรชหน้าเว็บ");
    }
}

function resetUI() {
    stopWebcam();
    elements.webcam.style.display = "none";
    elements.uploadedImage.style.display = "none";
    elements.placeholderImage.style.display = "flex";
    elements.actionButtons.style.display = "none";
    elements.predictionResult.style.display = "none";
    elements.reportBugSection.style.display = "none";
    elements.webcamButton.innerHTML = '<i class="fas fa-camera"></i> ถ่ายภาพ';
    state.currentImage = null;
    state.currentImageDataUrl = null;
    state.currentFlow = 'idle'; // รีเซ็ต currentFlow กลับไปที่ 'idle' เสมอเมื่อ UI ถูกรีเซ็ต
    document.getElementById('fileUpload').value = '';
    elements.reportBugForm.reset();
    elements.reportStatus.innerHTML = '';
    elements.reportStatus.className = '';
    // แสดงปุ่มหลักทั้งหมด
    elements.webcamButton.style.display = 'flex';
    elements.uploadButton.style.display = 'flex';
    elements.directSubmitEntryButton.style.display = 'flex';
}

async function startWebcam() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: "environment" }
        });
        elements.webcam.srcObject = stream;
        elements.webcam.style.display = "block";
        elements.placeholderImage.style.display = "none";
        state.isWebcamActive = true;
        elements.webcamButton.innerHTML = '<i class="fas fa-camera"></i> ถ่ายภาพ';
    } catch (error) {
        console.error("Camera error:", error);
        showErrorMessage("ไม่สามารถเข้าถึงกล้องได้ โปรดอนุญาตการเข้าถึงในเบราว์เซอร์ของคุณ");
        resetUI(); // รีเซ็ต UI หากมีข้อผิดพลาด
        // state.currentFlow ถูกรีเซ็ตใน resetUI() แล้ว
    }
}

function stopWebcam() {
    if (state.isWebcamActive && elements.webcam.srcObject) {
        elements.webcam.srcObject.getTracks().forEach(track => track.stop());
        state.isWebcamActive = false;
        elements.webcam.srcObject = null;
    }
}

function captureFromWebcam() {
    if (!state.isWebcamActive) return;
    const canvas = document.createElement("canvas");
    canvas.width = elements.webcam.videoWidth;
    canvas.height = elements.webcam.videoHeight;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(elements.webcam, 0, 0, canvas.width, canvas.height);
    stopWebcam();
    displayCapturedImage(canvas);
}

function handleFileUpload(event) {
    const file = event.target.files[0];
    if (!file) return;
    // resetUI() ไม่ได้ถูกเรียกโดยตรงที่นี่ แต่ถูกเรียกโดยปุ่มที่เรียก handleFileUpload
    const reader = new FileReader();
    reader.onload = (e) => {
        const img = new Image();
        img.onload = () => displayCapturedImage(img);
        img.onerror = () => showErrorMessage("ไม่สามารถโหลดไฟล์รูปภาพได้");
        img.src = e.target.result;
    };
    reader.onerror = () => showErrorMessage("ไม่สามารถอ่านไฟล์ได้");
    reader.readAsDataURL(file);
}

function displayCapturedImage(imageElement) {
    state.currentImage = imageElement;
    const tempCanvas = document.createElement("canvas");
    tempCanvas.width = imageElement.width || imageElement.videoWidth;
    tempCanvas.height = imageElement.videoHeight || imageElement.height;
    const ctx = tempCanvas.getContext("2d");
    ctx.drawImage(imageElement, 0, 0, tempCanvas.width, tempCanvas.height);
    state.currentImageDataUrl = tempCanvas.toDataURL("image/png");

    elements.uploadedImage.src = state.currentImageDataUrl;
    elements.uploadedImage.style.display = "block";
    elements.placeholderImage.style.display = "none";
    
    elements.predictionResult.style.display = "none"; // ซ่อนผลลัพธ์เดิม
    elements.reportBugSection.style.display = "none"; // ซ่อนฟอร์มรายงานเดิม

    // ซ่อนปุ่มหลักเมื่อมีการแสดงภาพแล้ว ไม่ว่าจะอยู่ในโหมดใด
    elements.webcamButton.style.display = 'none';
    elements.uploadButton.style.display = 'none';
    elements.directSubmitEntryButton.style.display = 'none';

    if (state.currentFlow === 'direct_submission') {
        elements.actionButtons.style.display = "none"; // ซ่อนปุ่มวิเคราะห์/ถ่ายใหม่
        showReportBugForm(); // แสดงฟอร์มรายงานทันที (พร้อมภาพที่เพิ่งจับมา)
    } else { // โหมด 'analysis'
        elements.actionButtons.style.display = "flex"; // แสดงปุ่มวิเคราะห์/ถ่ายใหม่
    }
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
        const reasonsHTML = insectInfo.reasons.map(reason => `<li>${reason}</li>`).join("");
        elements.additionalInfo.innerHTML = `
            <div class="unknown-result">
                <p><i class="fas fa-exclamation-triangle"></i> ${insectInfo.details}</p>
                <ul>${reasonsHTML}</ul>
                <p><i class="fas fa-lightbulb"></i> <strong>คำแนะนำ:</strong> ${insectInfo.recommendation}</p>
                <button id="reportUnknownBugButton" class="btn-secondary" style="margin-top: 15px;">
                    <i class="fas fa-file-alt"></i> รายงานแมลงนี้
                </button>
            </div>
        `;
        const reportBtn = document.getElementById("reportUnknownBugButton");
        if (reportBtn) {
            reportBtn.addEventListener("click", showReportBugForm);
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
    elements.predictionResult.style.display = "none"; // ซ่อนผลการวิเคราะห์เสมอ
    elements.reportBugSection.style.display = "block"; // แสดงส่วนรายงานแมลง
    elements.reportBugForm.reset(); // รีเซ็ตฟอร์ม
    elements.reportStatus.innerHTML = '';
    elements.reportStatus.className = '';
    elements.reportDate.valueAsDate = new Date(); // กำหนดวันที่ปัจจุบัน

    // ซ่อนปุ่มหลักทั้งหมดเมื่อฟอร์มรายงานแสดงขึ้น
    elements.webcamButton.style.display = 'none';
    elements.uploadButton.style.display = 'none';
    elements.directSubmitEntryButton.style.display = 'none';
    elements.actionButtons.style.display = "none"; // ซ่อนปุ่มวิเคราะห์/ถ่ายใหม่

    // จัดการการแสดงผลภาพและปุ่มถ่าย/อัปโหลดภายในฟอร์มรายงาน
    if (state.currentFlow === 'direct_submission') {
        if (!state.currentImageDataUrl) {
            // ในโหมด direct_submission และยังไม่มีภาพ: แสดงปุ่มถ่าย/อัปโหลดในพื้นที่ภาพ
            elements.webcamButton.style.display = 'flex';
            elements.uploadButton.style.display = 'flex';
            elements.placeholderImage.style.display = 'flex'; // แสดง placeholder
            elements.uploadedImage.style.display = 'none';
            elements.webcam.style.display = 'none';
        } else {
            // ในโหมด direct_submission และมีภาพแล้ว: แสดงภาพที่จับมา
            elements.webcamButton.style.display = 'none';
            elements.uploadButton.style.display = 'none';
            elements.uploadedImage.src = state.currentImageDataUrl;
            elements.uploadedImage.style.display = "block";
            elements.placeholderImage.style.display = "none";
            elements.webcam.style.display = "none";
        }
    } else {
        // หากมาจากโหมด analysis (เช่น กด "รายงานแมลงนี้"): ภาพจะถูกแสดงอยู่แล้ว
        // ไม่ต้องทำอะไรกับปุ่มถ่าย/อัปโหลด เพราะถูกซ่อนไปแล้ว
    }
}

async function submitBugReport(event) {
    event.preventDefault();

    if (!state.currentImageDataUrl) {
        showReportStatus("error", "กรุณาถ่ายภาพหรืออัปโหลดรูปแมลงก่อนรายงาน");
        console.error("submitBugReport: No image data URL found."); // Debug log
        return;
    }

    console.log("submitBugReport: Image data URL present, proceeding with submission."); // Debug log

    showReportStatus("info", '<i class="fas fa-spinner fa-spin"></i> กำลังส่งข้อมูล...');
    elements.submitReportButton.disabled = true;

    const selectedDamage = Array.from(elements.damageCheckboxes)
                               .filter(checkbox => checkbox.checked)
                               .map(checkbox => checkbox.value);

    const formData = {
        image_data: state.currentImageDataUrl.split(',')[1],
        insect_name: elements.insectName.value || '', // ใช้ elements.insectName
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

        const result = await response.json();

        if (result.status === 'success') {
            showReportStatus("success", "ส่งข้อมูลรายงานแมลงสำเร็จ!");
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

// --- Event Listeners ---
elements.webcamButton.addEventListener("click", () => {
    // ถ้ากล้องกำลังทำงานอยู่ ให้ถ่ายภาพ
    if (state.isWebcamActive) {
        captureFromWebcam();
    } else {
        // ถ้ากล้องยังไม่ทำงาน
        // ตรวจสอบ flow ก่อนที่จะรีเซ็ต UI หรือเปลี่ยนโหมด
        if (state.currentFlow === 'idle') {
            resetUI(); // รีเซ็ต UI ก่อนเริ่ม flow ใหม่
            state.currentFlow = 'analysis'; // กำหนดโหมดเป็น 'analysis'
        } 
        // ถ้า currentFlow เป็น 'direct_submission' อยู่แล้ว ไม่ต้องเปลี่ยน state.currentFlow
        // แต่ต้องเตรียม UI ให้พร้อมสำหรับการถ่ายภาพ (ซ่อนปุ่มหลัก)
        elements.directSubmitEntryButton.style.display = 'none'; // ซ่อนปุ่ม "ส่งภาพแมลง" หลัก
        startWebcam();
    }
});

elements.uploadButton.addEventListener("click", () => {
    // ตรวจสอบ flow ก่อนที่จะรีเซ็ต UI หรือเปลี่ยนโหมด
    if (state.currentFlow === 'idle') {
        resetUI(); // รีเซ็ต UI ก่อนเริ่ม flow ใหม่
        state.currentFlow = 'analysis'; // กำหนดโหมดเป็น 'analysis'
    } 
    // ถ้า currentFlow เป็น 'direct_submission' อยู่แล้ว ไม่ต้องเปลี่ยน state.currentFlow
    // แต่ต้องเตรียม UI ให้พร้อมสำหรับการอัปโหลด (ซ่อนปุ่มหลัก)
    elements.directSubmitEntryButton.style.display = 'none'; // ซ่อนปุ่ม "ส่งภาพแมลง" หลัก
    elements.fileUpload.click();
});

elements.fileUpload.addEventListener("change", handleFileUpload);

elements.retakeButton.addEventListener("click", () => {
    // หากอยู่ในโหมด direct_submission และต้องการถ่ายใหม่
    if (state.currentFlow === 'direct_submission') {
        state.currentImage = null;
        state.currentImageDataUrl = null;
        showReportBugForm(); // กลับไปที่ฟอร์มพร้อมข้อความให้ถ่ายภาพใหม่
    } else { // โหมด analysis หรือ idle
        resetUI(); // รีเซ็ต UI ทั้งหมด
    }
});

elements.analyzeButton.addEventListener("click", analyzeImage);

elements.reportBugForm.addEventListener("submit", submitBugReport);

elements.cancelReportButton.addEventListener("click", () => {
    resetUI(); // รีเซ็ต UI
    // state.currentFlow ถูกรีเซ็ตใน resetUI() แล้ว
});

// NEW: Event Listener สำหรับปุ่ม "ส่งภาพแมลง"
elements.directSubmitEntryButton.addEventListener("click", () => {
    resetUI(); // รีเซ็ต UI ก่อน
    state.currentFlow = 'direct_submission'; // กำหนดโหมดเป็น 'direct_submission'
    showReportBugForm(); // แสดงฟอร์มรายงานทันที
});

window.addEventListener("load", initializeApp);
