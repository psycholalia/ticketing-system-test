import asyncio
import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from strawberry.fastapi import GraphQLRouter
import strawberry
from database import init_db, seed_data
from resolvers import Query, Mutation

@strawberry.type
class Schema:
    query: Query = strawberry.field(resolver=lambda: Query())
    mutation: Mutation = strawberry.field(resolver=lambda: Mutation())

schema = strawberry.Schema(query=Query, mutation=Mutation)

app = FastAPI(title="Trello-like API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

graphql_app = GraphQLRouter(schema)
app.include_router(graphql_app, prefix="/graphql")

@app.on_event("startup")
async def startup_event():
    await init_db()
    await seed_data()

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=4000)