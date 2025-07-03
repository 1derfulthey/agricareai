const MODEL_URL = "https://teachablemachine.withgoogle.com/models/gCL-xqZ8C/";

// องค์ประกอบ DOM
const webcamButton = document.getElementById("webcamButton");
const uploadButton = document.getElementById("uploadButton");
const fileUpload = document.getElementById("fileUpload");
const retakeButton = document.getElementById("retakeButton");
const analyzeButton = document.getElementById("analyzeButton");
const webcamElement = document.getElementById("webcam");
const uploadedImageElement = document.getElementById("uploadedImage");
const canvasElement = document.getElementById("canvas");
const ctx = canvasElement.getContext("2d");
const resultText = document.getElementById("resultText");
const placeholderImage = document.getElementById("placeholderImage");
const confidenceBar = document.querySelector(".confidence-level");
const actionButtons = document.querySelector(".action-buttons");

// ตัวแปรสถานะ
let model, maxPredictions;
let isWebcamRunning = false;
let currentImage = null;

// ข้อมูลคำแนะนำสำหรับแมลงแต่ละชนิด
const insectAdvice = {
    "Lady Beetles - ด้วงเต่าลาย": {
        type: "friendly",
        advice: "ด้วงเต่าลายเป็นแมลงมีประโยชน์",
        detail: "ตัวเต็มวัยกินเพลี้ยวันละ 50-60 ตัว ควรอนุรักษ์ในสวน",
        solution: "ปลูกพืชดอกสีเหลืองเพื่อดึงดูดด้วงเต่าลาย"
    },
    "Green Lacewing - แมลงช้างปีกใส": {
        type: "friendly",
        advice: "แมลงช้างปีกใสเป็นแมลงมีประโยชน์",
        detail: "ตัวอ่อนกินเพลี้ยและไรศัตรูพืช ช่วยควบคุมประชากรศัตรูพืช",
        solution: "ปลูกพืชมีดอกเล็กๆ เพื่อดึงดูดตัวเต็มวัย"
    },
    "Stink Bug - มวนพิฆาต": {
        type: "friendly",
        advice: "มวนพิฆาตเป็นแมลงมีประโยชน์",
        detail: "กินหนอนและไข่ของแมลงศัตรูพืชหลายชนิด",
        solution: "รักษาสมดุลธรรมชาติในสวน"
    },
    "Assassin Bug - มวนเพชฌฆาต": {
        type: "friendly",
        advice: "มวนเพชฌฆาตเป็นแมลงมีประโยชน์",
        detail: "ล่าแมลงศัตรูพืชขนาดเล็กด้วยการดูดของเหลว",
        solution: "ไม่ควรใช้สารเคมีเพราะจะทำลายประชากรมวนชนิดนี้"
    },
    "Mealybugs - เพลี้ยแป้ง": {
        type: "pest",
        advice: "เพลี้ยแป้งศัตรูพืชร้ายแรง",
        detail: "ดูดน้ำเลี้ยงทำให้พืชแคระแกร็นและผลิตน้ำหวานที่ทำให้เกิดราดำ",
        solution: "ใช้สารสะเดาหรือเชื้อราบิวเวอร์เรียฉีดพ่น"
    },
    "Cutworm - หนอนกระทู้": {
        type: "pest",
        advice: "หนอนกระทู้กัดกินใบพืช",
        detail: "กัดกินใบและลำต้นพืชอ่อนในเวลากลางคืน",
        solution: "ใช้เชื้อ Bt (Bacillus thuringiensis) ฉีดพ่นตอนเย็น"
    },
    "Striped Flea Beetle - ด้วงหมัดผักแถบลาย": {
        type: "pest",
        advice: "ด้วงหมัดผักแถบลายทำลายพืช",
        detail: "กัดกินใบพืชทำให้เป็นรูพรุน โดยเฉพาะพืชตระกูลกะหล่ำ",
        solution: "ใช้สเปรย์พริกไทยหรือคลุมดินด้วยวัสดุสะท้อนแสง"
    }
};

// ฟังก์ชันเริ่มต้น
async function init() {
    try {
        model = await tmImage.load(MODEL_URL + "model.json", MODEL_URL + "metadata.json");
        maxPredictions = model.getTotalClasses();
        resultText.innerText = "พร้อมใช้งาน! กรุณาถ่ายภาพแมลง";
    } catch (error) {
        console.error("ข้อผิดพลาดในการโหลดโมเดล:", error);
        resultText.innerText = "ไม่สามารถโหลดโมเดล AI ได้ โปรดตรวจสอบการเชื่อมต่ออินเทอร์เน็ต";
    }
}

// รีเซ็ต UI
function resetUI() {
    webcamElement.style.display = 'none';
    uploadedImageElement.style.display = 'none';
    canvasElement.style.display = 'none';
    placeholderImage.style.display = 'none';
    actionButtons.style.display = 'none';
    confidenceBar.style.width = '0%';
}

// เปิด/ปิด กล้องและถ่ายภาพ
async function toggleWebcamAndCapture() {
    if (!isWebcamRunning) {
        try {
            resetUI();
            
            webcamElement.style.display = 'block';
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { width: 400, height: 300, facingMode: "environment" },
                audio: false
            });
            webcamElement.srcObject = stream;
            isWebcamRunning = true;
            webcamButton.innerHTML = '<i class="fas fa-camera"></i> ถ่ายภาพ';
        } catch (error) {
            console.error("ไม่สามารถเปิดกล้อง:", error);
            resultText.innerText = "ไม่สามารถเข้าถึงกล้องได้";
            webcamButton.innerHTML = '<i class="fas fa-camera"></i> เปิดกล้อง';
        }
    } else {
        capturePhoto();
    }
}

// ถ่ายภาพจากกล้อง
function capturePhoto() {
    if (!isWebcamRunning) return;
    
    try {
        const resizedCanvas = resizeImage(webcamElement);
        const stream = webcamElement.srcObject;
        const tracks = stream.getTracks();
        tracks.forEach(track => track.stop());
        
        isWebcamRunning = false;
        webcamElement.style.display = 'none';
        webcamElement.srcObject = null;
        webcamButton.innerHTML = '<i class="fas fa-camera"></i> เปิดกล้อง';

        uploadedImageElement.src = resizedCanvas.toDataURL();
        uploadedImageElement.style.display = 'block';
        actionButtons.style.display = 'flex';
        currentImage = resizedCanvas;
        resultText.innerText = "พร้อมวิเคราะห์ภาพ";
    } catch (error) {
        console.error("ข้อผิดพลาดในการถ่ายภาพ:", error);
        resultText.innerText = "เกิดข้อผิดพลาดในการถ่ายภาพ";
    }
}

// ปรับขนาดรูปภาพ
function resizeImage(image, width = 224, height = 224) {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(image, 0, 0, width, height);
    return canvas;
}

// จัดการอัปโหลดไฟล์
function handleFileUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    resultText.innerText = "กำลังประมวลผลรูปภาพ...";
    resetUI();

    const reader = new FileReader();
    reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
            try {
                const resizedCanvas = resizeImage(img);
                uploadedImageElement.src = resizedCanvas.toDataURL();
                uploadedImageElement.style.display = 'block';
                actionButtons.style.display = 'flex';
                currentImage = resizedCanvas;
                resultText.innerText = "พร้อมวิเคราะห์ภาพ";
            } catch (error) {
                console.error("ข้อผิดพลาดในการประมวลผลภาพ:", error);
                resultText.innerText = "ไม่สามารถโหลดรูปภาพได้";
            }
        };
        img.onerror = () => {
            resultText.innerText = "ไม่สามารถโหลดรูปภาพได้";
        };
        img.src = e.target.result;
    };
    reader.onerror = () => {
        resultText.innerText = "ไม่สามารถอ่านไฟล์ได้";
    };
    reader.readAsDataURL(file);
}

// ทำนายภาพ
async function predict(image) {
    if (!model || !image) {
        resultText.innerText = "ยังไม่ได้โหลดโมเดลหรือไม่มีภาพที่จะวิเคราะห์";
        return;
    }

    try {
        resultText.innerHTML = '<i class="fas fa-spinner fa-spin"></i> กำลังวิเคราะห์ภาพ...';
        
        const prediction = await model.predict(image);
        let highestProbability = 0;
        let predictedClass = "ไม่ทราบ";

        for (let i = 0; i < maxPredictions; i++) {
            const { className, probability } = prediction[i];
            if (probability > highestProbability) {
                highestProbability = probability;
                predictedClass = className;
            }
        }

        confidenceBar.style.width = `${highestProbability * 100}%`;
        
        if (highestProbability > 0.8) {
            const adviceData = insectAdvice[predictedClass] || {
                type: "unknown",
                advice: "ไม่มีข้อมูลคำแนะนำเฉพาะ",
                detail: "กรุณาตรวจสอบข้อมูลเพิ่มเติมจากแหล่งอื่น",
                solution: "ปรึกษาผู้เชี่ยวชาญด้านกีฏวิทยา"
            };

            resultText.innerHTML = `
                <div class="prediction-header">
                    <strong>${predictedClass}</strong> 
                    <span>(${(highestProbability * 100).toFixed(1)}% ความมั่นใจ)</span>
                </div>
                <div class="advice-box ${adviceData.type}">
                    <div class="advice-header">
                        <span>${adviceData.advice}</span>
                    </div>
                    <div class="advice-detail">
                        <i class="fas fa-info-circle"></i>
                        <span>${adviceData.detail}</span>
                    </div>
                    <div class="advice-solution">
                        <i class="fas fa-lightbulb"></i>
                        <span><strong>วิธีแก้ไข:</strong> ${adviceData.solution}</span>
                    </div>
                </div>
            `;

            confidenceBar.style.backgroundColor = 
                adviceData.type === "friendly" ? "var(--primary-color)" :
                adviceData.type === "pest" ? "var(--danger-color)" :
                "var(--warning-color)";
        } else {
            resultText.innerHTML = `
                <div>ไม่สามารถระบุชนิดแมลงได้แน่ชัด (ความมั่นใจต่ำกว่า 80%)</div>
                <div class="advice-box unknown">
                    <i class="fas fa-question-circle"></i>
                    <span>กรุณาถ่ายภาพใหม่อีกครั้งในมุมที่ชัดเจน</span>
                </div>
            `;
            confidenceBar.style.backgroundColor = "var(--warning-color)";
        }
    } catch (error) {
        console.error("เกิดข้อผิดพลาดในการทำนาย:", error);
        resultText.innerHTML = `
            <div class="error-message">
                <i class="fas fa-exclamation-triangle"></i>
                เกิดข้อผิดพลาดในการวิเคราะห์
            </div>
        `;
        confidenceBar.style.width = '0%';
    }
}

// Event listeners
webcamButton.addEventListener("click", toggleWebcamAndCapture);
uploadButton.addEventListener("click", () => fileUpload.click());
fileUpload.addEventListener("change", handleFileUpload);
retakeButton.addEventListener("click", resetUI);
analyzeButton.addEventListener("click", () => predict(currentImage));

// เริ่มโหลดโมเดลเมื่อหน้าเว็บโหลดเสร็จ
window.addEventListener('load', init);