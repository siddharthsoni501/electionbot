import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Vote, Brain, BarChart3, ChevronRight, User, ShieldCheck, Globe, HelpCircle } from 'lucide-react';
import Plotly from 'plotly.js-dist-min';
import createPlotlyFactory from 'react-plotly.js/factory';
import './App.css';

const createPlotlyComponent = typeof createPlotlyFactory === 'function' ? createPlotlyFactory : createPlotlyFactory.default;
const Plot = createPlotlyComponent(Plotly);
const API_BASE = import.meta.env.VITE_API_BASE_URL || '';

function App() {
  const [activeTab, setActiveTab] = useState('hero');
  const [query, setQuery] = useState('');
  const [voterId, setVoterId] = useState('');
  const [ragResponse, setRagResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [trends, setTrends] = useState(null);
  const [voteStatus, setVoteStatus] = useState(null);
  const [quizQuestions, setQuizQuestions] = useState([]);
  const [quizScore, setQuizScore] = useState(null);
  const [currentQuizStep, setCurrentQuizStep] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState({});

  useEffect(() => {
    fetchTrends();
    if (activeTab === 'quiz') {
      fetchQuizQuestions();
    }
  }, [activeTab]);

  const fetchTrends = async () => {
    try {
      const res = await axios.get(`${API_BASE}/api/data/trends`);
      if (res.data && res.data.data) {
        setTrends({
          ...JSON.parse(res.data.data),
          total_votes: res.data.total_votes
        });
      }
    } catch (err) {
      console.error("Error fetching trends:", err);
    }
  };

  const fetchQuizQuestions = async () => {
    try {
      const res = await axios.get(`${API_BASE}/api/quiz/questions`);
      setQuizQuestions(res.data);
    } catch (err) {
      console.error("Error fetching quiz questions:", err);
    }
  };

  const handleRagQuery = async (e) => {
    e.preventDefault();
    if (!query) return;
    setLoading(true);
    try {
      const res = await axios.post(`${API_BASE}/api/rag/query`, { query, language: 'en' });
      setRagResponse(res.data);
    } catch (err) {
      console.error("RAG Error:", err);
    }
    setLoading(false);
  };

  const handleVote = async (candidateId) => {
    if (!voterId) {
      alert("Please enter a Voter ID first!");
      return;
    }
    try {
      const res = await axios.post(`${API_BASE}/api/simulation/vote`, { voter_id: voterId, candidate_id: candidateId });
      setVoteStatus(res.data);
      fetchTrends();
    } catch (err) {
      alert(err.response?.data?.detail || "Vote Error");
      console.error("Vote Error:", err);
    }
  };

  const handleQuizOption = (qId, option) => {
    const newAnswers = { ...quizAnswers, [qId]: option };
    setQuizAnswers(newAnswers);
    if (currentQuizStep < quizQuestions.length - 1) {
      setCurrentQuizStep(currentQuizStep + 1);
    } else {
      submitQuiz(newAnswers);
    }
  };

  const submitQuiz = async (answers) => {
    try {
      const res = await axios.post(`${API_BASE}/api/quiz/submit`, answers);
      setQuizScore(res.data);
    } catch (err) {
      console.error("Quiz Error:", err);
    }
  };

  return (
    <div className="min-h-screen">
      <nav className="nav">
        <div className="logo-text">CivicFlow Pro</div>
        <div className="nav-links">
          <button onClick={() => setActiveTab('hero')} className={`btn-link nav-link ${activeTab === 'hero' ? 'active' : ''}`}>Home</button>
          <button onClick={() => setActiveTab('explorer')} className={`btn-link nav-link ${activeTab === 'explorer' ? 'active' : ''}`}>AI Explorer</button>
          <button onClick={() => setActiveTab('simulation')} className={`btn-link nav-link ${activeTab === 'simulation' ? 'active' : ''}`}>Vote Sim</button>
          <button onClick={() => setActiveTab('quiz')} className={`btn-link nav-link ${activeTab === 'quiz' ? 'active' : ''}`}>Civic Quiz</button>
          <button onClick={() => setActiveTab('trends')} className={`btn-link nav-link ${activeTab === 'trends' ? 'active' : ''}`}>Live Data</button>
        </div>
        <div className="flex items-center gap-4">
          <User className="text-secondary w-5 h-5" />
          <span className="text-sm font-medium">{voterId || 'Guest'}</span>
        </div>
      </nav>

      <main className="app-container">
        <AnimatePresence mode="wait">
          {activeTab === 'hero' && (
            <motion.section key="hero" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="hero">
              <div className="badge mb-6">
                <ShieldCheck className="w-4 h-4" /> Live Data Streams Active
              </div>
              <h1>Democracy <span className="text-primary">Digitized</span> & Explained</h1>
              <p className="max-w-2xl text-center mb-10">
                Connected to live simulation data and constitutional knowledge bases. 
                Understand, simulate, and analyze the democratic process in real-time.
              </p>
              <div className="flex gap-4">
                <button onClick={() => setActiveTab('explorer')} className="btn btn-primary">Start Learning</button>
                <button onClick={() => setActiveTab('simulation')} className="btn btn-outline">Cast Practice Vote</button>
              </div>
            </motion.section>
          )}

          {activeTab === 'explorer' && (
            <motion.section key="explorer" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <div className="text-center mb-12">
                <h2>Constitution <span className="text-primary">RAG Engine</span></h2>
                <p>Query the live knowledge base for verified election process details.</p>
              </div>
              <form onSubmit={handleRagQuery} className="search-form">
                <div className="search-container">
                  <input type="text" placeholder="Search e.g., 'Article 324' or 'Voting Process'" value={query} onChange={(e) => setQuery(e.target.value)} />
                  <button type="submit" className="search-button"><Search className="text-white w-5 h-5" /></button>
                </div>
              </form>
              {loading && <div className="text-center text-primary">Accessing Knowledge Base...</div>}
              {ragResponse && (
                <div className="glass-card max-w-3xl mx-auto animate-fade">
                  <h4 className="text-xl font-bold mb-4">Verified Insights</h4>
                  <p className="text-white mb-6 leading-relaxed">{ragResponse.response}</p>
                  <div className="border-t border-white/10 pt-4">
                    <span className="text-sm font-semibold text-text-secondary block mb-2">Primary Sources:</span>
                    <div className="flex gap-2 flex-wrap">
                      {ragResponse.sources.map((src, i) => (
                        <span key={i} className="text-xs bg-primary/20 border border-primary/40 px-3 py-1 rounded-full">{src}</span>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </motion.section>
          )}

          {activeTab === 'simulation' && (
            <motion.section key="simulation" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.05 }}>
              <div className="text-center mb-12">
                <h2>Advanced <span className="text-secondary">Voting</span> Simulation</h2>
                <p>Enter your ID and cast a persistent vote recorded on our simulation database.</p>
              </div>
              {!voteStatus ? (
                <div className="max-w-4xl mx-auto">
                  <div className="glass-card mb-8 p-6 flex flex-col md:flex-row gap-4 items-center">
                    <User className="text-primary w-8 h-8" />
                    <input 
                      type="text" 
                      placeholder="Enter Unique Voter ID (e.g. EPIC123)" 
                      value={voterId} 
                      onChange={(e) => setVoterId(e.target.value.toUpperCase())}
                      className="flex-1"
                    />
                    <span className="text-xs text-text-muted">Unique ID required for persistence</span>
                  </div>
                  <div className="grid">
                    {['Candidate Alpha', 'Candidate Beta', 'Candidate Gamma'].map((name) => (
                      <div key={name} className="glass-card flex flex-col items-center">
                        <div className="w-16 h-16 bg-white/5 rounded-full mb-4 flex items-center justify-center text-xl font-bold border border-white/10">{name[10]}</div>
                        <h3 className="mb-1">{name}</h3>
                        <p className="text-xs mb-6 text-text-muted">Registered Political Entity</p>
                        <button onClick={() => handleVote(name)} className="btn btn-primary w-full">Cast Vote</button>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="glass-card max-w-2xl mx-auto text-center animate-fade">
                  <ShieldCheck className="w-16 h-16 text-green-500 mx-auto mb-6" />
                  <h3 className="text-2xl mb-2">Vote Recorded Permanently</h3>
                  <p className="mb-6">Transaction Hash: <span className="text-secondary font-mono text-xs">{voteStatus.transaction_hash}</span></p>
                  <div className="bg-white/5 p-6 rounded-xl border border-white/10 text-left mb-8">
                    <span className="text-xs font-bold text-primary block mb-2 uppercase tracking-widest">Digital VVPAT Slip</span>
                    <p className="text-white font-mono text-sm">{voteStatus.vvpat_slip}</p>
                    <p className="text-text-muted text-[10px] mt-2">Timestamp: {voteStatus.timestamp}</p>
                  </div>
                  <button onClick={() => setVoteStatus(null)} className="btn btn-outline">New Simulation</button>
                </div>
              )}
            </motion.section>
          )}

          {activeTab === 'quiz' && (
            <motion.section key="quiz" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
              <div className="text-center mb-12">
                <h2>Civic <span className="text-primary">Mastery</span> Quiz</h2>
                <p>Real-time questions fetched from our live electoral knowledge base.</p>
              </div>
              {!quizScore ? (
                quizQuestions.length > 0 ? (
                  <div className="glass-card max-w-2xl mx-auto">
                    <div className="mb-8">
                      <span className="text-primary font-semibold mb-2 block">Question {currentQuizStep + 1} of {quizQuestions.length}</span>
                      <h3 className="text-xl">{quizQuestions[currentQuizStep].text}</h3>
                    </div>
                    <div className="flex flex-col gap-3">
                      {quizQuestions[currentQuizStep].options.map(opt => (
                        <button key={opt} onClick={() => handleQuizOption(quizQuestions[currentQuizStep].id, opt)} className="btn btn-outline text-left justify-start">{opt}</button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center p-10 glass-card">Loading live questions...</div>
                )
              ) : (
                <div className="glass-card max-w-xl mx-auto text-center">
                  <h3 className="text-3xl mb-4">Quiz Complete!</h3>
                  <div className="text-6xl font-bold text-primary mb-6">{quizScore.score}%</div>
                  <div className="text-2xl font-semibold text-secondary mb-4">{quizScore.certification}</div>
                  <p className="mb-8 text-text-secondary">You answered {quizScore.correct} out of {quizScore.total} questions correctly.</p>
                  <button onClick={() => { setQuizScore(null); setCurrentQuizStep(0); setQuizAnswers({}); fetchQuizQuestions(); }} className="btn btn-primary">Try New Questions</button>
                </div>
              )}
            </motion.section>
          )}

          {activeTab === 'trends' && (
            <motion.section key="trends" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="text-center mb-12">
                <h2>Live <span className="text-secondary">Election</span> Analytics</h2>
                <p>Aggregated data from the simulation database and historical benchmarks.</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="glass-card p-6 text-center">
                  <Vote className="text-primary mx-auto mb-2" />
                  <div className="text-3xl font-bold">{trends?.total_votes || 0}</div>
                  <div className="text-xs text-text-muted">Total Simulation Votes</div>
                </div>
                <div className="glass-card p-6 text-center">
                  <ShieldCheck className="text-secondary mx-auto mb-2" />
                  <div className="text-3xl font-bold">100%</div>
                  <div className="text-xs text-text-muted">Verification Accuracy</div>
                </div>
                <div className="glass-card p-6 text-center">
                  <Globe className="text-primary mx-auto mb-2" />
                  <div className="text-3xl font-bold">ECI</div>
                  <div className="text-xs text-text-muted">Regulatory Framework</div>
                </div>
              </div>
              {trends ? (
                <div className="glass-card overflow-hidden" style={{ minHeight: '500px' }}>
                  <Plot
                    data={trends.data}
                    layout={{
                      ...trends.layout,
                      autosize: true,
                      margin: { t: 50, b: 50, l: 50, r: 50 },
                      font: { family: 'Outfit', color: '#f8fafc' }
                    }}
                    style={{ width: '100%', height: '500px' }}
                    config={{ responsive: true, displayModeBar: false }}
                  />
                </div>
              ) : (
                <div className="text-center p-20 glass-card">
                  <BarChart3 className="w-16 h-16 text-text-muted mx-auto mb-4 animate-pulse" />
                  <p>Initializing live data streams...</p>
                </div>
              )}
            </motion.section>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

export default App;
