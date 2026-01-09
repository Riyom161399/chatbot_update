import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import {
  FaUserCircle,
  FaRobot,
  FaPaperPlane,
  FaSun,
  FaMoon,
  FaLightbulb,
} from "react-icons/fa";

function Bot() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);

  // 1. The Master List of Questions
  const allQuestions = [
    // --- Emergency & Safety ---

    "How can I call an ambulance?",
    "What should I do if I lose my Student ID?",
    "I lost my wallet, is there a Lost & Found?",
    "Who do I call in case of a fire?",
    // --- Daily Life ---
    "Where can I get a haircut on campus?",
    "Is there a laundry service for students?",
    "Where can I print my lab reports?",
    "When does the Central Cafeteria open?",
    "Where can I buy daily necessities/snacks?",
    "Is there a guest house for parents?",
    // --- Transport ---
    "What is the route for the city bus?",
    "Do I need to buy a ticket for the university bus?",
    "Can students park motorbikes on campus?",
    "How can I travel if I miss the bus?",
    // --- Academic ---
    "What happens if I fail a course?",
    "Do I need an admit card for final exams?",
    "What are the duties of a Class Rep (CR)?",
    "Does CUET offer MSc or PhD programs?",
    "Do we get study leave before exams?",
    "How many credits do I need to graduate?",
    "Where is the New Academic Building?",
    "Tell me about the library opening hours.",
    // --- Fests ---

    "Tell me about the Mechanical Engineering fest.",
    "What happens on Rag Day?",
    "What is the Rag Concert?",
    "Does the EEE department have a tech fest?",
    // --- Health ---
    "Does the university offer mental health counseling?",
    "Is the campus tap water safe to drink?",
    "Is there a medical center on campus?",
    "Do I need safety gear for labs?",
    // --- Fun ---
    "Where is the campus lake?",
    "Can we go hiking on the campus hills?",
    "What is the weather usually like?",
    "How big is the CUET campus?",

    // --- Admin ---
    "Where is the Vice-Chancellor's office?",
    "Where is the Proctor's office?",
    "Can international students apply to CUET?",
    "Is there a dress code for classes?",
    "Is there a Student Union?",
    // --- Tech ---
    "Where can I buy Arduino or electronic parts?",
    "Does CUET have research centers?",
    "How is the competitive programming culture?",
    "Does the university arrange internships?",
    "How do I connect to the WiFi?",
  ];

  // 2. NEW: This Ref holds the "Remaining Deck" of questions
  // We use useRef because we don't want to trigger re-renders just by modifying the list
  const questionsPool = useRef([...allQuestions]);

  const [suggestion, setSuggestion] = useState("");
  const messagesEndRef = useRef(null);

  // 3. UPDATED: Helper to get a random question from the REMAINING pool
  const shuffleSuggestion = () => {
    let pool = questionsPool.current;

    // If the pool is empty, reset it (reshuffle the full deck)
    if (pool.length === 0) {
      pool = [...allQuestions];
    }

    // Pick a random index
    const randomIndex = Math.floor(Math.random() * pool.length);
    const selectedQuestion = pool[randomIndex];

    // Remove the chosen question from the pool so it doesn't appear again
    pool.splice(randomIndex, 1);

    // Update the Ref and the State
    questionsPool.current = pool;
    setSuggestion(selectedQuestion);
  };

  // Initial Shuffle on Mount
  useEffect(() => {
    shuffleSuggestion();
  }, []);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const handleSendMessage = async (msgText = input) => {
    if (!msgText.trim()) return;

    const userMessage = msgText;
    setInput("");

    // 4. UPDATED: If the user typed a question that was in the pool, remove it now
    // This ensures if they manually type "Where is the library?", we don't suggest it later.
    const poolIndex = questionsPool.current.indexOf(userMessage);
    if (poolIndex > -1) {
      questionsPool.current.splice(poolIndex, 1);
    }

    // Generate the NEXT suggestion (from the remaining pool)
    shuffleSuggestion();

    setMessages((prev) => [...prev, { text: userMessage, sender: "user" }]);
    setLoading(true);

    try {
      const res = await axios.post("http://localhost:4002/bot/v1/message", {
        text: userMessage,
      });

      if (res.status === 200) {
        setMessages((prev) => [
          ...prev,
          { text: res.data.botMessage, sender: "bot" },
        ]);
      }
    } catch (error) {
      console.log("Error sending message:", error);
      setMessages((prev) => [
        ...prev,
        {
          text: "Sorry, I encountered an error.",
          sender: "bot",
          isError: true,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") handleSendMessage();
  };

  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  return (
    <div
      className={`flex flex-col min-h-screen font-sans transition-colors duration-500 ${
        isDarkMode
          ? "bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-red-900 via-neutral-900 to-black text-gray-100"
          : "bg-gradient-to-br from-red-50 via-slate-50 to-white text-gray-800"
      }`}
    >
      {/* Navbar */}
      <header
        className={`fixed top-0 left-0 w-full backdrop-blur-lg border-b z-20 shadow-lg transition-colors duration-500 ${
          isDarkMode
            ? "bg-black/40 border-white/10"
            : "bg-white/70 border-gray-200"
        }`}
      >
        <div className="container mx-auto flex justify-between items-center px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-tr from-yellow-500 to-red-600 p-2 rounded-lg shadow-lg shadow-orange-500/20">
              <FaRobot size={24} className="text-white" />
            </div>
            <h1 className="text-2xl font-bold tracking-wide">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500">
                CUET
              </span>
              <span className={isDarkMode ? "text-gray-300" : "text-gray-600"}>
                _BOT
              </span>
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-full transition-all duration-300 ${
                isDarkMode
                  ? "bg-gray-800 text-yellow-400 hover:bg-gray-700"
                  : "bg-gray-100 text-orange-600 hover:bg-gray-200"
              }`}
            >
              {isDarkMode ? <FaSun size={20} /> : <FaMoon size={20} />}
            </button>
            <FaUserCircle
              size={32}
              className={`transition-colors cursor-pointer ${
                isDarkMode
                  ? "text-gray-400 hover:text-yellow-400"
                  : "text-gray-400 hover:text-orange-500"
              }`}
            />
          </div>
        </div>
      </header>

      {/* Chat Area */}
      <main className="flex-1 overflow-y-auto pt-28 pb-40 px-4">
        <div className="w-full max-w-3xl mx-auto flex flex-col space-y-6">
          {/* Welcome Message */}
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-[50vh] text-center animate-fade-in-up">
              <div className="w-24 h-24 bg-gradient-to-tr from-red-600 to-orange-500 rounded-full flex items-center justify-center shadow-2xl shadow-orange-500/30 mb-6 animate-bounce-slow">
                <FaRobot size={40} className="text-white" />
              </div>
              <h2
                className={`text-4xl font-extrabold mb-2 ${
                  isDarkMode ? "text-white" : "text-gray-800"
                }`}
              >
                Hello, Student! 👋
              </h2>
              <p
                className={`text-xl max-w-md ${
                  isDarkMode ? "text-gray-400" : "text-gray-500"
                }`}
              >
                I am your{" "}
                <span className="text-yellow-500 font-semibold">
                  CUET Assistant
                </span>
                .
              </p>
            </div>
          )}

          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex w-full ${
                msg.sender === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`relative px-6 py-4 rounded-2xl max-w-[85%] text-lg md:text-xl font-medium shadow-md leading-relaxed ${
                  msg.sender === "user"
                    ? "bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-tr-sm"
                    : msg.isError
                    ? isDarkMode
                      ? "bg-red-950/80 border border-red-500/50 text-red-200"
                      : "bg-red-50 border border-red-200 text-red-600"
                    : isDarkMode
                    ? "bg-gray-800/60 backdrop-blur-sm border border-white/10 text-gray-100 rounded-tl-sm"
                    : "bg-white border border-gray-200 text-gray-800 rounded-tl-sm shadow-sm"
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start w-full">
              <div
                className={`px-6 py-5 rounded-2xl rounded-tl-sm flex items-center space-x-2 border backdrop-blur-sm ${
                  isDarkMode
                    ? "bg-gray-800/60 border-white/10"
                    : "bg-white border-gray-200 shadow-sm"
                }`}
              >
                <div
                  className="w-3 h-3 bg-yellow-500 rounded-full animate-bounce"
                  style={{ animationDelay: "0s" }}
                />
                <div
                  className="w-3 h-3 bg-orange-500 rounded-full animate-bounce"
                  style={{ animationDelay: "0.2s" }}
                />
                <div
                  className="w-3 h-3 bg-red-500 rounded-full animate-bounce"
                  style={{ animationDelay: "0.4s" }}
                />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </main>

      {/* Input Bar */}
      <footer className="fixed bottom-0 left-0 w-full z-20 px-4 pb-6 pt-2">
        <div className="max-w-3xl mx-auto flex flex-col gap-3">
          {/* Suggestion Chip */}
          {!loading && suggestion && (
            <div className="flex justify-center animate-fade-in-up">
              <button
                onClick={() => handleSendMessage(suggestion)}
                className={`flex items-center gap-2 px-5 py-2.5 text-base font-medium rounded-full transition-all duration-300 shadow-lg hover:scale-105 ${
                  isDarkMode
                    ? "bg-gray-800/80 hover:bg-gray-700 text-yellow-400 border border-yellow-500/30"
                    : "bg-white hover:bg-gray-50 text-orange-600 border border-orange-200"
                }`}
              >
                <FaLightbulb
                  className={isDarkMode ? "text-yellow-400" : "text-orange-500"}
                />
                {suggestion}
              </button>
            </div>
          )}

          {/* Input Field */}
          <div
            className={`relative flex items-center backdrop-blur-xl rounded-full border shadow-2xl transition-all duration-300 ${
              isDarkMode
                ? "bg-gray-900/80 border-white/10 shadow-orange-900/20"
                : "bg-white/80 border-gray-200 shadow-gray-200/50"
            }`}
          >
            <input
              type="text"
              className={`flex-1 bg-transparent px-6 py-4 outline-none rounded-full text-lg ${
                isDarkMode
                  ? "text-white placeholder-gray-500"
                  : "text-gray-800 placeholder-gray-400"
              }`}
              placeholder="Ask about CUET..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyPress}
              disabled={loading}
            />

            <button
              onClick={() => handleSendMessage(input)}
              disabled={!input.trim() || loading}
              className={`mr-2 p-3 rounded-full transition-all duration-300 flex items-center justify-center ${
                input.trim() && !loading
                  ? "bg-gradient-to-r from-yellow-500 to-red-600 text-white shadow-lg hover:scale-110"
                  : isDarkMode
                  ? "bg-gray-700 text-gray-500 cursor-not-allowed"
                  : "bg-gray-200 text-gray-400 cursor-not-allowed"
              }`}
            >
              <FaPaperPlane
                size={20}
                className={input.trim() && !loading ? "ml-1" : ""}
              />
            </button>
          </div>

          <div className="text-center">
            <span
              className={`text-xs ${
                isDarkMode ? "text-gray-500" : "text-gray-400"
              }`}
            >
              Powered by CUET AI Dept
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Bot;
