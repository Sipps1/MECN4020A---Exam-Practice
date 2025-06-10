from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles

app = FastAPI()

# Mount static files
app.mount("/", StaticFiles(directory="static", html=True), name="static")

@app.get("/questions")
def get_questions():
    import json
    with open("data/enriched_questions.json") as f:
        data = json.load(f)
    return {"questions": data}