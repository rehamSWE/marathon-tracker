let steps = 0;
let lastStepTime = 0;

// حساسية الحركة
let threshold = 12; // ارفعناها عشان يقلل التخبيص
let minStepInterval = 600; // أقل وقت بين الخطوات (مللي ثانية)

// للتأكد من "قمة" الحركة (مو أي اهتزاز)
let lastMagnitude = 0;
let isPeak = false;

// تأكد فيه بيانات
if (!localStorage.getItem("name")) {
  window.location.href = "index.html";
}

// زر البداية
function start() {
  requestPermission();
}

// طلب إذن الحركة (iPhone)
function requestPermission() {
  if (
    typeof DeviceMotionEvent !== "undefined" &&
    typeof DeviceMotionEvent.requestPermission === "function"
  ) {
    DeviceMotionEvent.requestPermission()
      .then((response) => {
        if (response === "granted") {
          startCounting();
        } else {
          alert("لازم تسمحين بالحركة 😅");
        }
      })
      .catch(console.error);
  } else {
    startCounting();
  }
}

// بدء العد (نسخة محسنة 🔥)
function startCounting() {
  window.addEventListener("devicemotion", function (event) {
    let acc = event.accelerationIncludingGravity;
    if (!acc) return;

    let magnitude = Math.sqrt(
      acc.x * acc.x + acc.y * acc.y + acc.z * acc.z
    );

    let now = Date.now();

    // 👇 فكرة القمة (Peak detection)
    if (magnitude > threshold && magnitude > lastMagnitude) {
      isPeak = true;
    }

    // لما ينزل بعد القمة → نحسب خطوة
    if (isPeak && magnitude < lastMagnitude) {
      if (now - lastStepTime > minStepInterval) {
        steps++;
        document.getElementById("steps").innerText = steps;
        lastStepTime = now;
      }
      isPeak = false;
    }

    lastMagnitude = magnitude;
  });
}

// إنهاء
function finish() {
  if (steps < 5) {
    alert("امشي شوي أول 😅");
    return;
  }

  let name = localStorage.getItem("name");
  let phone = localStorage.getItem("phone");

  fetch(
    "https://script.google.com/macros/s/AKfycbxnC4XtEQoYc2ufFOCOo1bT9B2j97Bg9Gs5V89H-bfzhuORMAJ1ciSbcYxA-rVL3Yd-/exec",
    {
      method: "POST",
      body: JSON.stringify({
        name: name,
        phone: phone,
        steps: steps,
      }),
    }
  )
    .then(() => {
      alert("تم تسجيل نتيجتك 👏");
      localStorage.clear();
      window.location.href = "index.html";
    })
    .catch(() => {
      alert("صار خطأ في الإرسال ❌");
    });
}