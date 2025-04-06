from fastapi import FastAPI, Depends, HTTPException, status, Header
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta
import jwt
import uuid
from enum import Enum
import os
import os
from sqlalchemy import create_engine, Column, Integer, String, Boolean, MetaData, Table
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from databases import Database

app = FastAPI(title="Discord Bot Dashboard API")

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://dca-frontend-v3.vercel.app"],  # Removed trailing slash
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Authentication
SECRET_KEY = "your-secret-key"  # In production, use a secure key and store it properly
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

# Models
class User(BaseModel):
    id: str
    username: str
    email: str
    disabled: Optional[bool] = None
    
class UserInDB(User):
    hashed_password: str

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None

class CommandType(str, Enum):
    COMMAND = "Command"
    PREFIX = "Prefix"
    MINUS = "Minus"
    REGEX = "Regex"
    CONTAINS = "Contains"

class Command(BaseModel):
    id: str
    trigger: str
    trigger_type: CommandType
    response: str
    roles: str
    channels: str
    case_sensitive: bool = False
    
class ReactionRole(BaseModel):
    id: str
    message_id: str
    channel: str
    emoji: str
    role: str
    
class YouTubeFeed(BaseModel):
    id: str
    channel_name: str
    channel_id: str
    notification_channel: str
    enabled: bool = True
    mention_everyone: bool = False
    
class LogConfig(BaseModel):
    id: str
    event_type: str
    channel: str
    enabled: bool = True
    
class AutoModRule(BaseModel):
    id: str
    name: str
    trigger_type: str
    action: str
    enabled: bool = True

# Mock database
users_db = {
    "admin": {
        "id": "1",
        "username": "admin",
        "email": "admin@example.com",
        "hashed_password": "password",  # In production, use proper password hashing
        "disabled": False,
    }
}

commands_db = [
    {
        "id": "1",
        "trigger": "!help",
        "trigger_type": CommandType.COMMAND,
        "response": "Here are the available commands: !help, !rules, !welcome",
        "roles": "Everyone",
        "channels": "All",
        "case_sensitive": False,
    },
    {
        "id": "2",
        "trigger": "!rules",
        "trigger_type": CommandType.COMMAND,
        "response": "1. Be respectful\n2. No spamming\n3. Follow Discord TOS",
        "roles": "Everyone",
        "channels": "All",
        "case_sensitive": False,
    },
    {
        "id": "3",
        "trigger": "-warn",
        "trigger_type": CommandType.MINUS,
        "response": "User has been warned!",
        "roles": "Moderator",
        "channels": "mod-commands",
        "case_sensitive": False,
    },
    {
        "id": "4",
        "trigger": "&rank",
        "trigger_type": CommandType.PREFIX,
        "response": "Your rank is: {rank}",
        "roles": "Everyone",
        "channels": "bot-commands",
        "case_sensitive": False,
    },
]

reaction_roles_db = [
    {
        "id": "1",
        "message_id": "1234567890123456",
        "channel": "roles",
        "emoji": "🎮",
        "role": "Gamer",
    },
    {
        "id": "2",
        "message_id": "1234567890123456",
        "channel": "roles",
        "emoji": "🎵",
        "role": "Music Lover",
    },
    {
        "id": "3",
        "message_id": "9876543210987654",
        "channel": "get-roles",
        "emoji": "🎨",
        "role": "Artist",
    },
]

youtube_feeds_db = [
    {
        "id": "1",
        "channel_name": "YAGPDB",
        "channel_id": "UCt4Kp23GIKCZgZ3uGhsj8Pg",
        "notification_channel": "youtube-notifications",
        "enabled": True,
        "mention_everyone": False,
    },
    {
        "id": "2",
        "channel_name": "Discord",
        "channel_id": "UC4xOVw8GrKjUyzHHZnvLSIQ",
        "notification_channel": "discord-updates",
        "enabled": True,
        "mention_everyone": True,
    },
]

logs_db = [
    {
        "id": "1",
        "event_type": "Member Join",
        "channel": "logs",
        "enabled": True,
    },
    {
        "id": "2",
        "event_type": "Member Leave",
        "channel": "logs",
        "enabled": True,
    },
    {
        "id": "3",
        "event_type": "Message Delete",
        "channel": "logs",
        "enabled": True,
    },
]

automod_rules_db = [
    {
        "id": "1",
        "name": "Anti-Spam",
        "trigger_type": "Spam",
        "action": "Delete",
        "enabled": True,
    },
    {
        "id": "2",
        "name": "Word Filter",
        "trigger_type": "Banned Words",
        "action": "Delete + Warn",
        "enabled": True,
    },
]

# Authentication functions
def get_user(username: str):
    if username in users_db:
        user_dict = users_db[username]
        return UserInDB(**user_dict)
    return None

def authenticate_user(username: str, password: str):
    user = get_user(username)
    if not user:
        return False
    if user.hashed_password != password:  # In production, use proper password verification
        return False
    return user

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def get_current_user(token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
        token_data = TokenData(username=username)
    except jwt.PyJWTError:
        raise credentials_exception
    user = get_user(username=token_data.username)
    if user is None:
        raise credentials_exception
    return user

async def get_current_active_user(current_user: User = Depends(get_current_user)):
    if current_user.disabled:
        raise HTTPException(status_code=400, detail="Inactive user")
    return current_user

# Add a bot token for authentication
BOT_TOKEN = os.getenv("BOT_TOKEN", "your-default-bot-token")  # Set this in Railway env vars

# Bot authentication dependency
async def verify_bot(token: str = Header(None)):
    if token != f"Bearer {BOT_TOKEN}":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid bot token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return True

# Database setup
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./test.db")
database = Database(DATABASE_URL)
metadata = MetaData()

# Define your tables (example)
commands = Table(
    "commands",
    metadata,
    Column("id", String, primary_key=True),
    Column("trigger", String),
    Column("trigger_type", String),
    Column("response", String),
    Column("roles", String),
    Column("channels", String),
    Column("case_sensitive", Boolean, default=False),
)

# Add startup and shutdown events
@app.on_event("startup")
async def startup():
    await database.connect()

@app.on_event("shutdown")
async def shutdown():
    await database.disconnect()

# Routes
@app.post("/token", response_model=Token)
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends()):
    user = authenticate_user(form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@app.get("/users/me", response_model=User)
async def read_users_me(current_user: User = Depends(get_current_active_user)):
    return current_user

# Commands endpoints
@app.get("/commands", response_model=List[Command])
async def get_commands(current_user: User = Depends(get_current_active_user)):
    query = commands.select()
    return await database.fetch_all(query)

@app.post("/commands", response_model=Command)
async def create_command(command: Command, current_user: User = Depends(get_current_active_user)):
    command.id = str(uuid.uuid4())
    commands_db.append(command.dict())
    return command

@app.get("/commands/{command_id}", response_model=Command)
async def get_command(command_id: str, current_user: User = Depends(get_current_active_user)):
    for command in commands_db:
        if command["id"] == command_id:
            return command
    raise HTTPException(status_code=404, detail="Command not found")

@app.put("/commands/{command_id}", response_model=Command)
async def update_command(command_id: str, command: Command, current_user: User = Depends(get_current_active_user)):
    for i, cmd in enumerate(commands_db):
        if cmd["id"] == command_id:
            command.id = command_id
            commands_db[i] = command.dict()
            return command
    raise HTTPException(status_code=404, detail="Command not found")

@app.delete("/commands/{command_id}")
async def delete_command(command_id: str, current_user: User = Depends(get_current_active_user)):
    for i, command in enumerate(commands_db):
        if command["id"] == command_id:
            del commands_db[i]
            return {"message": "Command deleted successfully"}
    raise HTTPException(status_code=404, detail="Command not found")

# Reaction Roles endpoints
@app.get("/reaction-roles", response_model=List[ReactionRole])
async def get_reaction_roles(current_user: User = Depends(get_current_active_user)):
    return reaction_roles_db

@app.post("/reaction-roles", response_model=ReactionRole)
async def create_reaction_role(reaction_role: ReactionRole, current_user: User = Depends(get_current_active_user)):
    reaction_role.id = str(uuid.uuid4())
    reaction_roles_db.append(reaction_role.dict())
    return reaction_role

@app.get("/reaction-roles/{reaction_role_id}", response_model=ReactionRole)
async def get_reaction_role(reaction_role_id: str, current_user: User = Depends(get_current_active_user)):
    for role in reaction_roles_db:
        if role["id"] == reaction_role_id:
            return role
    raise HTTPException(status_code=404, detail="Reaction role not found")

@app.put("/reaction-roles/{reaction_role_id}", response_model=ReactionRole)
async def update_reaction_role(reaction_role_id: str, reaction_role: ReactionRole, current_user: User = Depends(get_current_active_user)):
    for i, role in enumerate(reaction_roles_db):
        if role["id"] == reaction_role_id:
            reaction_role.id = reaction_role_id
            reaction_roles_db[i] = reaction_role.dict()
            return reaction_role
    raise HTTPException(status_code=404, detail="Reaction role not found")

@app.delete("/reaction-roles/{reaction_role_id}")
async def delete_reaction_role(reaction_role_id: str, current_user: User = Depends(get_current_active_user)):
    for i, role in enumerate(reaction_roles_db):
        if role["id"] == reaction_role_id:
            del reaction_roles_db[i]
            return {"message": "Reaction role deleted successfully"}
    raise HTTPException(status_code=404, detail="Reaction role not found")

# YouTube Feeds endpoints
@app.get("/youtube-feeds", response_model=List[YouTubeFeed])
async def get_youtube_feeds(current_user: User = Depends(get_current_active_user)):
    return youtube_feeds_db

@app.post("/youtube-feeds", response_model=YouTubeFeed)
async def create_youtube_feed(youtube_feed: YouTubeFeed, current_user: User = Depends(get_current_active_user)):
    youtube_feed.id = str(uuid.uuid4())
    youtube_feeds_db.append(youtube_feed.dict())
    return youtube_feed

@app.get("/youtube-feeds/{youtube_feed_id}", response_model=YouTubeFeed)
async def get_youtube_feed(youtube_feed_id: str, current_user: User = Depends(get_current_active_user)):
    for feed in youtube_feeds_db:
        if feed["id"] == youtube_feed_id:
            return feed
    raise HTTPException(status_code=404, detail="YouTube feed not found")

@app.put("/youtube-feeds/{youtube_feed_id}", response_model=YouTubeFeed)
async def update_youtube_feed(youtube_feed_id: str, youtube_feed: YouTubeFeed, current_user: User = Depends(get_current_active_user)):
    for i, feed in enumerate(youtube_feeds_db):
        if feed["id"] == youtube_feed_id:
            youtube_feed.id = youtube_feed_id
            youtube_feeds_db[i] = youtube_feed.dict()
            return youtube_feed
    raise HTTPException(status_code=404, detail="YouTube feed not found")

@app.delete("/youtube-feeds/{youtube_feed_id}")
async def delete_youtube_feed(youtube_feed_id: str, current_user: User = Depends(get_current_active_user)):
    for i, feed in enumerate(youtube_feeds_db):
        if feed["id"] == youtube_feed_id:
            del youtube_feeds_db[i]
            return {"message": "YouTube feed deleted successfully"}
    raise HTTPException(status_code=404, detail="YouTube feed not found")

# Logs endpoints
@app.get("/logs", response_model=List[LogConfig])
async def get_logs(current_user: User = Depends(get_current_active_user)):
    return logs_db

@app.post("/logs", response_model=LogConfig)
async def create_log(log: LogConfig, current_user: User = Depends(get_current_active_user)):
    log.id = str(uuid.uuid4())
    logs_db.append(log.dict())
    return log

@app.put("/logs/{log_id}", response_model=LogConfig)
async def update_log(log_id: str, log: LogConfig, current_user: User = Depends(get_current_active_user)):
    for i, l in enumerate(logs_db):
        if l["id"] == log_id:
            log.id = log_id
            logs_db[i] = log.dict()
            return log
    raise HTTPException(status_code=404, detail="Log configuration not found")

@app.delete("/logs/{log_id}")
async def delete_log(log_id: str, current_user: User = Depends(get_current_active_user)):
    for i, log in enumerate(logs_db):
        if log["id"] == log_id:
            del logs_db[i]
            return {"message": "Log configuration deleted successfully"}
    raise HTTPException(status_code=404, detail="Log configuration not found")

# AutoMod Rules endpoints
@app.get("/automod-rules", response_model=List[AutoModRule])
async def get_automod_rules(current_user: User = Depends(get_current_active_user)):
    return automod_rules_db

@app.post("/automod-rules", response_model=AutoModRule)
async def create_automod_rule(rule: AutoModRule, current_user: User = Depends(get_current_active_user)):
    rule.id = str(uuid.uuid4())
    automod_rules_db.append(rule.dict())
    return rule

@app.put("/automod-rules/{rule_id}", response_model=AutoModRule)
async def update_automod_rule(rule_id: str, rule: AutoModRule, current_user: User = Depends(get_current_active_user)):
    for i, r in enumerate(automod_rules_db):
        if r["id"] == rule_id:
            rule.id = rule_id
            automod_rules_db[i] = rule.dict()
            return rule
    raise HTTPException(status_code=404, detail="AutoMod rule not found")

@app.delete("/automod-rules/{rule_id}")
async def delete_automod_rule(rule_id: str, current_user: User = Depends(get_current_active_user)):
    for i, rule in enumerate(automod_rules_db):
        if rule["id"] == rule_id:
            del automod_rules_db[i]
            return {"message": "AutoMod rule deleted successfully"}
    raise HTTPException(status_code=404, detail="AutoMod rule not found")

# Server stats endpoint
@app.get("/server-stats")
async def get_server_stats(current_user: User = Depends(get_current_active_user)):
    return {
        "total_commands_used": 1234,
        "active_users": 89,
        "moderation_actions": 23,
        "messages_today": 567,
        "new_members_week": 12,
        "top_channels": [
            {"name": "general", "messages": 345},
            {"name": "gaming", "messages": 234},
            {"name": "music", "messages": 123},
        ]
    }

# Bot status endpoint
@app.get("/bot-status")
async def get_bot_status(current_user: User = Depends(get_current_active_user)):
    return {
        "auto_moderation": True,
        "welcome_messages": True,
        "logging": False,
        "uptime": "3 days, 7 hours",
        "version": "1.2.3",
        "servers": 42,
        "commands_registered": 25,
    }

# Welcome configuration endpoint for the bot
@app.get("/welcome-config")
async def get_welcome_config(guild_id: Optional[str] = None, verified: bool = Depends(verify_bot)):
    # In a real implementation, you would fetch this from a database based on guild_id
    return {
        "channel": "welcome",
        "message": "Welcome {user} to {server}! Please read the rules in #rules.",
        "send_dm": False,
        "assign_role": True,
        "role": "Member"
    }

# Reaction roles endpoint for the bot
@app.get("/bot/reaction-roles")
async def get_bot_reaction_roles(guild_id: Optional[str] = None, verified: bool = Depends(verify_bot)):
    # Return reaction roles for the bot to set up
    return reaction_roles_db

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

          
