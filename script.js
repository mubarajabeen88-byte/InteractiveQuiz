const questions = [
  { question: "What does HTML stand for?", options: ["Hyper Text Markup Language", "High Tech Modern Language", "Hyper Transfer Machine Language", "Home Tool Markup Language"], answer: 0 },
  { question: "Which language is used to style web pages?", options: ["Python", "CSS", "Java", "SQL"], answer: 1 },
  { question: "Which keyword declares a constant in JavaScript?", options: ["var", "let", "const", "static"], answer: 2 },
  { question: "Which HTML tag is used to create a hyperlink?", options: ["<link>", "<a>", "<href>", "<url>"], answer: 1 },
  { question: "Which method selects an element by its ID?", options: ["getElementById()", "getElementsByClass()", "queryAll()", "selectElement()"], answer: 0 },
  { question: "Which CSS property changes text color?", options: ["font-style", "background", "color", "text-size"], answer: 2 },
  { question: "What does DOM stand for?", options: ["Data Object Management", "Document Object Model", "Digital Ordinance Model", "Document Orientation Method"], answer: 1 },
  { question: "Which symbol starts a JavaScript single-line comment?", options: ["<!--", "//", "**", "##"], answer: 1 },
  { question: "Which Bootstrap class creates a responsive container?", options: [".box", ".container", ".wrapper", ".responsive"], answer: 1 },
  { question: "Which HTML tag is used for the largest heading?", options: ["<h6>", "<head>", "<heading>", "<h1>"], answer: 3 }
];

const startScreen = document.getElementById("startScreen");
const quizScreen = document.getElementById("quizScreen");
const resultScreen = document.getElementById("resultScreen");
const startBtn = document.getElementById("startBtn");
const nextBtn = document.getElementById("nextBtn");
const restartBtn = document.getElementById("restartBtn");
const downloadBtn = document.getElementById("downloadBtn");
const themeToggle = document.getElementById("themeToggle");
const questionText = document.getElementById("questionText");
const optionsContainer = document.getElementById("optionsContainer");
const questionCounter = document.getElementById("questionCounter");
const timerDisplay = document.getElementById("timer");
const feedback = document.getElementById("feedback");
const segments = document.querySelectorAll(".segment");

const TOTAL_QUESTIONS = 5;
const TIME_LIMIT = 60;
let quizQuestions = [];
let currentQuestion = 0;
let score = 0;
let timeLeft = TIME_LIMIT;
let timerInterval = null;
let answered = false;
let quizResults = [];
let quizFinished = false;

function shuffle(array) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function startQuiz() {
  clearInterval(timerInterval);
  quizQuestions = shuffle(questions).slice(0, TOTAL_QUESTIONS);
  currentQuestion = 0;
  score = 0;
  timeLeft = TIME_LIMIT;
  answered = false;
  quizFinished = false;
  quizResults = [];

  startScreen.classList.add("hidden");
  resultScreen.classList.add("hidden");
  quizScreen.classList.remove("hidden");
  segments.forEach(segment => segment.className = "segment");
  timerDisplay.textContent = timeLeft;
  timerDisplay.parentElement.style.background = "";
  showQuestion();
  startTimer();
}

function showQuestion() {
  answered = false;
  const current = quizQuestions[currentQuestion];
  questionCounter.textContent = `Question ${currentQuestion + 1} of ${TOTAL_QUESTIONS}`;
  questionText.textContent = current.question;
  optionsContainer.innerHTML = "";
  feedback.textContent = "";
  nextBtn.disabled = true;
  nextBtn.textContent = currentQuestion === TOTAL_QUESTIONS - 1 ? "View Results →" : "Next Question →";

  segments.forEach((segment, index) => {
    segment.className = "segment";
    if (index < currentQuestion) segment.classList.add(quizResults[index].correct ? "done" : "wrong");
    else if (index === currentQuestion) segment.classList.add("current");
  });

  current.options.forEach((option, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "option-btn";

    const letter = document.createElement("span");
    letter.className = "option-letter";
    letter.textContent = String.fromCharCode(65 + index);

    const text = document.createElement("span");
    text.textContent = option;
    button.append(letter, text);
    button.addEventListener("click", () => selectAnswer(index));
    optionsContainer.appendChild(button);
  });
}

function selectAnswer(selectedIndex) {
  if (answered || quizFinished) return;
  answered = true;

  const current = quizQuestions[currentQuestion];
  const correct = selectedIndex === current.answer;
  if (correct) score++;

  quizResults[currentQuestion] = {
    question: current.question,
    selected: current.options[selectedIndex],
    correctAnswer: current.options[current.answer],
    correct
  };

  const buttons = optionsContainer.querySelectorAll(".option-btn");
  buttons.forEach((button, index) => {
    button.disabled = true;
    if (index === current.answer) button.classList.add("correct");
    if (index === selectedIndex && !correct) button.classList.add("incorrect");
  });

  feedback.textContent = correct
    ? "✓ Correct answer! Great job."
    : "✗ Incorrect. The correct answer is highlighted in green.";
  feedback.style.color = correct ? "#20b981" : "#f04458";
  segments[currentQuestion].className = `segment ${correct ? "done" : "wrong"}`;
  nextBtn.disabled = false;
}

function startTimer() {
  clearInterval(timerInterval);
  timerInterval = setInterval(() => {
    timeLeft--;
    timerDisplay.textContent = timeLeft;
    if (timeLeft <= 10) timerDisplay.parentElement.style.background = "#ffe1e4";
    if (timeLeft <= 0) finishQuiz(true);
  }, 1000);
}

function finishQuiz(timeExpired = false) {
  if (quizFinished) return;
  quizFinished = true;
  clearInterval(timerInterval);

  quizScreen.classList.add("hidden");
  startScreen.classList.add("hidden");
  resultScreen.classList.remove("hidden");

  const percentage = Math.round((score / TOTAL_QUESTIONS) * 100);
  document.getElementById("scorePercentage").textContent = `${percentage}%`;
  document.getElementById("correctCount").textContent = score;
  document.getElementById("wrongCount").textContent = TOTAL_QUESTIONS - score;
  document.getElementById("finalScore").textContent = `${score}/${TOTAL_QUESTIONS}`;

  document.getElementById("resultMessage").textContent = timeExpired
    ? "Time is up! Here is your result."
    : percentage >= 80
      ? "Excellent work! You have mastered this quiz."
      : percentage >= 60
        ? "Good job! Keep learning and improving."
        : "Keep practicing. You can do even better!";

  segments.forEach((segment, index) => {
    segment.className = `segment ${quizResults[index] && quizResults[index].correct ? "done" : "wrong"}`;
  });
}

function downloadPDF() {
  if (!window.jspdf) {
    alert("PDF library could not load. Please check your internet connection.");
    return;
  }

  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  const percentage = Math.round((score / TOTAL_QUESTIONS) * 100);

  doc.setFontSize(20);
  doc.text("QuizMaster - Quiz Results", 20, 20);
  doc.setFontSize(12);
  doc.text("Course: CSC336 Web Technologies", 20, 35);
  doc.text(`Date: ${new Date().toLocaleDateString()}`, 20, 45);
  doc.text(`Final Score: ${score}/${TOTAL_QUESTIONS}`, 20, 55);
  doc.text(`Percentage: ${percentage}%`, 20, 65);
  doc.text(`Correct Answers: ${score}`, 20, 75);
  doc.text(`Incorrect Answers: ${TOTAL_QUESTIONS - score}`, 20, 85);

  let y = 105;
  doc.setFontSize(14);
  doc.text("Answer Review", 20, y);
  y += 10;
  doc.setFontSize(10);

  quizResults.forEach((result, index) => {
    const lines = doc.splitTextToSize(`${index + 1}. ${result.question}`, 170);
    if (y + lines.length * 6 > 270) {
      doc.addPage();
      y = 20;
    }
    doc.text(lines, 20, y);
    y += lines.length * 6;

    const yourLines = doc.splitTextToSize(`Your answer: ${result.selected}`, 165);
    doc.text(yourLines, 25, y);
    y += yourLines.length * 6;

    const correctLines = doc.splitTextToSize(`Correct answer: ${result.correctAnswer}`, 165);
    doc.text(correctLines, 25, y);
    y += correctLines.length * 6 + 5;
  });

  doc.save("QuizMaster-Results.pdf");
}

themeToggle.addEventListener("click", () => {
  document.body.classList.toggle("dark");
  const isDark = document.body.classList.contains("dark");
  themeToggle.textContent = isDark ? "☀️ Light Mode" : "🌙 Dark Mode";
});

startBtn.addEventListener("click", startQuiz);
nextBtn.addEventListener("click", () => {
  if (!answered) return;
  if (currentQuestion < TOTAL_QUESTIONS - 1) {
    currentQuestion++;
    showQuestion();
  } else {
    finishQuiz();
  }
});
restartBtn.addEventListener("click", startQuiz);
downloadBtn.addEventListener("click", downloadPDF);
