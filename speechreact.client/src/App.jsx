
import { BrowserRouter as Router, Routes, Route, Link, Navigate, useNavigate } from "react-router-dom";
import { useState } from "react";
import axios from "axios";
import "./App.css"; // Подключаем стили

function Register() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const register = async () => {
        try {
            await axios.post("http://localhost:5000/api/auth/register", { email, password });
            alert("Registration successful");
        } catch (error) {
            alert("Registration failed");
        }
    };

    return (
        <div className="container">
            <h1>Register</h1>
            <input className="input" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
            <input className="input" type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
            <button className="button" onClick={register}>Register</button>
        </div>
    );
}

function Login({ setToken }) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();

    const login = async () => {
        try {
            const res = await axios.post("http://localhost:5000/api/auth/login", { email, password });
            setToken(res.data.token);
            navigate("/speech");
        } catch (error) {
            alert("Login failed");
        }
    };

    return (
        <div className="container">
            <h1>Login</h1>
            <input className="input" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
            <input className="input" type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
            <button className="button" onClick={login}>Login</button>
        </div>
    );
}

function SpeechTranslation({ token, setToken }) {
    const navigate = useNavigate();

    if (!token) {
        return <Navigate to="/login" />;
    }

    const [text, setText] = useState("");
    const [translatedText, setTranslatedText] = useState("");
    const [selectedLanguage, setSelectedLanguage] = useState("es");
    const [selectedSpeechLanguage, setSelectedSpeechLanguage] = useState("en-US");

    const availableLanguages = { es: "Spanish", fr: "French", de: "German", it: "Italian", zh: "Chinese" };
    const availableSpeechLanguages = { "en-US": "English", "ru-RU": "Russian", "fr-FR": "French", "de-DE": "German" };

    const recognizeSpeech = async () => {
        try {
            const res = await axios.post("http://localhost:5000/api/speech/recognize", {
                language: selectedSpeechLanguage
            }, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setText(res.data.text);
        } catch (error) {
            alert("Speech recognition failed");
        }
    };

    const translateSpeech = async () => {
        try {
            const res = await axios.post("http://localhost:5000/api/speech/translate", {
                text,
                targetLanguage: selectedLanguage,
            }, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setTranslatedText(res.data.translatedText);
        } catch (error) {
            alert("Translation failed");
        }
    };

    const logout = () => {
        setToken(null);
        navigate("/login");
    };

    return (
        <div className="container">
            <h1>Speech Recognition & Translation</h1>
            <select className="select" value={selectedSpeechLanguage} onChange={(e) => setSelectedSpeechLanguage(e.target.value)}>
                {Object.entries(availableSpeechLanguages).map(([code, name]) => (
                    <option key={code} value={code}>{name}</option>
                ))}
            </select>
            <button className="button" onClick={recognizeSpeech}>Recognize Speech</button>
            <p className="text">Recognized Text: {text}</p>
            <select className="select" value={selectedLanguage} onChange={(e) => setSelectedLanguage(e.target.value)}>
                {Object.entries(availableLanguages).map(([code, name]) => (
                    <option key={code} value={code}>{name}</option>
                ))}
            </select>
            <button className="button" onClick={translateSpeech}>Translate</button>
            <p className="text">Translated Text: {translatedText}</p>
            <button className="button logout" onClick={logout}>Logout</button>
        </div>
    );
}

export default function App() {
    const [token, setToken] = useState(null);

    return (
        <Router>
            <nav className="nav">
                <Link to="/register" className="nav-link">Register</Link>
                <Link to="/login" className="nav-link">Login</Link>
                <Link to="/speech" className="nav-link">Speech Translation</Link>
            </nav>
            <Routes>
                <Route path="/register" element={<Register />} />
                <Route path="/login" element={<Login setToken={setToken} />} />
                <Route path="/speech" element={<SpeechTranslation token={token} setToken={setToken} />} />
            </Routes>
        </Router>
    );
}







