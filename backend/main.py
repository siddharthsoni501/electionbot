import hashlib
import time
import sqlite3
import json
from datetime import datetime
from typing import List, Optional
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
import os
from pydantic import BaseModel
import plotly.graph_objects as go

app = FastAPI(title="CivicFlow Pro API", description="Advanced Backend for CivicFlow with Persistence")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Database Initialization
DB_PATH = "civicflow.db"

def init_db():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    # Knowledge table for RAG
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS knowledge (
            id TEXT PRIMARY KEY,
            title TEXT,
            content TEXT,
            category TEXT
        )
    ''')
    # Quiz questions table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS quiz_questions (
            id TEXT PRIMARY KEY,
            question TEXT,
            options TEXT,
            correct_answer TEXT
        )
    ''')
    # Votes table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS votes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            voter_id TEXT UNIQUE,
            candidate_id TEXT,
            tx_hash TEXT,
            timestamp TEXT
        )
    ''')
    # Pre-populate Knowledge
    corpus = [
        ("art_324", "Article 324", "Vests the superintendence, direction, and control of all elections in the Election Commission of India (ECI).", "Constitution"),
        ("art_326", "Article 326", "Establishes Universal Adult Suffrage, granting the right to vote to every citizen aged 18 or older.", "Constitution"),
        ("mcc", "Model Code of Conduct", "A set of guidelines issued by the ECI for the conduct of political parties and candidates during elections.", "Process"),
        ("evm_vvpat", "EVM & VVPAT", "Electronic Voting Machines (EVM) are used to record votes, and VVPAT (Voter Verifiable Paper Audit Trail) provides a paper receipt for verification.", "Process"),
        ("nomination", "Nomination Process", "Candidates file nominations with the Returning Officer, followed by scrutiny and a withdrawal window.", "Process"),
        ("fptp", "First-Past-the-Post", "The electoral system where the candidate with the most votes in a constituency wins, used for Lok Sabha and Assemblies.", "Systems"),
    ]
    cursor.executemany("INSERT OR IGNORE INTO knowledge (id, title, content, category) VALUES (?, ?, ?, ?)", corpus)
    
    # Pre-populate Quiz
    quiz = [
        ("q1", "What is the minimum age to vote in India?", json.dumps(["18", "21", "25"]), "18"),
        ("q2", "Which body conducts national elections in India?", json.dumps(["Supreme Court", "ECI", "Parliament"]), "ECI"),
        ("q3", "What does EVM stand for?", json.dumps(["Electronic Voting Machine", "Election Vote Maker", "Every Voter Matters"]), "Electronic Voting Machine"),
        ("q4", "What is the tenure of the Lok Sabha?", json.dumps(["4 Years", "5 Years", "6 Years"]), "5 Years"),
        ("q5", "Who appoints the Chief Election Commissioner?", json.dumps(["Prime Minister", "President", "Chief Justice"]), "President"),
    ]
    cursor.executemany("INSERT OR IGNORE INTO quiz_questions (id, question, options, correct_answer) VALUES (?, ?, ?, ?)", quiz)
    
    conn.commit()
    conn.close()

init_db()

class QueryModel(BaseModel):
    query: str
    language: str = "en"

class VoteRequest(BaseModel):
    voter_id: str
    candidate_id: str

@app.get("/api/health")
def read_root():
    return {"status": "online", "message": "CivicFlow Pro API with Persistence is active"}

@app.get("/api/quiz/questions")
def get_quiz_questions():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("SELECT id, question, options FROM quiz_questions")
    rows = cursor.fetchall()
    conn.close()
    
    return [
        {"id": row[0], "text": row[1], "options": json.loads(row[2])}
        for row in rows
    ]

@app.post("/api/rag/query")
def rag_query(query: QueryModel):
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    search_term = f"%{query.query.lower()}%"
    cursor.execute("SELECT title, content FROM knowledge WHERE LOWER(title) LIKE ? OR LOWER(content) LIKE ?", (search_term, search_term))
    results = cursor.fetchall()
    conn.close()

    if not results:
        # Fallback to a broader search if no direct match
        return {
            "response": "I couldn't find specific details for that query. However, the Indian election process is managed by the ECI under Article 324, ensuring free and fair elections through steps like nomination, campaigning, and polling using EVMs.",
            "sources": ["General Constitutional Framework"]
        }

    response_text = " ".join([f"{r[0]}: {r[1]}" for r in results])
    return {
        "response": response_text,
        "sources": [r[0] for r in results]
    }

@app.post("/api/simulation/vote")
def record_vote(req: VoteRequest):
    timestamp = datetime.utcnow().isoformat()
    raw_data = f"{req.voter_id}-{req.candidate_id}-{timestamp}"
    tx_hash = hashlib.sha256(raw_data.encode()).hexdigest()

    try:
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        cursor.execute(
            "INSERT INTO votes (voter_id, candidate_id, tx_hash, timestamp) VALUES (?, ?, ?, ?)",
            (req.voter_id, req.candidate_id, tx_hash, timestamp)
        )
        conn.commit()
        conn.close()
    except sqlite3.IntegrityError:
        raise HTTPException(status_code=400, detail="Voter has already cast a vote.")

    return {
        "status": "success",
        "transaction_hash": tx_hash,
        "vvpat_slip": f"Voter ID: {req.voter_id} | Candidate: {req.candidate_id} | Verified via Simulation Ledger",
        "timestamp": timestamp
    }

@app.get("/api/data/trends")
def get_trends():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("SELECT candidate_id, COUNT(*) FROM votes GROUP BY candidate_id")
    live_results = cursor.fetchall()
    conn.close()

    # Historical baseline
    years = [2014, 2019, 2024]
    turnout = [66.4, 67.4, 65.8]
    
    # Current Simulation Results
    candidates = [r[0] for r in live_results] or ["No Votes Yet"]
    counts = [r[1] for r in live_results] or [0]

    # Combine into a multi-plot or single complex plot
    fig = go.Figure()
    # Historical Turnout
    fig.add_trace(go.Scatter(x=years, y=turnout, name="Historical Turnout (%)", line=dict(color='cyan', width=4)))
    # Live Simulation Votes
    fig.add_trace(go.Bar(x=candidates, y=counts, name="Live Sim Votes", marker_color='indigo'))

    fig.update_layout(
        title="Election Data: Historical Turnout vs Live Simulation",
        template="plotly_dark",
        paper_bgcolor='rgba(0,0,0,0)',
        plot_bgcolor='rgba(0,0,0,0)'
    )

    return {
        "type": "plotly_json",
        "data": fig.to_json(),
        "total_votes": sum(counts)
    }

@app.post("/api/quiz/submit")
def submit_quiz(answers: dict):
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("SELECT id, correct_answer FROM quiz_questions")
    correct_answers = dict(cursor.fetchall())
    conn.close()

    score = 0
    total = len(correct_answers)
    
    for q_id, user_answer in answers.items():
        if correct_answers.get(q_id) == user_answer:
            score += 1
    
    score_percentage = round((score / total) * 100, 2) if total > 0 else 0
    
    if score_percentage >= 80:
        certification = "Civic Master"
    elif score_percentage >= 50:
        certification = "Civic Learner"
    else:
        certification = "Novice"

    return {
        "score": score_percentage,
        "correct": score,
        "total": total,
        "certification": certification
    }

# Mount static files for frontend
if os.path.isdir("static"):
    app.mount("/", StaticFiles(directory="static", html=True), name="static")

@app.exception_handler(404)
async def custom_404_handler(request, exc):
    if os.path.isfile("static/index.html"):
        return FileResponse("static/index.html")
    return {"detail": "Not Found"}



