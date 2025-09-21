from fastapi import APIRouter,HTTPException
from fastapi.responses import JSONResponse
from services.roadmap import chain
from services.chatbot_service import *

router = APIRouter()


@router.post("/chat", response_model=ChatResponse)
async def chat(msg: Message):
    user_message = msg.message.strip()
    session_id = msg.session_id
    timestamp = time.time()

    if not user_message:
        return ChatResponse(
            success=False,
            message="Please enter a message to get career guidance.",
            response_type="error",
            session_id=session_id,
            timestamp=timestamp
        )

    if session_id not in conversations:
        conversations[session_id] = []


    if check_pattern(user_message, QUICK_PATTERNS['greeting']) and len(conversations[session_id]) == 0:
        conversations[session_id].append({"role": "user", "content": user_message})
        conversations[session_id].append({"role": "assistant", "content": GREETING_RESPONSE["message"]})
        
        return ChatResponse(
            success=True,
            message=GREETING_RESPONSE["message"],
            response_type="greeting",
            session_id=session_id,
            timestamp=timestamp,
            suggestions=GREETING_RESPONSE["suggestions"]
        )
    if check_pattern(user_message, QUICK_PATTERNS['thanks']):
        response_msg = "You're very welcome! I'm glad I could help. Feel free to ask more career questions anytime."
        return ChatResponse(
            success=True,
            message=response_msg,
            response_type="acknowledgment",
            session_id=session_id,
            timestamp=timestamp,
            suggestions=["What other career topics can you help with?", "How to stay updated on industry trends?"]
        )

    if check_pattern(user_message, QUICK_PATTERNS['goodbye']):
        response_msg = "Best of luck with your career journey! Remember, every professional challenge is an opportunity for growth. Feel free to return anytime for guidance."
        return ChatResponse(
            success=True,
            message=response_msg,
            response_type="farewell",
            session_id=session_id,
            timestamp=timestamp
        )

    if not is_career_related_fast(user_message):
        
        try:
            ai_check = client.chat.completions.create(
                model=MODERATION_MODEL,
                messages=[
                    {"role": "system", "content": "Is this message related to careers, jobs, or professional development? Respond only 'YES' or 'NO'."},
                    {"role": "user", "content": user_message}
                ],
                max_tokens=5,
                temperature=0
            )
            if ai_check.choices[0].message.content.strip().upper() != "YES":
                return ChatResponse(
                    success=False,
                    message="I specialize in career coaching and professional development. Could you rephrase your question to focus on your career goals, job search, or professional growth?",
                    response_type="off_topic",
                    session_id=session_id,
                    timestamp=timestamp,
                    suggestions=[
                        "How to improve my resume?",
                        "Interview preparation tips",
                        "Career transition advice"
                    ]
                )
        except:
            pass  

    
    if moderate_content_ai(user_message):
        return ChatResponse(
            success=False,
            message="I maintain a professional environment focused on career development. Please keep our conversation appropriate and career-related.",
            response_type="moderation",
            session_id=session_id,
            timestamp=timestamp
        )

    
    conversations[session_id].append({"role": "user", "content": user_message})

    if len(conversations[session_id]) > MAX_CONVERSATION_HISTORY:
        conversations[session_id] = conversations[session_id][-MAX_CONVERSATION_HISTORY:]

    try:
        bot_response = generate_career_response(conversations[session_id])
        
        conversations[session_id].append({"role": "assistant", "content": bot_response})
        
        suggestions = get_career_suggestions(user_message)
        
        return ChatResponse(
            success=True,
            message=bot_response,
            response_type="advice",
            session_id=session_id,
            timestamp=timestamp,
            suggestions=suggestions
        )
        
    except Exception as e:
        return ChatResponse(
            success=False,
            message="I'm experiencing technical difficulties. Please try again in a moment, and I'll be happy to help with your career questions.",
            response_type="error",
            session_id=session_id,
            timestamp=timestamp
        )

@app.get("/")
async def root():
    return {
        "message": "Professional Career Coaching API is running",
        "version": "2.0",
        "features": ["OpenAI Integration", "JSON Responses", "Session Management", "Fast Pattern Matching"],
        "models": {
            "advice": ADVICE_MODEL,
            "moderation": MODERATION_MODEL
        }
    }

@router.delete("/chat/{session_id}")
async def clear_conversation(session_id: str):
    """Clear conversation history for a session"""
    if session_id in conversations:
        del conversations[session_id]
        return {"success": True, "message": "Conversation history cleared"}
    return {"success": False, "message": "Session not found"}

@router.get("/chat/{session_id}/history")
async def get_conversation_history(session_id: str):
    """Get conversation history for a session"""
    if session_id in conversations:
        return {
            "success": True,
            "session_id": session_id,
            "history": conversations[session_id],
            "message_count": len(conversations[session_id])
        }
    return {"success": False, "message": "Session not found"}

@router.get("/stats")
async def get_stats():
    """Get API usage statistics"""
    total_sessions = len(conversations)
    total_messages = sum(len(history) for history in conversations.values())
    
    return {
        "total_sessions": total_sessions,
        "total_messages": total_messages,
        "active_sessions": [sid for sid, history in conversations.items() if len(history) > 0]
    }