import hashlib
import time
from datetime import datetime
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import plotly.graph_objects as go

app = FastAPI(title="CivicFlow API", description="Backend for the CivicFlow educational platform")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class QueryModel(BaseModel):
    query: str
    language: str = "en"

class QuizSubmission(BaseModel):
    user_id: str
    answers: dict

# Mock Database for RAG
CONSTITUTION_CORPUS = [
    {"id": "art_324", "title": "Article 324", "content": "Superintendence, direction and control of elections to be vested in an Election Commission."},
    {"id": "art_14", "title": "Article 14", "content": "Equality before law. The State shall not deny to any person equality before the law."},
    {"id": "art_21", "title": "Article 21", "content": "Protection of life and personal liberty. No person shall be deprived of his life or personal liberty except according to procedure established by law."},
]

# Mock Correct Answers for Quiz
CORRECT_ANSWERS = {
    "q1": "a", # Example question 1
    "q2": "c", # Example question 2
    "q3": "b", # Example question 3
}

# Mock Blockchain Ledger
blockchain_ledger = []

@app.get("/")
def read_root():
    return {"message": "Welcome to CivicFlow API"}

@app.post("/api/rag/query")
def rag_query(query: QueryModel):
    # Mock RAG pipeline logic
    search_term = query.query.lower()
    matched_sources = []
    
    for doc in CONSTITUTION_CORPUS:
        if any(word in doc["content"].lower() for word in search_term.split()) or search_term in doc["title"].lower():
            matched_sources.append(doc["title"])
            
    if not matched_sources:
        matched_sources = ["General Guidelines"]
        
    return {
        "response": f"Simulated RAG response for '{query.query}' in language '{query.language}'. Based on the context, we found relevant constitutional information.",
        "sources": matched_sources
    }

@app.post("/api/quiz/submit")
def submit_quiz(submission: QuizSubmission):
    # Mock Gamified Quiz logic
    if not submission.answers:
        raise HTTPException(status_code=400, detail="Answers cannot be empty")
        
    correct_count = 0
    total_questions = len(CORRECT_ANSWERS)
    
    for q_id, answer in submission.answers.items():
        if q_id in CORRECT_ANSWERS and CORRECT_ANSWERS[q_id] == answer:
            correct_count += 1
            
    score_percentage = (correct_count / total_questions) * 100 if total_questions > 0 else 0
    
    if score_percentage >= 80:
        certification = "Civic Master"
    elif score_percentage >= 50:
        certification = "Civic Learner"
    else:
        certification = "Novice"
        
    return {
        "status": "success", 
        "score": round(score_percentage, 2), 
        "certification": certification,
        "correct_answers": correct_count,
        "total_questions": total_questions
    }

@app.post("/api/simulation/vote")
def simulate_vote(candidate_id: str):
    # Mock Interactive Voting Simulation and blockchain ledger logic
    timestamp = datetime.utcnow().isoformat()
    raw_data = f"{candidate_id}-{timestamp}-secret_salt"
    tx_hash = hashlib.sha256(raw_data.encode()).hexdigest()
    
    transaction = {
        "tx_hash": tx_hash,
        "candidate_id": candidate_id,
        "timestamp": timestamp
    }
    blockchain_ledger.append(transaction)
    
    return {
        "status": "success",
        "transaction_hash": tx_hash,
        "vvpat_slip": f"Candidate: {candidate_id}, Symbol: [CANDIDATE_SYMBOL]",
        "ledger_size": len(blockchain_ledger)
    }

@app.get("/api/data/trends")
def get_voting_trends():
    # Matplotlib/Plotly data delivery
    years = [2014, 2019, 2024]
    turnout = [66.4, 67.4, 65.8]
    
    fig = go.Figure(data=[go.Bar(x=years, y=turnout, marker_color='indigo')])
    fig.update_layout(title_text='Historical Voter Turnout (%)', xaxis_title='Election Year', yaxis_title='Turnout (%)')
    
    return {
        "type": "plotly_json",
        "data": fig.to_json()
    }
