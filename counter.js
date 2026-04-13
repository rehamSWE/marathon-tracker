let steps = 0;
let lastStepTime = 0;

// حساسية الحركة
let threshold = 9;
let minStepInterval = 600;

// تتبع الحركة
let lastMagnitude = 0;
let peakDetected = false;

// تتبع الاتجاه
let lastY = 0;
let directionChanges = 0;

// تجاهل الحركات الصغيرة
let noiseThreshold = 1;

// ➕ إضافة فقط
let started = false;

// ❌ حذف صوت الخطوات
// let stepSound = new Audio("sounds/1.mp3");

// 🔊 صوت واحد فقط
let goalSound = new Audio("sounds/goal.wav");

// ➕ العبارات
let messages = [
"هدفنــا 1500 خطوة نحو الأفضل ",
"هدفنــا  مع كل خطوة .. بيئة أنقى وهواء أنظف  ",
"هدفنــا بخطواتك .. نبني مجتمع أكثر نشاط ",
"هدفنــا انتباهك .. يصنع فرق في سلامة الطريق ",
" مديـنـتـك أمــانــة .. فاجعلها خضراء ",
"جــســد نـشـيــط .. عقل صافي وحياة أفضل ",
" كــن واعــياً .. تصل سالمًا ",
" التشجير روح المدينة المستدامة ",
"هدفنــا مع كل خطوة .. طاقة أكثر وحياة أجمل  ",
" الـتفاعــل مـع الـمـمـر الــذكـي .. سلوك حضاري ",
"المدن الخضراء تبدأ بخطوة صغيرة  ",
"هدفنــا كل خطوة .. تبني نمط حياة أكثر صحة   ",
"هدفنــا اتبع الممر الذكي .. خطوتك في الأمان  ",
" البيئة النظيفة تبدأ بمساحة خضراء ",
" كـــل خـــطــوة .. تقرّبك من نسخة أقوى منك ",
"هدفنــا انتباهك .. يحميك من المخاطر  ",
"التشجير روح المدينة المستدامة  ",
"هدفنــا كل خطوة .. استثمار في صحتك ",
" سـلامتك تبدأ بخطوة واعية ",
" ازرعـــهـا الـيــوم .. لتظلك غدًا ",
"هدفنــا خطوة منك .. تعزز صحتك كل يوم ",
" الممر الـذكـي يــوجّـهـك .. فاستجب له ",
"هدفنــا  مع كل خطوة .. بيئة أنقى وهواء أنظف  ",
"هدفنــا التزامك  .. طريق أكثر أمان للجميع ",
" طـــريــق آمـــن .. مجتمع مطمئن "
];

let goalReached = false;
let lastMessageIndex = -1;

// 🔥 تشغيل الصوت (مرة واحدة فقط)
function playGoalSound() {
  goalSound.currentTime = 0;
  goalSound.play().catch(()=>{});
}

if (localStorage.getItem("finished")) {
  window.location.replace("thanks.html");
}

if (!localStorage.getItem("name")) {
  window.location.replace("index.html");
}

function handleAction() {
  let btn = document.getElementById("actionBtn");

  if (!started) {
    playGoalSound(); // 🔊 عند البدء فقط

    start();
    started = true;

    btn.innerText = "إنهاء";
    btn.setAttribute("data-state", "end");

  } else {
    finish();
  }
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
          alert("يجب السماح بالحركة");
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

    if (Math.abs(magnitude - lastMagnitude) < noiseThreshold) {
      return;
    }

    if ((acc.y > 0 && lastY <= 0) || (acc.y < 0 && lastY >= 0)) {
      directionChanges++;
    }

    let smooth = (magnitude + lastMagnitude) / 2;

    if (smooth > 4 && smooth < 15) {

      if (
        directionChanges >= 0 &&
        now - lastStepTime > minStepInterval
      ) {
        steps++;
        document.getElementById("steps").innerText = steps;

        let textEl = document.getElementById("motivationText");

        if (steps >= 50 && steps % 50 === 0) {

          let index = Math.floor(steps / 50) - 1;
          index = index % messages.length;

          if (index !== lastMessageIndex) {
            lastMessageIndex = index;

            textEl.classList.remove("fade");
            void textEl.offsetWidth;
            textEl.innerText = messages[index];
            textEl.classList.add("fade");

            // 📳 اهتزاز فقط
            if (navigator.vibrate) {
              navigator.vibrate([200, 100, 200]);
            }
          }
        }

        if (steps >= 1500 && !goalReached) {
          goalReached = true;

          playGoalSound(); // 🔊 عند الهدف فقط

          if (navigator.vibrate) {
            navigator.vibrate([200, 100, 200]);
          }

          showGoalPopup();
        }

        lastStepTime = now;
        directionChanges = 0;
      }
    }

    lastMagnitude = magnitude;
    lastY = acc.y;
  });
}

function showGoalPopup() {
  let popup = document.createElement("div");
  popup.id = "goalPopup";

  popup.innerHTML = `
    <div class="popupBox">
      <h3>🎉 مبروك</h3>
      <p>وصـلـت لـهـدفـــك 1500 خطوة</p>
      <button onclick="closePopup()">استمر في التقدم</button>
    </div>
  `;

  document.body.appendChild(popup);
}

function closePopup() {
  let popup = document.getElementById("goalPopup");
  if (popup) popup.remove();
}

function finish() {
  if (steps < 5) {
    alert("لا يمكن إنهاء المشاركة قبل تسجيل عدد كافٍ من الخطوات");
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
      localStorage.setItem("finished", "true");
      localStorage.removeItem("name");
      localStorage.removeItem("phone");

      window.location.replace("thanks.html");
    })
    .catch(() => {
      alert(" خطأ في الإرسال ❌");
    });
}