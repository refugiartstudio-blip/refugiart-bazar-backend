
from fastapi import FastAPI

app = FastAPI()

@app.get("/")
async def root():
    return {"message": "Refugiart Bazar backend ativo no Railway!"}
