const MODEL_URL = "https://teachablemachine.withgoogle.com/models/gCL-xqZ8C/";

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
    additionalInfo: document.getElementById("additionalInfo")
};

// --- State Management ---
const state = {
    model: null,
    isWebcamActive: false,
    currentImage: null
};

// --- Insect Database ---
const INSECT_DB = {
    "Lady Beetles - ด้วงเต่าลาย": {
        type: "beneficial",
        description: "ด้วงเต่าลาย",
        details: "เป็นแมลงมีประโยชน์ ตัวเต็มวัยกินเพลี้ยวันละ 50-60 ตัว",
        recommendation: "ควรอนุรักษ์ในสวน โดยปลูกพืชดอกสีเหลืองเพื่อดึงดูด"
    },
    "Green Lacewing - แมลงช้างปีกใส": {
        type: "beneficial",
        description: "แมลงช้างปีกใส",
        details: "เป็นแมลงมีประโยชน์ ตัวอ่อนกินเพลี้ยและไรศัตรูพืช",
        recommendation: "ควรปลูกพืชมีดอกเล็กๆ เพื่อดึงดูดตัวเต็มวัย"
    },
    "Stink Bug - มวนพิฆาต": {
        type: "beneficial",
        description: "มวนพิฆาต",
        details: "เป็นแมลงมีประโยชน์ กินหนอนและไข่ของแมลงศัตรูพืชหลายชนิด",
        recommendation: "ควรรักษาสมดุลธรรมชาติในสวน"
    },
    "Assassin Bug - มวนเพชฌฆาต": {
        type: "beneficial",
        description: "มวนเพชฌฆาต",
        details: "เป็นแมลงมีประโยชน์ ล่าแมลงศัตรูพืชขนาดเล็ก",
        recommendation: "ไม่ควรใช้สารเคมีรุนแรงเพราะจะทำลายมวนชนิดนี้"
    },
    "Mealybugs - เพลี้ยแป้ง": {
        type: "pest",
        description: "เพลี้ยแป้ง",
        details: "เป็นศัตรูพืชร้ายแรง ดูดน้ำเลี้ยงทำให้พืชแคระแกร็น",
        recommendation: "ควรใช้สารสะเดาหรือเชื้อราบิวเวอร์เรียฉีดพ่น"
    },
    "Cutworm - หนอนกระทู้": {
        type: "pest",
        description: "หนอนกระทู้",
        details: "เป็นศัตรูพืช กัดกินใบและลำต้นพืชอ่อนในเวลากลางคืน",
        recommendation: "ควรใช้เชื้อ Bt (Bacillus thuringiensis) ฉีดพ่นตอนเย็น"
    },
    "Striped Flea Beetle - ด้วงหมัดผักแถบลาย": {
        type: "pest",
        description: "ด้วงหมัดผักแถบลาย",
        details: "เป็นศัตรูพืช กัดกินใบพืชทำให้เป็นรูพรุน",
        recommendation: "ควรใช้สเปรย์พริกไทยหรือคลุมดินด้วยวัสดุสะท้อนแสง"
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
    elements.webcamButton.innerHTML = '<i class="fas fa-camera"></i> เปิดกล้อง';
    state.currentImage = null;
    document.getElementById('fileUpload').value = ''; // Reset file input
}

async function startWebcam() {
    resetUI();
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
        resetUI();
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
    ctx.drawImage(elements.webcam, 0, 0);
    stopWebcam();
    displayCapturedImage(canvas);
}

function handleFileUpload(event) {
    const file = event.target.files[0];
    if (!file) return;
    resetUI();
    const reader = new FileReader();
    reader.onload = (e) => {
        const img = new Image();
        img.onload = () => displayCapturedImage(img);
        img.onerror = () => showError("ไม่สามารถโหลดไฟล์รูปภาพได้");
        img.src = e.target.result;
    };
    reader.onerror = () => showError("ไม่สามารถอ่านไฟล์ได้");
    reader.readAsDataURL(file);
}

function displayCapturedImage(imageElement) {
    state.currentImage = imageElement;
    elements.uploadedImage.src = imageElement.src || imageElement.toDataURL("image/jpeg");
    elements.uploadedImage.style.display = "block";
    elements.placeholderImage.style.display = "none";
    elements.actionButtons.style.display = "flex";
    elements.predictionResult.style.display = "none";
}

async function analyzeImage() {
    if (!state.currentImage || !state.model) {
        showErrorMessage("ไม่มีภาพสำหรับวิเคราะห์ หรือโมเดลยังไม่พร้อม");
        return;
    }
    showInfoMessage('<i class="fas fa-spinner fa-spin"></i> กำลังวิเคราะห์...');
    
    // Resize image for model (224x224)
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

    if (isConfident && INSECT_DB[topPrediction.className]) {
        insectInfo = INSECT_DB[topPrediction.className];
        elements.resultText.innerHTML = `
            <div class="insect-type-label ${insectInfo.type}">
                ${insectInfo.type === "beneficial" ? "แมลงมีประโยชน์" : "แมลงศัตรูพืช"}
            </div>
            <h4>${insectInfo.description}</h4>
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
            </div>
        `;
    }
}

// --- Helper Functions for UI ---
function showInfoMessage(message) {
    elements.predictionResult.style.display = "block";
    elements.resultText.innerHTML = message;
    elements.additionalInfo.innerHTML = "";
}

function showErrorMessage(message) {
    elements.predictionResult.style.display = "block";
    elements.resultText.innerHTML = `<div class="error-message"><i class="fas fa-exclamation-triangle"></i> ${message}</div>`;
    elements.additionalInfo.innerHTML = "";
}

// --- Event Listeners ---
elements.webcamButton.addEventListener("click", () => {
    state.isWebcamActive ? captureFromWebcam() : startWebcam();
});
elements.uploadButton.addEventListener("click", () => elements.fileUpload.click());
elements.fileUpload.addEventListener("change", handleFileUpload);
elements.retakeButton.addEventListener("click", resetUI);
elements.analyzeButton.addEventListener("click", analyzeImage);

window.addEventListener("load", initializeApp);