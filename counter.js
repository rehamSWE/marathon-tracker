let steps = 0;
let lastStepTime = 0;

// حساسية الحركة (أقوى ضد الغش)
let threshold = 13;
let minStepInterval = 700;

// تتبع الحركة
let lastMagnitude = 0;
let peakDetected = false;

// 👇 تتبع الاتجاه (مهم جدًا)
let lastY = 0;
let directionChanges = 0;

// تجاهل الحركات الصغيرة جدًا
let noiseThreshold = 2;

// ✅ إذا ما فيه بيانات → يرجع للبداية
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

    let magnitude = Math.sqrt(acc.x * acc.x + acc.y * acc.y + acc.z * acc.z);

    let now = Date.now();

    // ❌ تجاهل الاهتزازات الصغيرة
    if (Math.abs(magnitude - lastMagnitude) < noiseThreshold) {
      return;
    }

    // 👇 تتبع الاتجاه (فوق/تحت)
    if ((acc.y > 0 && lastY <= 0) || (acc.y < 0 && lastY >= 0)) {
      directionChanges++;
    }

    // 👇 كشف القمة
    if (magnitude > threshold && magnitude > lastMagnitude) {
      peakDetected = true;
    }

    // 👇 نحسب خطوة فقط إذا:
    if (
      peakDetected &&
      directionChanges >= 2 &&
      now - lastStepTime > minStepInterval
    ) {
      steps++;
      document.getElementById("steps").innerText = steps;
      lastStepTime = now;

      // إعادة التصفير
      peakDetected = false;
      directionChanges = 0;
    }

    lastMagnitude = magnitude;
    lastY = acc.y;
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

      // ✅ هنا التعديل المهم
      window.location.replace("thanks.html");
    })
    .catch(() => {
      alert("صار خطأ في الإرسال ❌");
    });
}