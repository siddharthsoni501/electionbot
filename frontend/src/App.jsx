import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Vote, Brain, BarChart3, ChevronRight, User, ShieldCheck, Globe } from 'lucide-react';
import Plotly from 'plotly.js-dist-min';
import createPlotlyComponent from 'react-plotly.js/factory';
import './App.css';

const Plot = createPlotlyComponent(Plotly);
const API_BASE = 'http://localhost:8000';

function App() {
  const [activeTab, setActiveTab] = useState('hero');
  const [query, setQuery] = useState('');
  const [ragResponse, setRagResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [trends, setTrends] = useState(null);
  const [voteStatus, setVoteStatus] = useState(null);
  const [quizScore, setQuizScore] = useState(null);

  useEffect(() => {
    fetchTrends();
  }, []);

  const fetchTrends = async () => {
    try {
      const res = await axios.get(`${API_BASE}/api/data/trends`);
      if (res.data && res.data.data) {
        setTrends(JSON.parse(res.data.data));
      }
    } catch (err) {
      console.error("Error fetching trends:", err);
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
    try {
      const res = await axios.post(`${API_BASE}/api/simulation/vote?candidate_id=${candidateId}`);
      setVoteStatus(res.data);
    } catch (err) {
      console.error("Vote Error:", err);
    }
  };

  const handleQuizSubmit = async (answers) => {
    try {
      const res = await axios.post(`${API_BASE}/api/quiz/submit`, { user_id: 'user_123', answers });
      setQuizScore(res.data);
    } catch (err) {
      console.error("Quiz Error:", err);
    }
  };

  return (
    <div className="min-h-screen">
      <nav className="nav">
        <div className="logo-text">CivicFlow</div>
        <div className="nav-links">
          <button onClick={() => setActiveTab('hero')} className={`btn-link nav-link ${activeTab === 'hero' ? 'active' : ''}`}>Home</button>
          <button onClick={() => setActiveTab('explorer')} className={`btn-link nav-link ${activeTab === 'explorer' ? 'active' : ''}`}>AI Explorer</button>
          <button onClick={() => setActiveTab('simulation')} className={`btn-link nav-link ${activeTab === 'simulation' ? 'active' : ''}`}>Vote Sim</button>
          <button onClick={() => setActiveTab('quiz')} className={`btn-link nav-link ${activeTab === 'quiz' ? 'active' : ''}`}>Civic Quiz</button>
          <button onClick={() => setActiveTab('trends')} className={`btn-link nav-link ${activeTab === 'trends' ? 'active' : ''}`}>Trends</button>
        </div>
        <div className="flex items-center gap-4">
          <User className="text-secondary w-5 h-5" />
          <span className="text-sm font-medium">Guest</span>
        </div>
      </nav>

      <main className="app-container">
        <AnimatePresence mode="wait">
          {activeTab === 'hero' && (
            <motion.section 
              key="hero"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="hero"
            >
              <div className="badge mb-6 px-4 py-1 rounded-full border border-primary/30 bg-primary/10 text-primary text-sm font-semibold inline-flex items-center gap-2">
                <ShieldCheck className="w-4 h-4" /> Trusted Civic Platform
              </div>
              <h1>Empowering the <span className="text-primary">Next Generation</span> of Voters</h1>
              <p className="max-w-2xl text-center mb-10">
                CivicFlow is your AI-powered companion for understanding the constitution, 
                practicing your right to vote, and analyzing democratic trends with precision.
              </p>
              <div className="flex gap-4">
                <button onClick={() => setActiveTab('explorer')} className="btn btn-primary">Get Started <ChevronRight className="ml-2 w-4 h-4" /></button>
                <button onClick={() => setActiveTab('trends')} className="btn btn-outline">Explore Data</button>
              </div>

              <div className="grid mt-16">
                <div className="glass-card">
                  <Globe className="text-primary mb-4 w-10 h-10" />
                  <h3>Vernacular AI</h3>
                  <p>Understand complex laws in your own language with our RAG engine.</p>
                </div>
                <div className="glass-card">
                  <Vote className="text-secondary mb-4 w-10 h-10" />
                  <h3>Secure Voting</h3>
                  <p>Practice voting in a simulated, blockchain-verified environment.</p>
                </div>
                <div className="glass-card">
                  <Brain className="text-primary mb-4 w-10 h-10" />
                  <h3>Gamified Learning</h3>
                  <p>Test your knowledge and earn civic certifications as you learn.</p>
                </div>
              </div>
            </motion.section>
          )}

          {activeTab === 'explorer' && (
            <motion.section 
              key="explorer"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <div className="text-center mb-12">
                <h2>AI Constitution <span className="text-primary">Explorer</span></h2>
                <p>Ask anything about the Indian Constitution or Election Laws.</p>
              </div>

              <form onSubmit={handleRagQuery} className="max-w-2xl mx-auto mb-12">
                <div className="relative">
                  <input 
                    type="text" 
                    placeholder="Search e.g., 'What is Article 324?'" 
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="pr-16"
                  />
                  <button type="submit" className="absolute right-2 top-2 p-2 bg-primary rounded-lg">
                    <Search className="text-white w-5 h-5" />
                  </button>
                </div>
              </form>

              {loading && <div className="text-center text-primary">AI is thinking...</div>}

              {ragResponse && (
                <div className="glass-card max-w-3xl mx-auto animate-fade">
                  <div className="flex justify-between items-start mb-4">
                    <h4 className="text-xl font-bold">AI Response</h4>
                    <span className="text-xs bg-primary/20 text-primary px-2 py-1 rounded">RAG Verified</span>
                  </div>
                  <p className="text-white mb-6 leading-relaxed">{ragResponse.response}</p>
                  <div className="border-t border-white/10 pt-4">
                    <span className="text-sm font-semibold text-text-secondary block mb-2">Sources Found:</span>
                    <div className="flex gap-2 flex-wrap">
                      {ragResponse.sources.map((src, i) => (
                        <span key={i} className="text-xs bg-white/5 border border-white/10 px-3 py-1 rounded-full">{src}</span>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </motion.section>
          )}

          {activeTab === 'simulation' && (
            <motion.section 
              key="simulation"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
            >
              <div className="text-center mb-12">
                <h2>Interactive <span className="text-secondary">Voting</span> Simulation</h2>
                <p>Cast your practice vote and see how blockchain verifies your identity.</p>
              </div>

              {!voteStatus ? (
                <div className="grid max-w-4xl mx-auto">
                  {['Candidate A', 'Candidate B', 'Candidate C'].map((name) => (
                    <div key={name} className="glass-card flex flex-col items-center text-center">
                      <div className="w-20 h-20 bg-gradient-to-br from-primary to-secondary rounded-full mb-4 flex items-center justify-center text-2xl font-bold">
                        {name[name.length-1]}
                      </div>
                      <h3>{name}</h3>
                      <p className="text-sm mb-6">Progressive Alliance Party</p>
                      <button onClick={() => handleVote(name)} className="btn btn-primary w-full">Vote Now</button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="glass-card max-w-2xl mx-auto text-center animate-fade">
                  <div className="w-20 h-20 bg-green-500/20 text-green-500 rounded-full mx-auto mb-6 flex items-center justify-center">
                    <ShieldCheck className="w-10 h-10" />
                  </div>
                  <h3 className="text-2xl mb-2">Vote Verified!</h3>
                  <p className="mb-6">Your vote for <strong>{voteStatus.candidate_id}</strong> has been secured on the simulation ledger.</p>
                  
                  <div className="bg-black/40 p-4 rounded-xl text-left font-mono text-xs overflow-hidden text-ellipsis mb-6">
                    <span className="text-text-muted block mb-1">TX HASH:</span>
                    <span className="text-secondary">{voteStatus.transaction_hash}</span>
                  </div>
                  
                  <div className="bg-white/5 p-4 rounded-xl border border-white/10 text-left mb-8">
                    <span className="text-sm font-semibold block mb-2">VVPAT Slip:</span>
                    <p className="text-white italic">{voteStatus.vvpat_slip}</p>
                  </div>
                  
                  <button onClick={() => setVoteStatus(null)} className="btn btn-outline">Back to Simulation</button>
                </div>
              )}
            </motion.section>
          )}

          {activeTab === 'quiz' && (
            <motion.section 
              key="quiz"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <div className="text-center mb-12">
                <h2>Civic <span className="text-primary">Mastery</span> Quiz</h2>
                <p>Test your knowledge of the democratic process.</p>
              </div>

              {!quizScore ? (
                <div className="glass-card max-w-2xl mx-auto">
                  <div className="mb-8">
                    <span className="text-primary font-semibold mb-2 block">Question 1 of 3</span>
                    <h3 className="text-xl">What is the minimum age to vote in India?</h3>
                  </div>
                  <div className="flex flex-col gap-3">
                    <button onClick={() => handleQuizSubmit({ q1: 'a', q2: 'c', q3: 'b' })} className="btn btn-outline text-left justify-start">A) 18 Years</button>
                    <button className="btn btn-outline text-left justify-start">B) 21 Years</button>
                    <button className="btn btn-outline text-left justify-start">C) 25 Years</button>
                  </div>
                </div>
              ) : (
                <div className="glass-card max-w-xl mx-auto text-center">
                  <h3 className="text-3xl mb-2">Your Score: {quizScore.score}%</h3>
                  <div className="text-5xl font-bold text-primary mb-4">{quizScore.certification}</div>
                  <p className="mb-8 text-text-secondary">You got {quizScore.correct_answers} out of {quizScore.total_questions} questions correct.</p>
                  <button onClick={() => setQuizScore(null)} className="btn btn-primary">Retake Quiz</button>
                </div>
              )}
            </motion.section>
          )}

          {activeTab === 'trends' && (
            <motion.section 
              key="trends"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="text-center mb-12">
                <h2>Electoral <span className="text-secondary">Data</span> Hub</h2>
                <p>Real-time analytics and historical voter turnout trends.</p>
              </div>

              {trends && trends.data ? (
                <div className="glass-card overflow-hidden" style={{ minHeight: '500px' }}>
                  <Plot
                    data={trends.data}
                    layout={{
                      ...trends.layout,
                      paper_bgcolor: 'rgba(0,0,0,0)',
                      plot_bgcolor: 'rgba(0,0,0,0)',
                      font: { color: '#f8fafc', family: 'Outfit' },
                      autosize: true,
                      margin: { t: 50, b: 50, l: 50, r: 50 }
                    }}
                    style={{ width: '100%', height: '500px' }}
                    config={{ responsive: true, displayModeBar: false }}
                  />
                </div>
              ) : (
                <div className="text-center p-20 glass-card">
                  <BarChart3 className="w-20 h-20 text-text-muted mx-auto mb-4 animate-pulse" />
                  <p>{trends ? 'Data structure issue' : 'Loading analytics data...'}</p>
                </div>
              )}
            </motion.section>
          )}
        </AnimatePresence>
      </main>

      <style dangerouslySetInnerHTML={{ __html: `
        .btn-link {
          background: none;
          border: none;
          cursor: pointer;
          font-family: inherit;
        }
        .badge {
          backdrop-filter: blur(4px);
        }
      `}} />
    </div>
  );
}

export default App;
