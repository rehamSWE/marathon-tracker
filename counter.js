let steps = 0;
let lastStepTime = 0;

// حساسية الحركة (أقوى ضد الغش)
let threshold = 13;
let minStepInterval = 700;

// تتبع الحركة
let lastMagnitude = 0;
let peakCount = 0;

// تجاهل الحركات الصغيرة جدًا
let noiseThreshold = 1.5;

if (!localStorage.getItem("name")) {
  window.location.href = "index.html";
}

function start() {
  requestPermission();
}

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

function startCounting() {
  window.addEventListener("devicemotion", function (event) {
    let acc = event.accelerationIncludingGravity;
    if (!acc) return;

    let magnitude = Math.sqrt(
      acc.x * acc.x + acc.y * acc.y + acc.z * acc.z
    );

    let now = Date.now();

    // تجاهل الاهتزازات الصغيرة
    if (Math.abs(magnitude - lastMagnitude) < noiseThreshold) {
      return;
    }

    // كشف القمة (Peak)
    if (magnitude > threshold && magnitude > lastMagnitude) {
      peakCount++;
    }

    // لازم قمتين عشان نحسب خطوة
    if (peakCount >= 2 && now - lastStepTime > minStepInterval) {
      steps++;
      document.getElementById("steps").innerText = steps;
      lastStepTime = now;
      peakCount = 0;
    }

    lastMagnitude = magnitude;
  });
}

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