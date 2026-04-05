let steps = 0;
let lastUpdate = 0;
let threshold = 9; // حساسية (نزلناها عشان يلقط المشي)

// تأكد فيه بيانات
if (!localStorage.getItem("name")) {
  window.location.href = "index.html";
}

// 👇 زر البداية (مهم جدًا)
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

// بدء العد
function startCounting() {
  window.addEventListener("devicemotion", function (event) {
    let acc = event.accelerationIncludingGravity;
    if (!acc) return;

    let magnitude = Math.sqrt(acc.x * acc.x + acc.y * acc.y + acc.z * acc.z);

    let now = Date.now();

    if (magnitude > threshold && now - lastUpdate > 400) {
      steps++;
      document.getElementById("steps").innerText = steps;
      lastUpdate = now;
    }
  });
}

// إنهاء (Google Sheets)
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
    },
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
