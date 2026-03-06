function loadDate() {
  const now = new Date();
  document.getElementById("datetime").value = now.toLocaleString("ja-JP");
}
loadDate();

// --------------------------------------------
// 緊急症状パターン
// --------------------------------------------
const emergencyPatterns = [
  {
    type: "意識障害・倒れ込み",
    keywords: ["倒れ", "意識", "立てない", "様子がおかしい", "動けない", "ぐったり", "ぼんやり", "突然", "急に"],
    advice:
      "1) 安全確保\n2) 呼吸確認\n3) 呼吸なし → 119番通報＋心肺蘇生\n4) 呼吸あり → 回復体位で観察\n5) 頭部外傷の可能性 → 受診推奨"
  },
  {
    type: "呼吸異常",
    keywords: ["呼吸", "息苦", "過呼吸", "胸", "ハァハァ"],
    advice:
      "1) 楽な姿勢\n2) ゆっくり呼吸\n3) 苦しさ増悪 → 119番\n4) 胸痛伴う場合 → 緊急"
  }
];

// --------------------------------------------
// 怪我パターン
// --------------------------------------------
const treatmentPatterns = [
  {
    type: "擦り傷",
    keywords: ["擦り傷", "すり傷", "転んで", "こす", "表皮"],
    advice: "流水洗浄 → 汚れ除去 → 消毒 → ガーゼ保護"
  },
  {
    type: "切り傷",
    keywords: ["切り", "刃物", "カッター", "切創"],
    advice: "血を圧迫止血 → 洗浄 → 消毒 → ガーゼ → 深い場合受診"
  },
  {
    type: "打撲",
    keywords: ["打撲", "ぶつけ", "青あざ", "腫れ"],
    advice: "RICE処置（安静・冷却・圧迫・挙上）"
  },
  {
    type: "捻挫",
    keywords: ["捻挫", "ひねり", "関節", "足首", "手首"],
    advice: "RICE処置 → 激痛や変形なら受診"
  },
  {
    type: "出血",
    keywords: ["出血", "血が", "流血"],
    advice: "圧迫止血 → 10分継続 → 止まらなければ受診"
  },
  {
    type: "火傷",
    keywords: ["火傷", "やけど", "熱", "炎", "火"],
    advice: "流水で20分冷却 → 水ぶくれ保護 → 広範囲なら受診"
  },
  {
    type: "骨折疑い",
    keywords: ["骨", "折れ", "変形", "強い痛み", "動かせない"],
    advice: "固定 → 冷却 → すぐ医療機関へ"
  }
];

// --------------------------------------------
// AED の判断ロジック
// --------------------------------------------
function judgeAED(text) {
  text = text.replace(/\s/g, "");

  const noBreath = ["呼吸がない", "息してない", "無呼吸", "呼吸停止", "動かない"];
  const noPulse = ["脈がない", "心臓", "心停止"];
  const collapse = ["突然倒れ", "急に倒れ", "急に崩れ", "意識がない", "ぐったり"];

  for (const w of noBreath)
    if (text.includes(w))
      return "【AED使用推奨】呼吸が確認できません。119番通報しAEDを使用してください。";

  for (const w of noPulse)
    if (text.includes(w))
      return "【AED使用推奨】脈が確認できません。AED＋心肺蘇生が必要です。";

  for (const w of collapse)
    if (text.includes(w))
      return "【AED使用推奨の可能性】突然の倒れ込みは心停止の可能性があります。呼吸確認し、なければAEDを準備。";

  return "AEDの必要性は高くありませんが、呼吸・意識に変化があれば再確認してください。";
}

// --------------------------------------------
// 治療アドバイス生成
// --------------------------------------------
function generateAdvice(text) {
  text = text.replace(/\s/g, "");

  for (const p of emergencyPatterns) {
    for (const k of p.keywords) {
      if (text.includes(k)) {
        return `【緊急判定】${p.type}\n${p.advice}`;
      }
    }
  }

  for (const p of treatmentPatterns) {
    for (const k of p.keywords) {
      if (text.includes(k)) {
        return `【診断】${p.type}\n${p.advice}`;
      }
    }
  }

  return "はっきり特定できません。痛み・息苦しさ・意識異常がある場合は受診を推奨します。";
}

// --------------------------------------------
// 入力時にリアルタイム表示
// --------------------------------------------
document.getElementById("detailInput").addEventListener("input", function () {
  const txt = this.value;
  document.getElementById("adviceText").innerText = generateAdvice(txt);
  document.getElementById("aedText").innerText = judgeAED(txt);
});

// --------------------------------------------
// ログ保存
// --------------------------------------------
function loadLogs() {
  return JSON.parse(localStorage.getItem("accidentLogs") || "[]");
}

function saveLogs(logs) {
  localStorage.setItem("accidentLogs", JSON.stringify(logs));
}

const tableBody = document.querySelector("#logTable tbody");

function renderTable() {
  const logs = loadLogs();
  tableBody.innerHTML = "";

  logs.forEach((log, index) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${log.datetime}</td>
      <td>${log.name}</td>
      <td>${log.place}</td>
      <td>${log.level}</td>
      <td>${log.detail}</td>
      <td>${log.advice.replace(/\n/g, "<br>")}</td>
      <td>${log.aed}</td>
      <td><button class="delete-btn" data-index="${index}">削除</button></td>
    `;
    tableBody.appendChild(tr);
  });
}
renderTable();

document.getElementById("accidentForm").addEventListener("submit", function (e) {
  e.preventDefault();

  const data = Object.fromEntries(new FormData(this));
  data.advice = generateAdvice(data.detail);
  data.aed = judgeAED(data.detail);

  const logs = loadLogs();
  logs.push(data);
  saveLogs(logs);

  document.getElementById("msg").innerText =
    "記録し、治療法とAED判定を保存しました。";

  renderTable();
  this.reset();
  loadDate();
});

// --------------------------------------------
// 削除
// --------------------------------------------
tableBody.addEventListener("click", function (e) {
  if (!e.target.classList.contains("delete-btn")) return;

  const index = e.target.dataset.index;
  const logs = loadLogs();
  logs.splice(index, 1);
  saveLogs(logs);
  renderTable();
});
